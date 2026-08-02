"use client";

import Link from "next/link";
import { formatPrice } from "@/lib/utils";
import { useRecentlyViewed } from "@/lib/recently-viewed";
import { SmartImage } from "./smart-image";
import { useLang } from "./lang-provider";

/**
 * Lightweight rail for locally-tracked recently-viewed products. Reads from
 * localStorage only (`lib/recently-viewed.ts`), so it renders nothing during
 * SSR/first paint and fills in client-side — expected for a per-visitor,
 * no-backend feature. Excludes the product currently on screen.
 */
export function RecentlyViewed({ excludeHandle }: { excludeHandle?: string }) {
  const { lang, t: dict } = useLang();
  const items = useRecentlyViewed(excludeHandle);

  if (items.length === 0) return null;

  return (
    <section className="container mt-16 border-t border-border pt-12 lg:mt-24 lg:pt-16">
      <h2 className="font-serif text-2xl md:text-3xl">{dict.product.recentlyViewed}</h2>
      <div className="mt-6 grid grid-cols-2 gap-x-4 gap-y-8 sm:grid-cols-3 md:grid-cols-4 lg:grid-cols-6">
        {items.map((item) => (
          <Link key={item.handle} href={`/products/${encodeURIComponent(item.handle)}`} className="group block">
            <div className="img-zoom relative aspect-[3/4] bg-secondary">
              <SmartImage
                local={item.local}
                fallback={item.fallback}
                alt={lang === "gr" && item.titleGr ? item.titleGr : item.title}
                className="absolute inset-0"
              />
            </div>
            <div className="pt-3">
              <h3 className="font-serif text-[13px] leading-snug text-foreground">
                <span className="link-underline">
                  {lang === "gr" && item.titleGr ? item.titleGr : item.title}
                </span>
              </h3>
              <p className="mt-1 text-xs text-muted-foreground">{formatPrice(item.price)}</p>
            </div>
          </Link>
        ))}
      </div>
    </section>
  );
}
