"use client";

import * as React from "react";
import { SlidersHorizontal, ChevronLeft, ChevronRight } from "lucide-react";
import type { Facets } from "@/lib/types";
import type { CardProduct } from "@/lib/card-product";
import { ProductCard } from "./product-card";
import { Filters, type FilterState } from "./filters";
import { Button } from "./ui/button";
import { Skeleton } from "./ui/skeleton";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "./ui/select";
import { Sheet, SheetContent, SheetHeader, SheetTitle, SheetTrigger } from "./ui/sheet";
import { useLang } from "./lang-provider";
import { cn } from "@/lib/utils";

const PAGE_SIZE = 15;

type SortKey = "featured" | "price-asc" | "price-desc" | "name-asc";

/** Compact page list with ellipses, e.g. [1, "…", 5, 6, 7, "…", 33]. */
function pageList(current: number, total: number): (number | "…")[] {
  const out: (number | "…")[] = [];
  const keep = (i: number) => i === 1 || i === total || (i >= current - 1 && i <= current + 1);
  let prev = 0;
  for (let i = 1; i <= total; i++) {
    if (!keep(i)) continue;
    if (prev && i - prev === 2) out.push(prev + 1);
    else if (prev && i - prev > 2) out.push("…");
    out.push(i);
    prev = i;
  }
  return out;
}

function emptyFilters(facets: Facets): FilterState {
  return {
    search: "",
    categories: [],
    colors: [],
    sizes: [],
    price: [facets.priceMin, facets.priceMax],
    inStockOnly: false,
    onSaleOnly: false,
  };
}

/**
 * The URL params arrive as PROPS from the server page rather than via
 * useSearchParams(). That hook forces its subtree into a client-only Suspense
 * boundary, and on a hard load of /shop that boundary never resolved, so the
 * grid sat on skeletons forever for anyone arriving from search, a shared link,
 * a bookmark or a refresh. The page is already server-rendered on demand, so it
 * can just hand us the params, and a client-side nav to ?category=... re-renders
 * the server component and pushes new props down.
 */
