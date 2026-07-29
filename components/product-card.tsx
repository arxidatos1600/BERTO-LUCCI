"use client";

import * as React from "react";
import Link from "next/link";
import type { Product, ProductColor } from "@/lib/types";
import { cn, formatPrice } from "@/lib/utils";
import { SmartImage } from "./smart-image";
import { Badge } from "./ui/badge";
import { useLang } from "./lang-provider";

interface ProductCardProps {
  product: Product;
  className?: string;
  priority?: boolean;
}

/** Resolve a colour swatch to its variant photo — from the slim feed's `img`
 *  field, or (on pages with the full dataset) from the product's variants. */
function colorImage(product: Product, c: ProductColor): { local: string; src: string } | null {
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
              alt={`${product.title} alternate view`}
              className="absolute inset-0 opacity-0 transition-opacity duration-500 group-hover:opacity-100"
            />
          )}

          {/* Badges */}
          <div className="absolute left-3 top-3 flex flex-col gap-1.5">
            {product.onSale && <Badge variant="sale">−{product.salePercent}%</Badge>}
            {!product.available && <Badge variant="muted">{t.soldOut}</Badge>}
          </div>
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

      {/* Colour swatches — hover or tap to preview that colour's photo */}
      {swatches.length > 1 && (
        <div className="mt-2.5 flex items-center gap-2" onMouseLeave={() => setActive(null)}>
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
                  "relative h-3.5 w-3.5 rounded-full border border-border transition-transform before:absolute before:-inset-[5px] before:content-[''] hover:scale-125 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring focus-visible:ring-offset-1",
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
