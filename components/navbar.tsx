"use client";

import * as React from "react";
import Link from "next/link";
import { usePathname, useRouter } from "next/navigation";
import {
  Menu,
  Search,
  User,
  Heart,
  ShoppingBag,
  MapPin,
  Phone,
  ArrowRight,
  X,
} from "lucide-react";
import { toast } from "sonner";
import { cn } from "@/lib/utils";
import { getDictionary, type Lang } from "@/lib/i18n";
import { getMegaMenu } from "@/lib/menu";
import { useCart } from "@/store/cart";
import { Button } from "./ui/button";
import { LangToggle } from "./lang-toggle";
import { SmartImage } from "./smart-image";
import { SocialLinks } from "./social-links";
import {
  Sheet,
  SheetContent,
  SheetHeader,
  SheetTitle,
  SheetTrigger,
  SheetClose,
} from "./ui/sheet";

/** Nav targets stay constant (the `category` query is matched against the
 *  English data); only the displayed label is localized via the dictionary. */
const NAV_ITEMS = [
  { key: "shop", href: "/shop" },
  { key: "ties", href: "/shop?category=Ties" },
  { key: "shirts", href: "/shop?category=Formal+Shirts" },
  { key: "suits", href: "/shop?category=Suits" },
  { key: "knitwear", href: "/shop?category=Knitwear" },
  { key: "outlet", href: "/shop?sale=1" },
  { key: "story", href: "/about" },
] as const;

