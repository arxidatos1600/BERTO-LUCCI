"use client";

import * as React from "react";
import { cn } from "@/lib/utils";
import type { Product } from "@/lib/types";
import { hasChestSizing } from "@/lib/size-guide";
import { useLang } from "./lang-provider";
import { SizeGuideModal } from "./size-guide-modal";

interface VariantSelectorProps {
  product: Product;
  selectedColor: string;   // Greek option value
  selectedSize: string;
  onColor: (color: string) => void;
  onSize: (size: string) => void;
}

/**
 * Colour swatches + size pills, both stock-aware: a size is disabled when no
 * available variant exists for the chosen colour + size combination.
 */
export function VariantSelector({
  product,
  selectedColor,
  selectedSize,
  onColor,
  onSize,
}: VariantSelectorProps) {
  const { t: dict } = useLang();
  const t = dict.product;
  const [sizeGuideOpen, setSizeGuideOpen] = React.useState(false);
  const sizeGuideTriggerRef = React.useRef<HTMLButtonElement>(null);
  // Is there an available variant for this colour/size pair?
  const isAvailable = (color: string, size: string) =>
    product.variants.some(
      (v) => v.color === color && v.size === size && v.available
    );
  const sizeExists = (color: string, size: string) =>
    product.variants.some((v) => v.color === color && v.size === size);

  const activeColor = product.colors.find((c) => c.value === selectedColor);

  // Sizes this product actually has in stock right now, in any colour — the
  // Size Guide must only ever recommend something a shopper can buy today,
  // and only appear at all for products the chest-based guide can serve
  // (real letter runs, not a one-size accessory or a numeric-waist trouser).
  const purchasableSizes = React.useMemo(
    () => product.sizes.filter((s) => product.variants.some((v) => v.size === s && v.available)),
    [product.sizes, product.variants]
  );
  const showSizeGuide = hasChestSizing(purchasableSizes);

  return (
    <div className="space-y-6">
      {/* Colour */}
      {product.colors.length > 0 && (
        <div>
          <div className="flex items-center justify-between">
            <span className="eyebrow">{t.colour}</span>
            <span className="text-xs text-muted-foreground">{activeColor?.name}</span>
          </div>
          <div className="mt-3 flex flex-wrap gap-2.5">
            {product.colors.map((c) => (
              <button
                key={c.value}
                title={c.name}
                aria-label={c.name}
                aria-pressed={selectedColor === c.value}
                onClick={() => onColor(c.value)}
                className={cn(
                  "relative h-8 w-8 rounded-full border transition-all",
                  selectedColor === c.value
                    ? "ring-1 ring-accent ring-offset-2 ring-offset-background"
                    : "hover:scale-105",
                  c.pattern ? "border-border" : "border-black/10"
                )}
                style={{
                  background: c.pattern
                    ? "repeating-linear-gradient(45deg,#b9a98a,#b9a98a 4px,#cdbf9f 4px,#cdbf9f 8px)"
                    : c.hex,
                }}
              />
            ))}
          </div>
        </div>
      )}

      {/* Size */}
      {product.sizes.length > 0 && (
        <div>
          <div className="flex items-center justify-between">
            <span className="eyebrow">{t.size}</span>
            {showSizeGuide && (
              <button
                ref={sizeGuideTriggerRef}
                onClick={() => setSizeGuideOpen(true)}
                className="link-underline -my-1.5 py-1.5 text-xs text-muted-foreground transition-colors hover:text-foreground"
              >
                {t.sizeGuide}
              </button>
            )}
          </div>
          <div className="mt-3 flex flex-wrap gap-2">
            {product.sizes.map((size) => {
              const exists = sizeExists(selectedColor, size);
              const available = isAvailable(selectedColor, size);
              const disabled = !exists || !available;
              return (
                <button
                  key={size}
                  disabled={disabled}
                  aria-pressed={selectedSize === size}
                  // The strikethrough alone is a visual-only signal; name the
                  // reason so a screen reader says why the size is unavailable.
                  aria-label={disabled ? `${size} · ${t.soldOut}` : undefined}
                  onClick={() => onSize(size)}
                  className={cn(
                    "min-w-[3rem] border px-3 py-2 text-xs uppercase tracking-wide transition-colors",
                    selectedSize === size
                      ? "border-primary bg-primary text-primary-foreground"
                      : "border-input hover:border-primary",
                    disabled &&
                      "cursor-not-allowed border-dashed text-muted-foreground/50 line-through hover:border-input"
                  )}
                >
                  {size}
                </button>
              );
            })}
          </div>
        </div>
      )}

      {showSizeGuide && (
        <SizeGuideModal
          open={sizeGuideOpen}
          onOpenChange={setSizeGuideOpen}
          availableSizes={purchasableSizes}
          triggerRef={sizeGuideTriggerRef}
        />
      )}
    </div>
  );
}
