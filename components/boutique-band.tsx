"use client";

import * as React from "react";
import Link from "next/link";
import { MapPin, ArrowRight } from "lucide-react";
import { cn } from "@/lib/utils";

export interface StorePhoto {
  /** Path prefix under /public without the width suffix or extension,
   *  e.g. "/stores/store-exterior" → store-exterior-768.webp / -768.jpg. */
  base: string;
  /** Pre-generated rung widths, ascending. Capped at the source width — these
   *  photos are 1050–1400px originals, so there is nothing above that to serve. */
  widths: number[];
  alt: string;
  /** Tailwind object-position class, tuned per photo so the storefront + signage stay in frame. */
  pos?: string;
}

const srcSet = (base: string, widths: number[], ext: string) =>
  widths.map((w) => `${base}-${w}.${ext} ${w}w`).join(", ");

/**
 * "Visit a boutique" band with real Berto Lucci storefront photos crossfading
 * behind the copy — each layer parallax-drifts on scroll (via `.parallax-inner`).
 * A dark scrim keeps the title and CTA legible over the imagery.
 *
 * Two things about how the photography is loaded, both measured:
 *
 * 1. The band sits in the FOOTER, so it is on every page — but it used to pull
 *    three full-size originals (1.0 MB) on load. `loading="lazy"` did not save
 *    us: on a short page, or before the product grid has laid out, the footer is
 *    inside Chrome's generous lazy-load margin, so the browser fetched all three
 *    immediately and they competed with the product imagery for bandwidth. On a
 *    throttled mobile connection that alone pushed /shop's LCP past 12 s.
 *    An IntersectionObserver gate is the fix: no <img> exists in the DOM at all
 *    until the band is genuinely approaching the viewport, so a skeleton-height
 *    page can never trigger the fetch.
 *
 * 2. Each photo now ships a responsive WebP/JPEG ladder instead of one original.
 *    The band is full-bleed and ~300–380px tall, so a phone needs the 480w rung
 *    (~25 KB), not the 1400px master (~340 KB).
 */
