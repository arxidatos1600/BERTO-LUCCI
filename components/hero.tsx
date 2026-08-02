"use client";

import * as React from "react";
import Link from "next/link";
import { ArrowRight } from "lucide-react";
import { cn } from "@/lib/utils";
import { SmartImage } from "./smart-image";
import { SocialLinks } from "./social-links";
import { Button } from "./ui/button";

export interface HeroSlide {
  handle: string;
  local: string;
  fallback: string;
  alt: string;
  name: string;
  category: string;
  price: string;
}

export interface HeroCopy {
  eyebrow: string;
  title1: string;
  title2: string;
  subtitle: string;
  ctaPrimary: string;
  ctaSecondary: string;
  shopThis: string;
}

/**
 * Render the champagne accent title line in a SOLID colour so every glyph paints
 * in full — no shaving of the round ο or the deep italic μ/ψ descenders. The μ is
 * split out and nudged so it sits balanced; words without a μ render as one span.
 */
function GoldTitleLine({ text }: { text: string }) {
  const accent = "text-[hsl(var(--camel-light))]";
  const chunks = text.split("μ");
  if (chunks.length === 1) return <span className={accent}>{text}</span>;
  return (
    <>
      {chunks.map((chunk, i) => (
        <React.Fragment key={i}>
          {i > 0 && <span className={`${accent} relative -top-[0.05em] left-[0.06em]`}>μ</span>}
          <span className={accent}>{chunk}</span>
        </React.Fragment>
      ))}
    </>
  );
}

/**
 * Editorial, shoppable hero. A black copy panel (headline · socials · shoppable
 * rail) sits beside a tall crossfading runway of full-length Berto Lucci suit
 * looks — model and face in frame — with a slow Ken-Burns drift. Presentational
 * only: slides + localized copy are chosen server-side, so data flow is unchanged.
 */
