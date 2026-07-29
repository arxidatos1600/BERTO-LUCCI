import Link from "next/link";
import { ArrowRight } from "lucide-react";
import { SmartImage } from "./smart-image";
import { Button } from "./ui/button";

export interface StoryCopy {
  eyebrow: string;
  title: string;
  body1: string;
  body2: string;
  stats: { n: string; l: string }[];
  cta: string;
}

/**
 * "Our Story" feature tile — the heritage centrepiece directly under the hero.
 * A tall parallax suit portrait sits beside a black panel carrying the house
 * narrative, a beige-highlighted stat strip and a call to the story page.
 */
export function StoryFeature({
  t,
  image,
}: {
  t: StoryCopy;
  image: { local: string; fallback: string; alt: string };
}) {
  return (
    <section className="on-dark relative overflow-hidden bg-background text-foreground">
      <div className="hairline-gold absolute inset-x-0 top-0 z-10" />
      <div className="grid lg:grid-cols-[0.92fr_1.08fr]">
        {/* Parallax portrait */}
        <div className="parallax-frame reveal-zoom min-h-[440px] lg:min-h-[660px]">
          <div className="parallax-inner">
            <SmartImage
              local={image.local}
              fallback={image.fallback}
              alt={image.alt}
              sizes="(max-width: 1024px) 100vw, 46vw"
              className="h-full w-full object-cover object-[center_15%]"
            />
          </div>
          <div className="absolute inset-0 bg-gradient-to-r from-transparent via-transparent to-background/90 lg:to-background" />
          <div className="absolute inset-0 bg-gradient-to-t from-background/70 to-transparent lg:from-transparent" />
          {/* Top scrim so the founders' seal stays legible over light imagery */}
          <div className="pointer-events-none absolute inset-x-0 top-0 h-40 bg-gradient-to-b from-[hsl(var(--navy-900)/0.7)] via-[hsl(var(--navy-900)/0.28)] to-transparent" />
          {/* Founders' seal */}
          <div className="absolute left-7 top-7 flex items-center gap-3 [text-shadow:0_1px_12px_hsl(var(--navy-900)/0.95)]">
            <span className="font-display text-3xl italic text-[hsl(var(--cream))]">B<span className="not-italic">·</span>L</span>
            <span className="text-[10px] font-medium uppercase tracking-luxe text-[hsl(var(--cream)/0.92)]">Milano · Est. 1976</span>
          </div>
        </div>

        {/* Narrative panel */}
        <div className="relative flex flex-col justify-center px-7 py-16 sm:px-12 lg:py-20 xl:px-20">
          <p className="eyebrow-gold reveal">{t.eyebrow}</p>
          <h2 className="reveal mt-4 max-w-xl font-display text-3xl font-medium leading-[1.08] md:text-[2.7rem]">
            {t.title}
          </h2>
          <div className="reveal mt-5 h-px w-16 bg-accent/70" />

          <div className="reveal mt-6 max-w-xl space-y-4 text-[15px] leading-relaxed text-[hsl(var(--cream)/0.82)]">
            <p>{t.body1}</p>
            <p>{t.body2}</p>
          </div>

          {/* Beige-highlighted stat strip */}
          <div className="reveal mt-9 grid grid-cols-2 gap-px overflow-hidden rounded-sm border border-[hsl(var(--camel-light)/0.25)] bg-[hsl(var(--camel-light)/0.18)] sm:grid-cols-4">
            {t.stats.map((s) => (
              <div
                key={s.l}
                className="group bg-[hsl(var(--navy)/0.55)] px-4 py-5 text-center transition-colors duration-500 hover:bg-[hsl(var(--navy)/0.2)]"
              >
                <p className="font-display text-3xl font-medium text-[hsl(var(--camel-light))]">{s.n}</p>
                <p className="mt-1.5 text-[10px] uppercase leading-tight tracking-luxe text-[hsl(var(--cream)/0.65)]">{s.l}</p>
              </div>
            ))}
          </div>

          <div className="reveal mt-9">
            <Button size="lg" variant="accent" className="btn-sheen" asChild>
              <Link href="/about">
                {t.cta} <ArrowRight className="h-4 w-4" />
              </Link>
            </Button>
          </div>
        </div>
      </div>
    </section>
  );
}