export function ShopClient({
  categoryParam = "",
  saleParam = false,
  qParam = "",
}: {
  categoryParam?: string;
  saleParam?: boolean;
  qParam?: string;
}) {
  const { t: dict } = useLang();
  const t = dict.shop;
  const SORTS: { value: SortKey; label: string }[] = [
    { value: "featured", label: t.sortFeatured },
    { value: "price-asc", label: t.sortPriceAsc },
    { value: "price-desc", label: t.sortPriceDesc },
    { value: "name-asc", label: t.sortNameAsc },
  ];
  const [products, setProducts] = React.useState<CardProduct[] | null>(null);
  const [facets, setFacets] = React.useState<Facets | null>(null);
  const [filters, setFilters] = React.useState<FilterState | null>(null);
  const [sort, setSort] = React.useState<SortKey>("featured");
  const [page, setPage] = React.useState(1);
  const topRef = React.useRef<HTMLDivElement>(null);

  // Load data + facets once, then seed filters (respecting URL params).
  React.useEffect(() => {
    let active = true;
    // Slim card/facet projection (~0.7 MB) instead of the full 7.6 MB dataset.
    Promise.all([
      fetch("/data/shop-list.json").then((r) => r.json()),
      fetch("/data/facets.json").then((r) => r.json()),
    ]).then(([p, f]: [CardProduct[], Facets]) => {
      if (!active) return;
      setProducts(p);
      setFacets(f);
      const base = emptyFilters(f);
      const cat = categoryParam;
      if (cat && f.categories.some((c) => c.name === cat)) base.categories = [cat];
      if (saleParam) base.onSaleOnly = true;
      const q = qParam;
      if (q) base.search = q;
      setFilters(base);
    });
    return () => {
      active = false;
    };
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  // Keep the search in sync with the URL `q` so a navbar search updates results
  // even when we're already on /shop (the initial seed effect only runs once).
  React.useEffect(() => {
    setFilters((f) => (f && f.search !== qParam ? { ...f, search: qParam } : f));
  }, [qParam]);

  // Same for the `category` param. Navbar category links point at
  // /shop?category=…, so when we're ALREADY on /shop a click only changes the
  // query string — the page does NOT remount, so the seed effect above never
  // re-runs and the grid would stay stuck on the previous category. Sync it here
  // so switching categories from the nav actually re-filters. (Manual sidebar
  // changes don't touch the URL, so this only fires on real navigations and
  // never clobbers a hand-picked filter.)
  const catParam = categoryParam;
  React.useEffect(() => {
    if (!facets) return;
    const next =
      catParam && facets.categories.some((c) => c.name === catParam) ? [catParam] : [];
    setFilters((f) => {
      if (!f) return f;
      const same =
        next.length === f.categories.length && next.every((c) => f.categories.includes(c));
      return same ? f : { ...f, categories: next };
    });
  }, [catParam, facets]);

  // Same for the Outlet link (/shop?sale=1).
  React.useEffect(() => {
    setFilters((f) => (f && f.onSaleOnly !== saleParam ? { ...f, onSaleOnly: saleParam } : f));
  }, [saleParam]);

  const { filtered, viewFacets } = React.useMemo(() => {
    if (!products || !filters || !facets) {
      return { filtered: [] as CardProduct[], viewFacets: facets };
    }
    const q = filters.search.trim().toLowerCase();

    // Base set: every active filter EXCEPT colour + size. The available colour
    // and size options are derived from this, so the sidebar only shows values
    // that actually exist for the current category/search/price (e.g. just the
    // 27 tie colours and the single "ONE" size when browsing Ties).
    const base = products.filter((p) => {
      if (q && !(`${p.title} ${p.category} ${p.titleOriginal}`.toLowerCase().includes(q))) return false;
      if (filters.categories.length && !filters.categories.includes(p.category)) return false;
      if (p.price < filters.price[0] || p.price > filters.price[1]) return false;
      if (filters.inStockOnly && !p.available) return false;
      if (filters.onSaleOnly && !p.onSale) return false;
      return true;
    });

    const colorCount = new Map<string, number>();
    const sizeSet = new Set<string>();
    base.forEach((p) => {
      p.colors.forEach((c) => colorCount.set(c.name, (colorCount.get(c.name) ?? 0) + 1));
      p.sizes.forEach((s) => sizeSet.add(s));
    });
    // Order sizes by the canonical facet order; append any product sizes the
    // facet list doesn't carry (e.g. "ONE").
    const orderedSizes = facets.sizes.filter((s) => sizeSet.has(s));
    const extraSizes = [...sizeSet].filter((s) => !facets.sizes.includes(s));
    const vf: Facets = {
      ...facets,
      // Only the colours present in the current view, with counts recomputed for
      // that view so the numbers always match what's actually shown.
      colors: facets.colors
        .filter((c) => colorCount.has(c.name))
        .map((c) => ({ ...c, count: colorCount.get(c.name) ?? c.count })),
      sizes: [...orderedSizes, ...extraSizes],
    };

    let out = base.filter((p) => {
      if (filters.colors.length && !p.colors.some((c) => filters.colors.includes(c.name))) return false;
      if (filters.sizes.length && !p.sizes.some((s) => filters.sizes.includes(s))) return false;
      return true;
    });
    out = [...out];
    if (sort === "price-asc") out.sort((a, b) => a.price - b.price);
    else if (sort === "price-desc") out.sort((a, b) => b.price - a.price);
    else if (sort === "name-asc") out.sort((a, b) => a.title.localeCompare(b.title));
    return { filtered: out, viewFacets: vf };
  }, [products, filters, sort, facets]);

  const loading = !products || !facets || !filters;

  // Pagination — 15 products per page.
  const totalPages = Math.max(1, Math.ceil(filtered.length / PAGE_SIZE));
  const currentPage = Math.min(page, totalPages);
  const paged = filtered.slice((currentPage - 1) * PAGE_SIZE, currentPage * PAGE_SIZE);

  // Reset to page 1 whenever the result set changes (filter / sort / search).
  React.useEffect(() => {
    setPage(1);
  }, [filters, sort]);

  const goToPage = (p: number) => {
    const next = Math.min(Math.max(1, p), totalPages);
    setPage(next);
    const el = topRef.current;
    if (el) window.scrollTo({ top: el.getBoundingClientRect().top + window.scrollY - 90, behavior: "smooth" });
  };

  return (
    <div ref={topRef} className="container py-8 lg:py-12">
      {/* Page heading */}
      <div className="mb-8 border-b border-border pb-6">
        <span className="chip-beige">{t.eyebrow}</span>
        <h1 className="mt-4 font-display text-4xl font-medium text-navy md:text-5xl">{t.title}</h1>
      </div>

      <div className="grid gap-10 lg:grid-cols-[260px_1fr]">
        {/* Desktop sidebar */}
        <aside className="hidden lg:block">
          {facets && filters && (
            <Filters
              facets={viewFacets!}
              value={filters}
              onChange={setFilters}
              onReset={() => setFilters(emptyFilters(facets))}
            />
          )}
        </aside>

        {/* Results */}
        <div>
          {/* Top bar */}
          <div className="mb-6 flex items-center justify-between gap-4">
            <p className="text-sm text-muted-foreground">
              {loading ? t.loading : `${filtered.length} ${filtered.length === 1 ? t.productOne : t.productMany}`}
            </p>

            <div className="flex items-center gap-2">
              {/* Mobile filters */}
              {facets && filters && (
                <Sheet>
                  <SheetTrigger asChild>
                    <Button variant="outline" size="sm" className="lg:hidden">
                      <SlidersHorizontal className="h-4 w-4" />
                      {t.filters}
                    </Button>
                  </SheetTrigger>
                  <SheetContent side="left" className="on-dark w-[88%] overflow-y-auto bg-[hsl(var(--section-navy))] p-4 text-foreground sm:max-w-sm">
                    <SheetHeader className="p-1 pb-3">
                      <SheetTitle>{t.filters}</SheetTitle>
                    </SheetHeader>
                    <Filters
                      facets={viewFacets!}
                      value={filters}
                      onChange={setFilters}
                      onReset={() => setFilters(emptyFilters(facets))}
                    />
                  </SheetContent>
                </Sheet>
              )}

              <Select value={sort} onValueChange={(v) => setSort(v as SortKey)}>
                <SelectTrigger className="w-[190px]" aria-label={t.sort}>
                  <SelectValue placeholder={t.sort} />
                </SelectTrigger>
                <SelectContent>
                  {SORTS.map((s) => (
                    <SelectItem key={s.value} value={s.value}>
                      {s.label}
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
            </div>
          </div>

          {/* Grid */}
          {loading ? (
            <div className="grid grid-cols-2 gap-x-5 gap-y-9 md:grid-cols-3">
              {Array.from({ length: 9 }).map((_, i) => (
                <div key={i}>
                  <Skeleton className="aspect-[3/4] w-full" />
                  <Skeleton className="mt-4 h-3 w-1/3" />
                  <Skeleton className="mt-2 h-4 w-2/3" />
                  <Skeleton className="mt-2 h-3 w-1/4" />
                </div>
              ))}
            </div>
          ) : filtered.length === 0 ? (
            <div className="flex flex-col items-center justify-center gap-3 py-24 text-center">
              <p className="font-serif text-xl">{t.emptyTitle}</p>
              <p className="text-sm text-muted-foreground">{t.emptyText}</p>
              <Button
                variant="outline"
                className="mt-2"
                onClick={() => setFilters(emptyFilters(facets!))}
              >
                {t.resetFilters}
              </Button>
            </div>
          ) : (
            <>
              <div className="grid grid-cols-2 gap-x-5 gap-y-9 md:grid-cols-3">
                {paged.map((p) => (
                  <ProductCard key={p.id} product={p} />
                ))}
              </div>

              {totalPages > 1 && (
                <nav
                  aria-label="Pagination"
                  className="mt-14 flex flex-wrap items-center justify-center gap-1.5"
                >
                  <button
                    onClick={() => goToPage(currentPage - 1)}
                    disabled={currentPage === 1}
                    aria-label={t.prev}
                    className="inline-flex h-10 items-center gap-1 border border-input px-2.5 text-xs font-semibold uppercase tracking-luxe transition-colors hover:border-accent hover:text-accent disabled:pointer-events-none disabled:opacity-40 sm:pl-2 sm:pr-3"
                  >
                    <ChevronLeft className="h-4 w-4" /> <span className="hidden sm:inline">{t.prev}</span>
                  </button>

                  {pageList(currentPage, totalPages).map((p, i) =>
                    p === "…" ? (
                      <span key={`e${i}`} className="px-1.5 text-sm text-muted-foreground">
                        …
                      </span>
                    ) : (
                      <button
                        key={p}
                        onClick={() => goToPage(p)}
                        aria-current={p === currentPage ? "page" : undefined}
                        className={cn(
                          "inline-flex h-10 min-w-10 items-center justify-center border px-2 text-sm font-semibold transition-colors",
                          p === currentPage
                            ? "border-accent bg-accent text-accent-foreground"
                            : "border-input text-foreground/80 hover:border-accent hover:text-accent"
                        )}
                      >
                        {p}
                      </button>
                    )
                  )}

                  <button
                    onClick={() => goToPage(currentPage + 1)}
                    disabled={currentPage === totalPages}
                    aria-label={t.next}
                    className="inline-flex h-10 items-center gap-1 border border-input px-2.5 text-xs font-semibold uppercase tracking-luxe transition-colors hover:border-accent hover:text-accent disabled:pointer-events-none disabled:opacity-40 sm:pl-3 sm:pr-2"
                  >
                    <span className="hidden sm:inline">{t.next}</span> <ChevronRight className="h-4 w-4" />
                  </button>
                </nav>
              )}
            </>
          )}
        </div>
      </div>
    </div>
  );
}