export function Hero({ slides, t }: { slides: HeroSlide[]; t: HeroCopy }) {
  const count = slides.length;
  const [active, setActive] = React.useState(0);
  const [paused, setPaused] = React.useState(false);
  const cur = slides[active] ?? slides[0];

  // Only the first slide exists in the DOM on first paint. The others are
  // absolutely positioned at inset-0 with opacity-0 — which means they are
  // IN the viewport, so `loading="lazy"` never held them back and the browser
  // fetched all six full-bleed photographs in parallel with the LCP image. They
  // are not needed until the first crossfade at 4 s, so they mount once the main
  // thread is idle (or after 1.5 s, whichever comes first).
  const [mountCount, setMountCount] = React.useState(1);
  React.useEffect(() => {
    if (count < 2) return;
    const load = () => setMountCount(count);
    const ric = (window as unknown as {
      requestIdleCallback?: (cb: () => void, o?: { timeout: number }) => number;
    }).requestIdleCallback;
    if (ric) {
      const id = ric(load, { timeout: 1500 });
      return () => (window as unknown as { cancelIdleCallback?: (n: number) => void })
        .cancelIdleCallback?.(id);
    }
    const id = setTimeout(load, 1500);
    return () => clearTimeout(id);
  }, [count]);

  // Self-rescheduling timer: gently crossfades to the next slide every 4s.
  // Held until every slide is mounted so a crossfade can never land on nothing.
  React.useEffect(() => {
    if (count < 2 || paused || mountCount < count) return;
    const id = setTimeout(() => setActive((a) => (a + 1) % count), 4000);
    return () => clearTimeout(id);
  }, [active, count, paused, mountCount]);

  // Pause the continuous Ken-Burns zoom while the hero is fully scrolled out of
  // view — sheds GPU/compositor work and battery with no visible change.
  const sectionRef = React.useRef<HTMLElement>(null);
  React.useEffect(() => {
    const el = sectionRef.current;
    if (!el || typeof IntersectionObserver === "undefined") return;
    const io = new IntersectionObserver(
      ([e]) => el.style.setProperty("--zoom-play", e.isIntersecting ? "running" : "paused"),
      { rootMargin: "0px" }
    );
    io.observe(el);
    return () => io.disconnect();
  }, []);

  return (
    <section
      ref={sectionRef}
      className="on-dark relative min-h-[92vh] w-full overflow-hidden bg-primary text-[hsl(var(--cream))]"
    >
      {/* ============ Image runway (full-bleed on mobile, right column on desktop) ============ */}
      <div
        className="absolute inset-0 lg:left-auto lg:right-0 lg:w-[55%]"
        onMouseEnter={() => setPaused(true)}
        onMouseLeave={() => setPaused(false)}
      >
        {slides.slice(0, mountCount).map((s, i) => (
          <div
            key={s.local + i}
            aria-hidden={i !== active}
            style={{ transitionDuration: "2000ms", transitionTimingFunction: "ease-in-out" }}
            className={cn("absolute inset-0 transition-opacity", i === active ? "opacity-100" : "opacity-0")}
          >
            {/* Continuous gentle zoom on every slide (never toggled on/off), so
                the crossfade never snaps the outgoing image back to scale 1. */}
            <div className="hero-zoom h-full w-full">
              <SmartImage
                local={s.local}
                fallback={s.fallback}
                alt={s.alt}
                priority={i === 0}
                sizes="(max-width: 1024px) 100vw, 55vw"
                className="h-full w-full object-cover object-[center_12%] contrast-[1.02]"
              />
            </div>
          </div>
        ))}
      </div>

      {/* Section-wide scrims — siblings of the image column, so NOTHING has a hard
          vertical edge where the column begins. The left fade holds solid black
          across the copy, then melts seamlessly into the photograph before the
          model, and the radial spans the whole hero (no scoped boundary). */}
      {/* Mobile scrim. The old top stop (primary/10) left the eyebrow sitting on
          a ~22%-opaque wash over the photo, measured at 2.70:1 against the 4.5:1
          AA floor for 12px text. Deepening the upper stops keeps the photograph
          readable while bringing small copy over it above threshold. */}
      <div className="pointer-events-none absolute inset-0 bg-gradient-to-t from-primary via-primary/65 to-primary/40 lg:hidden" />
      <div className="pointer-events-none absolute inset-y-0 left-0 hidden w-[64%] bg-gradient-to-r from-primary from-[75%] to-transparent lg:block" />
      <div className="pointer-events-none absolute inset-0 bg-[radial-gradient(135%_95%_at_80%_40%,transparent_55%,hsl(var(--navy-900)/0.35))]" />

      {/* Thin champagne hairline along the very top */}
      <div className="hairline-gold absolute inset-x-0 top-0 z-10" />

      {/* ============ Copy panel ============ */}
      <div className="container relative z-10 flex min-h-[92vh] flex-col justify-end pb-10 pt-28 sm:pb-12 lg:justify-start lg:pb-12 lg:pt-[13vh]">
        <div className="lg:max-w-[46%]">
          <div className="flex items-center gap-3 animate-rise-in" style={{ animationDelay: "0.1s" }}>
            <span className="h-px w-9 bg-[hsl(var(--camel-light))]" />
            <p className="eyebrow text-[hsl(var(--camel-light))]">{t.eyebrow}</p>
          </div>

          {/* Type scale is fluid rather than a fixed lg: step. A hard 6.4rem from
              1024px up overflowed the 46%-wide copy column and painted the title
              over the model photo (worst at 1024-1280px, and in Greek, which runs
              ~20% longer than English). clamp() ties the size to the viewport so
              the longest Greek string still fits its column at every width.
              leading is >=1 on both lines: Greek τόνοι sit high and ο/μ/ψ descend
              low, so sub-1 leading made the two lines physically overlap. */}
          <h1 className="mt-5 font-display text-[13vw] font-medium leading-[1.02] tracking-[-0.01em] [text-shadow:0_2px_40px_hsl(var(--navy-900)/0.55)] sm:text-[clamp(2.75rem,5.2vw,4.5rem)] lg:text-[clamp(3.5rem,5.6vw,6.4rem)]">
            <span className="block animate-blur-in" style={{ animationDelay: "0.25s" }}>
              {t.title1}
            </span>
            <span className="block animate-blur-in italic leading-[1.12]" style={{ animationDelay: "0.45s" }}>
              <GoldTitleLine text={t.title2} />
            </span>
          </h1>

          <p
            className="mt-6 max-w-md animate-rise-in text-[15px] leading-relaxed text-[hsl(var(--cream)/0.84)]"
            style={{ animationDelay: "0.65s" }}
          >
            {t.subtitle}
          </p>

          <div className="mt-8 flex animate-rise-in flex-wrap items-center gap-3" style={{ animationDelay: "0.8s" }}>
            <Button size="lg" variant="accent" className="btn-sheen" asChild>
              <Link href="/shop?category=Suits">
                {t.ctaPrimary} <ArrowRight className="h-4 w-4" />
              </Link>
            </Button>
            <Button
              size="lg"
              variant="outline"
              asChild
              className="border-[hsl(var(--cream)/0.4)] bg-transparent text-[hsl(var(--cream))] hover:bg-[hsl(var(--cream))] hover:text-[hsl(var(--navy))]"
            >
              <Link href="/shop?sale=1">{t.ctaSecondary}</Link>
            </Button>
          </div>

          {/* Enlarged social rail */}
          <div className="mt-8 flex animate-rise-in items-center gap-4" style={{ animationDelay: "0.9s" }}>
            <span className="text-[10px] uppercase tracking-luxe text-[hsl(var(--cream)/0.5)]">Follow</span>
            <SocialLinks size={18} itemClassName="h-10 w-10 sm:h-11 sm:w-11" />
          </div>

          {/* ---- Live "now showing" card for the auto-rotating slide ---- */}
          {count > 0 && cur && (
            <div
              className="mt-9 flex animate-rise-in items-center gap-5 border-t border-[hsl(var(--cream)/0.15)] pt-5"
              style={{ animationDelay: "1s" }}
            >
              <div className="min-w-0 flex-1">
                <p className="text-[10px] uppercase tracking-luxe text-[hsl(var(--camel-light))]">{cur.category}</p>
                <p className="line-clamp-1 font-serif text-sm text-[hsl(var(--cream))]">{cur.name}</p>
              </div>
              <span className="h-9 w-px bg-[hsl(var(--cream)/0.2)]" />
              <div className="shrink-0 text-right">
                <p className="font-display text-xl leading-none text-[hsl(var(--cream))]">{cur.price}</p>
                <Link
                  href={`/products/${encodeURIComponent(cur.handle)}`}
                  className="mt-1.5 inline-flex items-center gap-1 text-[10px] uppercase tracking-luxe text-[hsl(var(--camel-light))] transition-colors hover:text-[hsl(var(--cream))]"
                >
                  {t.shopThis} <ArrowRight className="h-3 w-3" />
                </Link>
              </div>
            </div>
          )}
        </div>
      </div>
    </section>
  );
}