export function Navbar({
  lang,
  menuImage,
}: {
  lang: Lang;
  menuImage: { local: string; fallback: string; handle: string };
}) {
  const t = getDictionary(lang).nav;
  const menu = getMegaMenu(lang);
  const pathname = usePathname();
  const router = useRouter();
  const openCart = useCart((s) => s.open);
  const count = useCart((s) => s.items.reduce((n, i) => n + i.quantity, 0));
  const [mounted, setMounted] = React.useState(false);
  const [scrolled, setScrolled] = React.useState(false);
  const [megaOpen, setMegaOpen] = React.useState(false);
  const [q, setQ] = React.useState("");
  const [searchOpen, setSearchOpen] = React.useState(false);

  // Hover-intent for the Shop mega-menu: opening is instant, closing waits a
  // beat so the cursor can travel from the "Shop" link down into the panel
  // without the menu flickering shut. It stays open the whole time the cursor
  // is over the trigger OR the panel, and closes once it leaves both.
  const megaTimer = React.useRef<ReturnType<typeof setTimeout> | null>(null);
  const openMega = React.useCallback(() => {
    if (megaTimer.current) clearTimeout(megaTimer.current);
    setMegaOpen(true);
  }, []);
  const closeMegaSoon = React.useCallback(() => {
    if (megaTimer.current) clearTimeout(megaTimer.current);
    megaTimer.current = setTimeout(() => setMegaOpen(false), 160);
  }, []);
  React.useEffect(() => () => { if (megaTimer.current) clearTimeout(megaTimer.current); }, []);

  React.useEffect(() => setMounted(true), []);
  React.useEffect(() => {
    const onScroll = () => setScrolled(window.scrollY > 160);
    onScroll();
    window.addEventListener("scroll", onScroll, { passive: true });
    return () => window.removeEventListener("scroll", onScroll);
  }, []);

  function submitSearch(e: React.FormEvent) {
    e.preventDefault();
    const term = q.trim();
    router.push(term ? `/shop?q=${encodeURIComponent(term)}` : "/shop");
    setSearchOpen(false);
  }

  const CartButton = ({ className }: { className?: string }) => (
    <button
      onClick={openCart}
      aria-label="Open cart"
      className={cn("relative inline-flex h-10 w-10 items-center justify-center hover:text-accent", className)}
    >
      <ShoppingBag className="h-5 w-5" strokeWidth={1.5} />
      {mounted && count > 0 && (
        <span className="absolute right-1 top-1 flex h-4 min-w-4 items-center justify-center rounded-full bg-accent px-1 text-[10px] font-semibold text-accent-foreground">
          {count}
        </span>
      )}
    </button>
  );

  return (
    <>
      <header className="relative z-30">
      {/* ===== Announcement bar — brushed silver, distinct from the black bar ===== */}
      <div className="hidden border-b border-black/10 bg-[linear-gradient(100deg,#b6b9bf_0%,#eef0f3_34%,#d0d3d9_60%,#f3f5f8_100%)] text-[#1b1b1e] md:block">
        <div className="container flex h-9 items-center justify-center text-[11px] font-semibold uppercase tracking-luxe [text-shadow:0_1px_0_rgba(255,255,255,0.55)]">
          {t.announce}
        </div>
      </div>

      {/* ===== Main bar (desktop) — navy band ===== */}
      <div className="on-dark hidden border-b border-[hsl(var(--navy-700))] bg-[hsl(var(--section-navy))] text-[hsl(var(--cream))] md:block">
        <div className="container grid grid-cols-3 items-center gap-4 py-6">
          {/* Left — socials + contact */}
          <div className="flex flex-col gap-2.5">
            <SocialLinks variant="bare" size={19} tone="light" />
            <div className="flex items-center gap-4 text-xs text-muted-foreground">
              <Link href="/about" className="flex items-center gap-1 hover:text-foreground">
                <MapPin className="h-3.5 w-3.5" /> {t.stores}
              </Link>
              <a href="tel:+302105246634" className="flex items-center gap-1 hover:text-foreground">
                <Phone className="h-3.5 w-3.5" /> +30 210 524 6634
              </a>
            </div>
            <p className="text-[11px] text-muted-foreground">{t.customerService}</p>
          </div>

          {/* Center — big logo */}
          <div className="flex justify-center">
            <Link href="/" aria-label="Berto Lucci Milano — home">
              <img
                src="/brand/logo_full.svg"
                alt="Berto Lucci Milano"
                className="h-20 w-auto opacity-95 [filter:brightness(0)_invert(1)] lg:h-24"
                width={228}
                height={122}
              />
            </Link>
          </div>

          {/* Right — language, search, account, wishlist, cart */}
          <div className="flex items-center justify-end gap-2">
            <LangToggle lang={lang} className="hidden px-2 lg:flex" />
            <form onSubmit={submitSearch} className="hidden items-center lg:flex">
              <input
                value={q}
                onChange={(e) => setQ(e.target.value)}
                placeholder={t.searchPlaceholder}
                aria-label={t.search}
                className="h-9 w-36 border border-input bg-card px-3 text-sm focus:outline-none focus:ring-1 focus:ring-ring xl:w-44"
              />
              <button
                type="submit"
                aria-label={t.search}
                className="flex h-9 w-9 items-center justify-center border border-l-0 border-input hover:bg-secondary"
              >
                <Search className="h-4 w-4" />
              </button>
            </form>
            <Link
              href="/login"
              aria-label="Account"
              className="inline-flex h-10 w-10 items-center justify-center hover:text-accent"
            >
              <User className="h-5 w-5" strokeWidth={1.5} />
            </Link>
            <button
              onClick={() => toast(t.wishlistSoon)}
              aria-label="Wishlist"
              className="inline-flex h-10 w-10 items-center justify-center hover:text-accent"
            >
              <Heart className="h-5 w-5" strokeWidth={1.5} />
            </button>
            <CartButton />
          </div>
        </div>
      </div>

      </header>

      {/* ===== Sticky bar (body-level sibling so it sticks across the whole page) ===== */}
      <div
        className={cn(
          "sticky top-0 z-40 border-b bg-background/95 backdrop-blur transition-shadow",
          scrolled ? "border-border shadow-sm" : "border-border"
        )}
      >
        <div className="container flex h-16 items-center md:h-12">
          {/* --- Mobile: hamburger | logo | cart --- */}
          <div className="flex w-full items-center justify-between md:hidden">
            <MobileMenu lang={lang} />
            <Link href="/" aria-label="Berto Lucci Milano — home" className="absolute left-1/2 -translate-x-1/2">
              <img src="/brand/logo_full.svg" alt="Berto Lucci Milano" className="h-14 w-auto" width={228} height={122} />
            </Link>
            <div className="flex items-center">
              <button
                onClick={() => setSearchOpen((o) => !o)}
                aria-label={t.search}
                aria-expanded={searchOpen}
                className="inline-flex h-10 w-10 items-center justify-center hover:text-accent"
              >
                {searchOpen ? <X className="h-5 w-5" /> : <Search className="h-5 w-5" strokeWidth={1.5} />}
              </button>
              <CartButton />
            </div>
          </div>

          {/* --- Desktop: small logo (on scroll) | nav | search/cart --- */}
          <div className="hidden w-full items-center md:flex">
            <div className="flex w-24 items-center lg:w-40">
              <Link
                href="/"
                aria-label="Berto Lucci Milano — home"
                // Hidden by opacity before scroll, so it must leave the tab order
                // too — otherwise keyboard users land on an invisible target with
                // no focus indicator (WCAG 2.4.7).
                tabIndex={scrolled ? undefined : -1}
                aria-hidden={scrolled ? undefined : true}
                className={cn("transition-opacity duration-300", scrolled ? "opacity-100" : "pointer-events-none opacity-0")}
              >
                <img src="/brand/logo_text.svg" alt="Berto Lucci Milano" className="h-4 w-auto" width={187} height={31} />
              </Link>
            </div>

            <nav
              className="flex flex-1 items-center justify-center gap-3 lg:gap-5 xl:gap-7"
              onMouseLeave={closeMegaSoon}
            >
              {NAV_ITEMS.map((item) => {
                const active = pathname === item.href.split("?")[0] && item.href === "/shop";
                const hasMenu = item.key === "shop";
                return (
                  <Link
                    key={item.href}
                    href={item.href}
                    onMouseEnter={() => (hasMenu ? openMega() : setMegaOpen(false))}
                    className={cn(
                      "link-underline text-[13px] font-semibold uppercase tracking-luxe text-foreground/90 transition-colors hover:text-accent",
                      (active || (hasMenu && megaOpen)) && "text-accent"
                    )}
                  >
                    {t[item.key]}
                  </Link>
                );
              })}
            </nav>

            <div className="flex w-24 items-center justify-end gap-1 lg:w-40">
              <LangToggle lang={lang} className="lg:hidden" />
              <button
                onClick={() => setSearchOpen((o) => !o)}
                aria-label={t.search}
                aria-expanded={searchOpen}
                className="inline-flex h-9 w-9 items-center justify-center hover:text-accent"
              >
                {searchOpen ? <X className="h-[18px] w-[18px]" /> : <Search className="h-[18px] w-[18px]" strokeWidth={1.5} />}
              </button>
              <CartButton />
            </div>
          </div>
        </div>

        {/* ===== Search drop-down (mobile + desktop) ===== */}
        {searchOpen && (
          <div className="absolute inset-x-0 top-full border-b border-border bg-background/98 shadow-[0_24px_48px_-28px_hsl(var(--navy)/0.4)] backdrop-blur">
            <form onSubmit={submitSearch} className="container flex items-center gap-2 py-3">
              <div className="relative flex-1">
                <Search className="pointer-events-none absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-muted-foreground" />
                <input
                  autoFocus
                  value={q}
                  onChange={(e) => setQ(e.target.value)}
                  placeholder={t.searchPlaceholder}
                  aria-label={t.search}
                  className="h-11 w-full border border-input bg-card pl-9 pr-3 text-sm focus:border-accent focus:outline-none"
                />
              </div>
              <button
                type="submit"
                className="h-11 shrink-0 bg-accent px-5 text-xs font-semibold uppercase tracking-luxe text-accent-foreground transition-colors hover:bg-accent/90"
              >
                {t.search}
              </button>
              <button
                type="button"
                onClick={() => setSearchOpen(false)}
                aria-label="Close search"
                className="inline-flex h-11 w-11 shrink-0 items-center justify-center text-muted-foreground transition-colors hover:text-foreground"
              >
                <X className="h-5 w-5" />
              </button>
            </form>
          </div>
        )}

        {/* ===== Mega-menu panel (desktop) ===== */}
        <div
          onMouseEnter={openMega}
          onMouseLeave={closeMegaSoon}
          className={cn(
            "absolute inset-x-0 top-full hidden border-b border-border bg-card shadow-[0_40px_80px_-40px_hsl(var(--navy)/0.4)] transition-all duration-300 md:block",
            megaOpen ? "visible translate-y-0 opacity-100" : "pointer-events-none invisible -translate-y-2 opacity-0"
          )}
        >
          <div className="hairline-gold absolute inset-x-0 top-0" />
          <div className="container grid grid-cols-[repeat(4,1fr)_1.3fr] gap-8 py-9">
            {menu.map((col) => (
              <div key={col.heading}>
                <p className="eyebrow-gold mb-4">{col.heading}</p>
                <ul className="space-y-2.5">
                  {col.links.map((l) => (
                    <li key={l.href}>
                      <Link
                        href={l.href}
                        onClick={() => setMegaOpen(false)}
                        className="link-underline text-sm text-foreground/75 transition-colors hover:text-accent"
                      >
                        {l.label}
                      </Link>
                    </li>
                  ))}
                </ul>
              </div>
            ))}
            <Link
              href="/shop"
              onClick={() => setMegaOpen(false)}
              className="img-zoom group relative aspect-[4/5] overflow-hidden bg-secondary"
            >
              <SmartImage
                local={menuImage.local}
                fallback={menuImage.fallback}
                alt=""
                sizes="320px"
                className="h-full w-full object-cover"
              />
              <div className="absolute inset-0 bg-gradient-to-t from-[hsl(var(--navy-900)/0.85)] via-transparent to-transparent" />
              <div className="absolute inset-x-0 bottom-0 p-5 text-[hsl(var(--cream))]">
                <p className="font-display text-xl font-medium">{t.featuredTitle}</p>
                <span className="mt-1 inline-flex items-center gap-1.5 text-[10px] uppercase tracking-luxe text-[hsl(var(--camel-light))]">
                  {t.featuredCta} <ArrowRight className="h-3 w-3" />
                </span>
              </div>
            </Link>
          </div>
        </div>
      </div>
    </>
  );
}

