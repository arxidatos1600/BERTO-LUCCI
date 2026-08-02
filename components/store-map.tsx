"use client";

import * as React from "react";
import { MapPin, Phone, Clock, ArrowRight, Search } from "lucide-react";
import { cn } from "@/lib/utils";

export interface StoresCopy {
  eyebrow: string;
  title: string;
  subtitle: string;
  boutiquesLabel: string;
  flagshipLabel: string;
  flagshipCity: string;
  flagshipAddress: string;
  flagshipHours: string;
  directions: string;
  groups: { group: string; stores: string[][] }[];
  // Added strings (see i18n)
  searchPlaceholder: string;
  allRegions: string;
  selectStore: string;
  callLabel: string;
  /** Shown when the search / region filter matches no boutique. */
  noResults: string;
}

interface Store {
  city: string;
  address: string;
  phone: string;
  region: string;
  flagship?: boolean;
}

function mapSrc(s: Store) {
  const q = encodeURIComponent(`${s.address}, ${s.city}, Greece`);
  return `https://www.google.com/maps?q=${q}&output=embed`;
}
function directionsHref(s: Store) {
  const q = encodeURIComponent(`${s.address}, ${s.city}, Greece`);
  return `https://www.google.com/maps/dir/?api=1&destination=${q}`;
}

/**
 * Interactive store locator. A live Google map on the left re-centres on the
 * boutique selected from the searchable, region-filtered list on the right.
 * The flagship is pinned to the top and shown first.
 */
