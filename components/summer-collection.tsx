"use client";

import * as React from "react";
import Link from "next/link";
import { ArrowRight, ChevronLeft, ChevronRight } from "lucide-react";
import { cn } from "@/lib/utils";
import { SmartImage } from "./smart-image";
import { Button } from "./ui/button";
import { useLang } from "./lang-provider";

export interface SummerImage {
  local: string;
  fallback: string;
  alt: string;
}

/**
 * Full-bleed "Summer 2026" editorial band. A set of summer looks crossfade in
 * the background — each layer parallax-drifts on scroll (via `.parallax-inner`)
 * and holds a slow Ken-Burns zoom — behind a fixed copy panel with a CTA and
 * left/right arrows to step through the looks. Presentational only; images are
 * chosen server-side.
 */
export function SummerCollection({ images }: { images: SummerImage[] }) {
  const { t: dict } = useLang();
  const t = dict.summer;
  const count = images.length;
  const [active, setActive] = React.useState(0);
  const [paused, setPaused] = React.useState(false);

  // Auto-advance the backdrop every 5s, pausing while hovered.
  React.useEffect(() => {
    if (count < 2 || paused) return;
    const id = setTimeout(() => setActive((a) => (a + 1) % count), 5000);
    return () => clearTimeout(id);
  }, [active, count, paused]);

  // Pause the Ken-Burns zoom on the (offscreen) backdrops while this mid-page
  // band is scrolled out of view — no visible change, less compositor work.
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

  // Step the backdrop by ±1, wrapping around.
  const go = (dir: number) => setActive((a) => (a + dir + count) % count);

  return (
    <section
      ref={sectionRef}
      className="on-dark parallax-frame relative flex min-h-[560px] w-full items-center overflow-hidden bg-[hsl(var(--navy-900))] py-24 md:min-h-[82vh]"
      onMouseEnter={() => setPaused(true)}
      onMouseLeave={() => setPaused(false)}
    >
      {/* Crossfading, parallaxed product backdrops */}
      {images.map((img, i) => (
        <div
          key={img.local + i}
          aria-hidden={i !== active}
          style={{ transitionDuration: "1600ms" }}
          className={cn(
            "parallax-inner transition-opacity ease-in-out",
            i === active ? "opacity-100" : "opacity-0"
          )}
        >
          <div className="hero-zoom h-full w-full">
            <SmartImage
              local={img.local}
              fallback={img.fallback}
              alt={img.alt}
              sizes="100vw"
              className="h-full w-full object-cover object-[center_18%] contrast-[1.04]"
            />
          </div>
        </div>
      ))}

      {/* Scrims so the copy always reads */}
      <div className="pointer-events-none absolute inset-0 bg-gradient-to-r from-[hsl(var(--navy-900)/0.92)] via-[hsl(var(--navy-900)/0.5)] to-[hsl(var(--navy-900)/0.12)]" />
      <div className="pointer-events-none absolute inset-0 bg-gradient-to-t from-[hsl(var(--navy-900)/0.7)] via-transparent to-[hsl(var(--navy-900)/0.3)]" />
      <div className="hairline-gold absolute inset-x-0 top-0 z-10" />

      {/* Copy panel — inset so it clears the side arrows */}
      <div className="relative z-10 mx-auto w-full max-w-[1400px] px-14 text-[hsl(var(--cream))] sm:px-20 lg:px-28">
        <p className="reveal eyebrow text-[hsl(var(--camel-light))]">{t.eyebrow}</p>
        <h2 className="reveal mt-4 max-w-2xl font-display text-5xl font-medium leading-[1.0] md:text-7xl">
          {t.title}
        </h2>
        <p className="reveal mt-5 max-w-md text-[15px] leading-relaxed text-[hsl(var(--cream)/0.85)]">
          {t.subtitle}
        </p>
        <div className="reveal mt-9">
          <Button
            size="lg"
            variant="outline"
            asChild
            className="btn-sheen border-[hsl(var(--cream)/0.5)] bg-transparent text-[hsl(var(--cream))] hover:border-[hsl(var(--cream))] hover:bg-[hsl(var(--cream))] hover:text-[hsl(var(--navy))]"
          >
            <Link href="/shop">
              {t.cta} <ArrowRight className="h-4 w-4" />
            </Link>
          </Button>
        </div>
      </div>

      {/* Prev / next look arrows */}
      {count > 1 && (
        <>
          <button
            type="button"
            onClick={() => go(-1)}
            aria-label="Previous look"
            className="absolute left-2 top-1/2 z-20 flex h-10 w-10 -translate-y-1/2 items-center justify-center rounded-full border border-[hsl(var(--cream)/0.4)] bg-[hsl(var(--navy-900)/0.35)] text-[hsl(var(--cream))] backdrop-blur transition-all hover:border-[hsl(var(--cream))] hover:bg-[hsl(var(--cream))] hover:text-[hsl(var(--navy))] sm:left-5 md:h-14 md:w-14 lg:left-8"
          >
            <ChevronLeft className="h-5 w-5 md:h-6 md:w-6" />
          </button>
          <button
            type="button"
            onClick={() => go(1)}
            aria-label="Next look"
            className="absolute right-2 top-1/2 z-20 flex h-10 w-10 -translate-y-1/2 items-center justify-center rounded-full border border-[hsl(var(--cream)/0.4)] bg-[hsl(var(--navy-900)/0.35)] text-[hsl(var(--cream))] backdrop-blur transition-all hover:border-[hsl(var(--cream))] hover:bg-[hsl(var(--cream))] hover:text-[hsl(var(--navy))] sm:right-5 md:h-14 md:w-14 lg:right-8"
          >
            <ChevronRight className="h-5 w-5 md:h-6 md:w-6" />
          </button>
        </>
      )}
    </section>
  );
}