/* ---- Mobile slide-over menu ---- */
function MobileMenu({ lang }: { lang: Lang }) {
  const t = getDictionary(lang).nav;
  return (
    <Sheet>
      <SheetTrigger asChild>
        <Button variant="ghost" size="icon" aria-label="Open menu">
          <Menu className="h-5 w-5" />
        </Button>
      </SheetTrigger>
      <SheetContent side="left" className="w-80">
        <SheetHeader>
          <SheetTitle>
            <img src="/brand/logo_full.svg" alt="Berto Lucci Milano" className="h-16 w-auto" width={228} height={122} />
          </SheetTitle>
        </SheetHeader>
        <div className="flex flex-col px-6">
          {NAV_ITEMS.map((item) => (
            <SheetClose asChild key={item.href}>
              <Link href={item.href} className="border-b border-border py-3 text-sm uppercase tracking-luxe">
                {t[item.key]}
              </Link>
            </SheetClose>
          ))}
        </div>
        <div className="mt-auto space-y-3 px-6 pb-8">
          <LangToggle lang={lang} />
          <SocialLinks variant="bare" size={20} tone="dark" />
          <a href="tel:+302105246634" className="block text-sm text-muted-foreground">+30 210 524 6634</a>
          <p className="text-xs text-muted-foreground">{t.customerService}</p>
        </div>
      </SheetContent>
    </Sheet>
  );
}
