"use client";

import * as React from "react";
import Link from "next/link";
import type { CardProduct } from "@/lib/card-product";
import { cn } from "@/lib/utils";
import { ProductCard } from "./product-card";
import { useLang } from "./lang-provider";

/**
 * Tabbed best-sellers. Category tabs switch a horizontal product carousel
 * (scrolls on mobile, 4-up grid on desktop). `groups` is parallel to the
 * localized tabs in the dictionary; ProductCard handles the cards.
 */
export function BestSellers({ groups }: { groups: CardProduct[][] }) {
  const { t: dict } = useLang();
  const t = dict.bestSellers;
  const [active, setActive] = React.useState(0);
  const items = groups[active] ?? [];

  return (
    <section className="on-dark relative overflow-hidden bg-[hsl(var(--section-navy))] py-20 text-foreground md:py-24">
      <div className="hairline-gold absolute inset-x-0 top-0 opacity-70" />
      {/* Oversized metallic SILVER "Best Sellers" watermark — fully visible + depth */}
      <span
        aria-hidden="true"
        className="text-silver txt-depth-dark pointer-events-none absolute right-5 top-8 z-0 select-none whitespace-nowrap font-display text-[1.85rem] italic leading-none opacity-80 sm:right-8 sm:text-[3rem] lg:text-[4.5rem]"
      >
        Best Sellers
      </span>
      <div className="container relative">
        <div className="reveal mb-10 flex flex-col items-center gap-6 sm:flex-row sm:items-end sm:justify-between">
          <div className="text-center sm:text-left">
            <p className="eyebrow-gold">{t.eyebrow}</p>
            <h2 className="mt-3 font-display text-4xl font-medium md:text-5xl">{t.title}</h2>
          </div>
          <div className="flex flex-wrap items-center justify-center gap-1">
            {t.tabs.map((tab, i) => (
              <button
                key={tab.category}
                onClick={() => setActive(i)}
                // Same contract as the store-map region tabs: the selected state
                // is carried by aria-pressed, not by colour alone, so a screen
                // reader announces which category is currently showing.
                aria-pressed={i === active}
                className={cn(
                  "border-b-2 px-4 py-2 text-xs uppercase tracking-luxe transition-colors",
                  i === active
                    ? "border-accent text-foreground"
                    : "border-transparent text-foreground/55 hover:text-foreground"
                )}
              >
                {tab.label}
              </button>
            ))}
          </div>
        </div>

        <div className="thin-scroll -mx-6 flex snap-x gap-5 overflow-x-auto px-6 pb-2 md:mx-0 md:grid md:grid-cols-4 md:overflow-visible md:px-0">
          {items.map((p) => (
            <div key={p.id} className="reveal-lift w-[62%] shrink-0 snap-start sm:w-[42%] md:w-auto">
              <ProductCard product={p} />
            </div>
          ))}
        </div>

        <div className="mt-9 text-center">
          <Link href="/shop" className="link-underline text-xs uppercase tracking-luxe">
            {t.viewAll}
          </Link>
        </div>
      </div>
    </section>
  );
}