export function StoreMap({ t }: { t: StoresCopy }) {
  const stores: Store[] = React.useMemo(() => {
    const flagship: Store = {
      city: t.flagshipCity,
      address: t.flagshipAddress,
      phone: "210 524 6634",
      region: t.groups[0]?.group ?? "",
      flagship: true,
    };
    const rest = t.groups.flatMap((g) =>
      g.stores.map(([city, address, phone]) => ({ city, address, phone, region: g.group }))
    );
    return [flagship, ...rest];
  }, [t]);

  const regions = React.useMemo(() => [t.allRegions, ...t.groups.map((g) => g.group)], [t]);
  const [region, setRegion] = React.useState(t.allRegions);
  const [query, setQuery] = React.useState("");
  const [selected, setSelected] = React.useState<Store>(stores[0]);

  // A language switch re-renders this client component in place (router.refresh,
  // no remount) with a rebuilt, new-language `stores` array — but `selected`
  // would keep pointing at the old-language Store object, so the list highlight,
  // overlay card and map iframe all go stale. `stores` only changes identity
  // when the dictionary `t` changes, so this resyncs to the flagship on mount
  // and on locale change only, never during normal boutique selection.
  React.useEffect(() => {
    setSelected(stores[0]);
  }, [stores]);

  const filtered = stores.filter((s) => {
    if (region !== t.allRegions && s.region !== region) return false;
    if (query) {
      const q = query.toLowerCase();
      if (!`${s.city} ${s.address}`.toLowerCase().includes(q)) return false;
    }
    return true;
  });

  return (
    <div className="grid overflow-hidden rounded-sm border border-border bg-card lg:grid-cols-[1.15fr_0.85fr]">
      {/* ---- Live map + selected store card ---- */}
      <div className="relative min-h-[360px] lg:min-h-[560px]">
        {/* No `key` here on purpose. Keying on the selection tore the iframe out
            of the DOM and built a new one on every boutique click, which meant a
            cold Google Maps bootstrap (fresh document, scripts, tiles) each time.
            Updating `src` in place navigates the SAME iframe, so the embed is
            fetched once and only the map location changes. */}
        <iframe
          title={`${selected.city} · ${selected.address}`}
          src={mapSrc(selected)}
          loading="lazy"
          referrerPolicy="no-referrer-when-downgrade"
          className="absolute inset-0 h-full w-full grayscale-[0.2] contrast-[1.05]"
        />
        {/* Selected store overlay card */}
        <div className="pointer-events-none absolute inset-x-0 bottom-0 p-4 sm:p-5">
          <div className="pointer-events-auto max-w-sm border border-border bg-card/95 p-5 shadow-lg backdrop-blur">
            <div className="flex items-center gap-2">
              {selected.flagship && (
                <span className="rounded-full bg-accent px-2 py-0.5 text-[9px] font-semibold uppercase tracking-luxe text-accent-foreground">
                  {t.flagshipLabel}
                </span>
              )}
              <span className="text-[10px] uppercase tracking-luxe text-muted-foreground">{selected.region}</span>
            </div>
            <h3 className="mt-2 font-display text-2xl font-medium text-navy">{selected.city}</h3>
            <div className="mt-3 space-y-1.5 text-sm text-foreground/80">
              <p className="flex items-start gap-2">
                <MapPin className="mt-0.5 h-4 w-4 shrink-0 text-accent" /> {selected.address}
              </p>
              {selected.flagship && (
                <p className="flex items-center gap-2">
                  <Clock className="h-4 w-4 shrink-0 text-accent" /> {t.flagshipHours}
                </p>
              )}
              <a
                href={`tel:+30${selected.phone.replace(/\s/g, "")}`}
                className="flex items-center gap-2 transition-colors hover:text-accent"
              >
                <Phone className="h-4 w-4 shrink-0 text-accent" /> {selected.phone}
              </a>
            </div>
            <a
              href={directionsHref(selected)}
              target="_blank"
              rel="noreferrer"
              className="mt-4 inline-flex items-center gap-2 border border-input px-4 py-2 text-[11px] uppercase tracking-luxe text-navy transition-colors hover:border-accent hover:text-accent"
            >
              {t.directions} <ArrowRight className="h-3.5 w-3.5" />
            </a>
          </div>
        </div>
      </div>

      {/* ---- Searchable, region-filtered store list ---- */}
      <div className="flex flex-col border-t border-border lg:border-l lg:border-t-0">
        {/* Region tabs */}
        <div className="flex flex-wrap gap-1.5 border-b border-border p-4">
          {regions.map((r) => (
            <button
              key={r}
              onClick={() => setRegion(r)}
              aria-pressed={region === r}
              className={cn(
                "rounded-full px-3 py-1.5 text-[11px] uppercase tracking-luxe transition-colors",
                region === r
                  ? "bg-primary text-primary-foreground"
                  : "bg-secondary/60 text-foreground/70 hover:bg-secondary"
              )}
            >
              {r}
            </button>
          ))}
        </div>

        {/* Search */}
        <div className="border-b border-border p-4">
          <div className="relative">
            <Search className="absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-muted-foreground" />
            <input
              value={query}
              onChange={(e) => setQuery(e.target.value)}
              placeholder={t.searchPlaceholder}
              aria-label={t.searchPlaceholder}
              className="h-10 w-full border border-input bg-background pl-9 pr-3 text-sm focus:outline-none focus:ring-1 focus:ring-ring"
            />
          </div>
        </div>

        {/* List */}
        <div className="thin-scroll max-h-[300px] overflow-y-auto lg:max-h-[400px]">
          {filtered.length === 0 && (
            <p role="status" className="px-4 py-10 text-center text-sm text-muted-foreground">
              {t.noResults}
            </p>
          )}
          {filtered.map((s) => {
            const active = s.city === selected.city && s.address === selected.address;
            return (
              <button
                key={s.city + s.address}
                onClick={() => setSelected(s)}
                aria-pressed={active}
                className={cn(
                  "group flex w-full items-start gap-3 border-b border-border px-4 py-3.5 text-left transition-colors",
                  active ? "bg-accent/10" : "hover:bg-secondary/50"
                )}
              >
                <span
                  className={cn(
                    "mt-0.5 flex h-8 w-8 shrink-0 items-center justify-center rounded-full transition-colors",
                    active ? "bg-accent text-accent-foreground" : "bg-secondary text-accent group-hover:bg-accent/20"
                  )}
                >
                  <MapPin className="h-4 w-4" />
                </span>
                <span className="min-w-0 flex-1">
                  <span className="flex items-center gap-2">
                    <span className={cn("font-serif text-[15px]", active ? "text-navy" : "text-foreground")}>{s.city}</span>
                    {s.flagship && <span className="text-[9px] uppercase tracking-luxe text-accent">{t.flagshipLabel}</span>}
                  </span>
                  <span className="mt-0.5 block truncate text-xs text-muted-foreground">{s.address}</span>
                </span>
                <span className="shrink-0 self-center text-[10px] uppercase tracking-luxe text-muted-foreground opacity-0 transition-opacity group-hover:opacity-100">
                  {t.selectStore}
                </span>
              </button>
            );
          })}
        </div>
      </div>
    </div>
  );
}