export function BoutiqueBand({
  photos,
  title,
  text,
  cta,
}: {
  photos: StorePhoto[];
  title: string;
  text: string;
  cta: string;
}) {
  const count = photos.length;
  const [active, setActive] = React.useState(0);
  // How many slides may render an <img>. 0 until the band nears the viewport,
  // then 1 (the visible one), then all of them once the first has had a moment.
  const [mountCount, setMountCount] = React.useState(0);
  const frameRef = React.useRef<HTMLDivElement>(null);

  React.useEffect(() => {
    const el = frameRef.current;
    if (!el) return;

    // True once the band is within reach BELOW the fold, and also true once it
    // has been scrolled past ABOVE the fold. That second case matters: an
    // IntersectionObserver only fires when the intersection ratio changes, so a
    // jump straight to the bottom of the page (End key, footer anchor, a
    // restored scroll position) can take the band from "below the viewport" to
    // "above the viewport" without ever producing an intersecting frame — and
    // the band would then sit there as an empty navy strip. Verified: at 375px
    // the footer content below the band is taller than the viewport, so this is
    // reachable, not theoretical.
    const near = () => el.getBoundingClientRect().top < window.innerHeight * 1.5;

    if (near()) {
      setMountCount(1);
      return;
    }

    let io: IntersectionObserver | undefined;
    const onNear = () => {
      io?.disconnect();
      window.removeEventListener("scroll", onScroll);
      setMountCount(1);
    };
    const onScroll = () => { if (near()) onNear(); };

    if (typeof IntersectionObserver !== "undefined") {
      io = new IntersectionObserver(([e]) => e.isIntersecting && onNear(), {
        // ~half a viewport of lead time: enough to have decoded before the band
        // is looked at, far tighter than the browser's own lazy-load margin.
        rootMargin: "50% 0px",
      });
      io.observe(el);
    }
    // Backstop for the jump case above. Passive, and it removes itself on the
    // first hit, so it costs one geometry read per scroll frame until then.
    window.addEventListener("scroll", onScroll, { passive: true });

    return () => {
      io?.disconnect();
      window.removeEventListener("scroll", onScroll);
    };
  }, [count]);

  // Bring the remaining slides in only after the first one has had the network
  // to itself, so the crossfade never lands on an undecoded image.
  React.useEffect(() => {
    if (mountCount !== 1 || count < 2) return;
    const id = setTimeout(() => setMountCount(count), 1800);
    return () => clearTimeout(id);
  }, [mountCount, count]);

  React.useEffect(() => {
    if (count < 2 || mountCount < count) return;
    const id = setTimeout(() => setActive((a) => (a + 1) % count), 5000);
    return () => clearTimeout(id);
  }, [active, count, mountCount]);

  return (
    <div
      ref={frameRef}
      className="parallax-frame relative flex min-h-[300px] flex-col justify-center overflow-hidden border-b border-[hsl(var(--navy-700))] bg-[hsl(var(--navy-900))] md:min-h-[380px]"
    >
      {/* Crossfading, parallaxed storefront photos */}
      {photos.map((p, i) => (
        <div
          key={p.base}
          aria-hidden={i !== active}
          style={{ transitionDuration: "1600ms" }}
          className={cn(
            "parallax-inner transition-opacity ease-in-out",
            i === active ? "opacity-100" : "opacity-0"
          )}
        >
          {i < mountCount && (
            <picture className="contents">
              <source type="image/webp" srcSet={srcSet(p.base, p.widths, "webp")} sizes="100vw" />
              {/* eslint-disable-next-line @next/next/no-img-element */}
              <img
                src={`${p.base}-${p.widths[Math.min(1, p.widths.length - 1)]}.jpg`}
                srcSet={srcSet(p.base, p.widths, "jpg")}
                sizes="100vw"
                alt={p.alt}
                decoding="async"
                className={cn("h-full w-full object-cover", p.pos ?? "object-center")}
              />
            </picture>
          )}
        </div>
      ))}

      {/* Scrims for legible copy */}
      <div className="pointer-events-none absolute inset-0 bg-[hsl(var(--navy-900)/0.68)]" />
      <div className="pointer-events-none absolute inset-0 bg-gradient-to-r from-[hsl(var(--navy-900)/0.85)] via-[hsl(var(--navy-900)/0.55)] to-[hsl(var(--navy-900)/0.4)]" />

      <div className="container relative flex flex-col items-center justify-between gap-5 py-10 text-center sm:flex-row sm:text-left md:py-12">
        <div className="flex items-center gap-4">
          <span className="flex h-12 w-12 shrink-0 items-center justify-center rounded-full border border-[hsl(var(--cream)/0.4)] bg-[hsl(var(--navy-900)/0.35)] text-[hsl(var(--cream))] backdrop-blur">
            <MapPin className="h-5 w-5" />
          </span>
          <div>
            <p className="font-display text-xl font-medium text-[hsl(var(--cream))] [text-shadow:0_1px_16px_hsl(var(--navy-900)/0.8)]">{title}</p>
            <p className="text-sm text-[hsl(var(--cream)/0.85)] [text-shadow:0_1px_12px_hsl(var(--navy-900)/0.8)]">{text}</p>
          </div>
        </div>
        <Link
          href="/about"
          className="group inline-flex shrink-0 items-center gap-2 border border-[hsl(var(--cream)/0.5)] bg-[hsl(var(--navy-900)/0.35)] px-6 py-3 text-xs uppercase tracking-luxe text-[hsl(var(--cream))] backdrop-blur transition-colors hover:border-[hsl(var(--cream))] hover:bg-[hsl(var(--cream))] hover:text-[hsl(var(--navy))]"
        >
          {cta}
          <ArrowRight className="h-4 w-4 transition-transform group-hover:translate-x-0.5" />
        </Link>
      </div>
    </div>
  );
}
