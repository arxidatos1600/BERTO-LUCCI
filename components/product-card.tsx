"use client";

import * as React from "react";
import Link from "next/link";
import { ZoomIn } from "lucide-react";
import type { ProductColor } from "@/lib/types";
import type { CardProduct } from "@/lib/card-product";
import { cn, formatPrice } from "@/lib/utils";
import { SmartImage } from "./smart-image";
import { RibbonBadge } from "./ribbon-badge";
import { useLang } from "./lang-provider";

interface ProductCardProps {
  // `CardProduct`, not `Product`: this is a client component, so whatever a
  // server page passes here is serialised whole into the RSC payload. Narrowing
  // the prop is what keeps `bodyHtml` and every variant out of the HTML.
  product: CardProduct;
  className?: string;
  priority?: boolean;
}

/** Resolve a colour swatch to its variant photo — from the slim feed's `img`
 *  field, or (on pages with the full dataset) from the product's variants. */
function colorImage(product: CardProduct, c: ProductColor): { local: string; src: string } | null {
  if (c.img) return { local: c.img, src: c.imgSrc ?? c.img };
  const v = (product.variants || []).find((x) => x.colorName === c.name || x.color === c.value);
  if (v?.image && v.image !== product.images[0]?.local) return { local: v.image, src: v.imageSrc };
  return null;
}

/** Premium product card: image with hover swap + colour-swatch photo switching. */
export function ProductCard({ product, className }: ProductCardProps) {
  // Grids must speak the active locale: the dataset ships Greek twins for the
  // title and category, so use them instead of the English defaults in EL.
  const { lang, t: dict } = useLang();
  const isGr = lang === "gr";
  const t = dict.product;
  const href = `/products/${encodeURIComponent(product.handle)}`;
  const primary = product.images[0];
  const secondary = product.images[1] ?? product.images[0];
  const swatches = product.colors.slice(0, 5);
  const extraColors = product.colors.length - swatches.length;

  // Photo shown when a colour swatch is hovered / picked (null = default).
  const [active, setActive] = React.useState<{ local: string; src: string } | null>(null);
  const shown = active ?? primary;

  return (
    <div className={cn("group block", className)}>
      <Link href={href} className="block">
        <div className="img-zoom relative aspect-[3/4] bg-secondary">
          {/* Base / selected-colour image (SmartImage cross-fades on src change) */}
          <SmartImage
            local={shown.local}
            fallback={shown.src}
            alt={product.title}
            className="absolute inset-0"
          />
          {/* Hover second shot — only while no colour is selected */}
          {!active && secondary !== primary && (
            <SmartImage
              local={secondary.local}
              fallback={secondary.src}
              alt=""
              className="absolute inset-0 opacity-0 transition-opacity duration-500 group-hover:opacity-100"
            />
          )}

          {/* Badges — pointed corner flags in house monochrome, not the flat pill */}
          <div className="absolute left-0 top-3 flex flex-col items-start gap-1.5">
            {product.onSale && <RibbonBadge tone="dark">−{product.salePercent}%</RibbonBadge>}
            {!product.available && <RibbonBadge tone="dark">{t.soldOut}</RibbonBadge>}
          </div>

          {/* Quick-zoom affordance — hints the PDP gallery has a magnifier;
              purely a visual cue on the card (the real zoom lives on the PDP,
              .zoom-lens), so it's a Link, not a separate lightbox trigger. */}
          <span
            aria-hidden="true"
            className="pointer-events-none absolute bottom-3 right-3 flex h-8 w-8 items-center justify-center rounded-full bg-[hsl(var(--card)/0.9)] opacity-0 shadow-sm backdrop-blur-sm transition-opacity duration-300 group-hover:opacity-100"
          >
            <ZoomIn className="h-4 w-4 text-foreground" />
          </span>
        </div>

        <div className="pt-4">
          <p className="eyebrow">{isGr && product.productTypeGreek ? product.productTypeGreek : product.category}</p>
          <h3 className="mt-1 font-serif text-[15px] leading-snug text-foreground">
            <span className="link-underline">
              {isGr && product.titleOriginal ? product.titleOriginal : product.title}
            </span>
          </h3>

          <div className="mt-1.5 flex items-baseline gap-2">
            <span className={cn("text-sm", product.onSale && "text-destructive")}>
              {formatPrice(product.price)}
            </span>
            {product.onSale && product.compareAtPrice && (
              <span className="text-xs text-muted-foreground line-through">
                {formatPrice(product.compareAtPrice)}
              </span>
            )}
          </div>
        </div>
      </Link>

      {/* Colour swatches: hover or tap to preview that colour's photo.
          gap-3 (12px), not gap-2 — the dots are 14px with a 6px hit-area
          extension each side = 26px targets. At gap-2 the centres sat 22px
          apart, so adjacent targets overlapped and a tap near the edge hit
          the wrong swatch. A 12px gap puts centres 26px apart: exactly
          touching, never overlapping. */}
      {swatches.length > 1 && (
        <div className="mt-2.5 flex items-center gap-3" onMouseLeave={() => setActive(null)}>
          {swatches.map((c) => {
            const img = colorImage(product, c);
            const isActive = active != null && img != null && active.local === img.local;
            return (
              <button
                type="button"
                key={c.name}
                title={c.name}
                aria-label={c.name}
                onMouseEnter={() => setActive(img)}
                onFocus={() => setActive(img)}
                onClick={() => setActive(img)}
                className={cn(
                  // Visual dot stays 14px; an invisible ::before extends the hit
                  // area to 24px so it meets WCAG 2.5.8 without changing the look
                  // or the spacing of the swatch row.
                  // -6px (not -5px) so the 14px dot clears 26px of hit area:
                  // -5px lands exactly on the 24px WCAG floor with no margin
                  // for a non-16px root font-size.
                  "relative h-3.5 w-3.5 rounded-full border border-border transition-transform before:absolute before:-inset-[6px] before:content-[''] hover:scale-125 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring focus-visible:ring-offset-1",
                  isActive && "ring-2 ring-accent ring-offset-1"
                )}
                style={{ backgroundColor: c.hex }}
              />
            );
          })}
          {extraColors > 0 && (
            <Link href={href} className="text-[10px] text-muted-foreground transition-colors hover:text-foreground">
              +{extraColors}
            </Link>
          )}
        </div>
      )}
    </div>
  );
}
