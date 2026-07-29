"use client";

import * as React from "react";
import Link from "next/link";
import { MapPin, ArrowRight } from "lucide-react";
import { cn } from "@/lib/utils";

export interface StorePhoto {
  src: string;
  alt: string;
  /** Tailwind object-position class, tuned per photo so the storefront + signage stay in frame. */
  pos?: string;
}

/**
 * "Visit a boutique" band with real Berto Lucci storefront photos crossfading
 * behind the copy — each layer parallax-drifts on scroll (via `.parallax-inner`).
 * A dark scrim keeps the title and CTA legible over the imagery.
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

  React.useEffect(() => {
    if (count < 2) return;
    const id = setTimeout(() => setActive((a) => (a + 1) % count), 5000);
    return () => clearTimeout(id);
  }, [active, count]);

  return (
    <div className="parallax-frame relative flex min-h-[300px] flex-col justify-center overflow-hidden border-b border-[hsl(var(--navy-700))] bg-[hsl(var(--navy-900))] md:min-h-[380px]">
      {/* Crossfading, parallaxed storefront photos */}
      {photos.map((p, i) => (
        <div
          key={p.src}
          aria-hidden={i !== active}
          style={{ transitionDuration: "1600ms" }}
          className={cn(
            "parallax-inner transition-opacity ease-in-out",
            i === active ? "opacity-100" : "opacity-0"
          )}
        >
          {/* eslint-disable-next-line @next/next/no-img-element */}
          <img
            src={p.src}
            alt={p.alt}
            loading="lazy"
            className={cn("h-full w-full object-cover", p.pos ?? "object-center")}
          />
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
