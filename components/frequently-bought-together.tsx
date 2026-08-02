"use client";

import * as React from "react";
import { Check, ShoppingBag } from "lucide-react";
import { toast } from "sonner";
import type { Product, Variant } from "@/lib/types";
import { cn, formatPrice } from "@/lib/utils";
import { useCart } from "@/store/cart";
import { SmartImage } from "./smart-image";
import { Button } from "./ui/button";
import { useLang } from "./lang-provider";

interface FrequentlyBoughtTogetherProps {
  /** The product currently on the PDP — always included, never togglable. */
  product: Product;
  /** The variant currently selected in the buy box above. */
  variant: Variant;
  /** 2-3 pre-computed related products offered as companions. */
  companions: Product[];
}

/** The exact variant a companion resolves to for a chosen size. */
function resolveVariant(companion: Product, size: string): Variant | undefined {
  return companion.variants.find((v) => v.size === size && v.available);
}

/** Mirrors VariantSelector's disabled-state pair, size-only — this compact
 *  picker doesn't offer a colour dimension, so no colour is pinned. */
function sizeExists(companion: Product, size: string): boolean {
  return companion.variants.some((v) => v.size === size);
}
function sizeAvailable(companion: Product, size: string): boolean {
  return companion.variants.some((v) => v.size === size && v.available);
}

interface BundleItemCardProps {
  title: string;
  image: { local: string; src: string };
  price: number;
  meta?: string;
  checked: boolean;
  onToggle?: () => void;
  locked?: boolean;
  unavailable?: boolean;
  unavailableLabel?: string;
  children?: React.ReactNode;
}

/** One selectable tile in the bundle: image with a checkbox chip in the
 *  corner, title/price/meta, and an optional size picker below. Monochrome
 *  only — checked state is a solid black fill, never a colour. */
function BundleItemCard({
  title,
  image,
  price,
  meta,
  checked,
  onToggle = () => {},
  locked = false,
  unavailable = false,
  unavailableLabel,
  children,
}: BundleItemCardProps) {
  const id = React.useId();
  const disabled = locked || unavailable;
  const effectiveChecked = unavailable ? false : checked;

  return (
    <div
      className={cn(
        "card-lift relative border border-border bg-card transition-colors",
        !disabled && "hover:border-[hsl(var(--foreground)/0.3)]"
      )}
    >
      <div
        className={cn(
          "transition-opacity duration-300",
          !effectiveChecked && !locked && "opacity-50"
        )}
      >
        <div className="relative aspect-[3/4] overflow-hidden bg-secondary">
          <SmartImage local={image.local} fallback={image.src} alt={title} className="absolute inset-0" />
        </div>
        <div className="p-4">
          <h3 className="line-clamp-2 font-serif text-[14px] leading-snug text-foreground">{title}</h3>
          {meta && <p className="mt-1 text-xs text-muted-foreground">{meta}</p>}
          <p className="mt-1.5 text-sm">{formatPrice(price)}</p>
          {unavailable && unavailableLabel && (
            <p className="mt-1 text-xs text-muted-foreground">{unavailableLabel}</p>
          )}
          {children}
        </div>
      </div>

      {/* Checkbox chip — overlaid on the image corner, same affordance
          language as the zoom hint in ProductCard. Stays outside the dimmed
          wrapper above so it never fades even when the item is unchecked. */}
      <label
        htmlFor={id}
        className={cn(
          "absolute left-3 top-3 z-10 flex h-8 w-8 items-center justify-center rounded-full bg-[hsl(var(--card)/0.92)] shadow-sm backdrop-blur-sm",
          disabled ? "cursor-not-allowed" : "cursor-pointer"
        )}
      >
        <input
          id={id}
          type="checkbox"
          checked={effectiveChecked}
          disabled={disabled}
          onChange={onToggle}
          aria-label={title}
          className="peer sr-only"
        />
        <span
          className={cn(
            "flex h-5 w-5 items-center justify-center border border-input bg-card transition-colors",
            "peer-checked:border-primary peer-checked:bg-primary",
            !disabled &&
              "peer-focus-visible:ring-1 peer-focus-visible:ring-ring peer-focus-visible:ring-offset-1"
          )}
        >
          <Check
            className={cn(
              "h-3.5 w-3.5 text-primary-foreground transition-opacity",
              effectiveChecked ? "opacity-100" : "opacity-0"
            )}
          />
        </span>
      </label>
    </div>
  );
}

/**
 * "Complete the Look" bundle band for the product page. Shows the current PDP
 * item (locked, always included) alongside 2-3 companion products, each
 * individually toggleable with its own size picker. One button adds every
 * currently-checked item to the cart in a single action. Pure house
 * monochrome — no accent hue anywhere, including the checkboxes.
 */
export function FrequentlyBoughtTogether({
  product,
  variant,
  companions,
}: FrequentlyBoughtTogetherProps) {
  const { lang, t: dict } = useLang();
  const t = dict.bundle;
  const tp = dict.product;
  const addItem = useCart((s) => s.addItem);
  const openCart = useCart((s) => s.open);
  const headingId = React.useId();

  const [checkedMap, setCheckedMap] = React.useState<Record<string, boolean>>(() =>
    Object.fromEntries(companions.map((c): [string, boolean] => [c.id, true]))
  );
  const [sizeMap, setSizeMap] = React.useState<Record<string, string>>(() =>
    Object.fromEntries(
      companions.map((c): [string, string] => {
        const firstAvailable = c.variants.find((v) => v.available) ?? c.variants[0];
        return [c.id, firstAvailable?.size ?? c.sizes[0] ?? ""];
      })
    )
  );

  if (companions.length === 0) return null;

  // Resolve each companion to its currently-chosen variant once per render, so
  // the card, its price line and the running total all read one source of truth.
  const lines = companions.map((c) => {
    const size = sizeMap[c.id] ?? "";
    const resolved =
      c.sizes.length > 0 ? resolveVariant(c, size) : c.variants.find((v) => v.available);
    const included = !!checkedMap[c.id] && !!resolved;
    return { companion: c, size, resolved, included };
  });

  const total = lines.reduce((sum, l) => {
    if (l.included && l.resolved) return sum + l.resolved.price;
    return sum;
  }, variant.price);

  function handleAdd() {
    addItem(product, variant, 1);
    for (const l of lines) {
      if (l.included && l.resolved) addItem(l.companion, l.resolved, 1);
    }
    toast.success(tp.addedToast);
    openCart();
  }

  return (
    <section aria-labelledby={headingId} className="reveal container mt-16 md:mt-24">
      <div className="border border-border bg-card">
        <div className="border-b border-border px-6 py-6 md:px-10 md:py-7">
          <h2 id={headingId} className="font-serif text-2xl leading-tight md:text-[1.75rem]">
            {t.title}
          </h2>
        </div>

        <div className="grid grid-cols-1 gap-5 px-6 py-8 sm:grid-cols-2 sm:gap-6 md:px-10 lg:grid-cols-4">
          <BundleItemCard
            title={lang === "gr" ? product.titleOriginal : product.title}
            image={product.featuredImage}
            price={variant.price}
            meta={[variant.colorName, variant.size].filter(Boolean).join(" · ")}
            checked
            locked
          />

          {lines.map(({ companion: c, size, resolved }) => (
            <BundleItemCard
              key={c.id}
              title={lang === "gr" ? c.titleOriginal : c.title}
              image={c.featuredImage}
              price={resolved?.price ?? c.price}
              meta={resolved?.colorName}
              checked={!!checkedMap[c.id]}
              onToggle={() => setCheckedMap((m) => ({ ...m, [c.id]: !m[c.id] }))}
              unavailable={!resolved}
              unavailableLabel={tp.comboUnavailable}
            >
              {c.sizes.length > 0 && (
                <div className="mt-3 flex flex-wrap gap-1.5">
                  {c.sizes.map((s) => {
                    const exists = sizeExists(c, s);
                    const avail = sizeAvailable(c, s);
                    const isDisabled = !exists || !avail;
                    return (
                      <button
                        key={s}
                        type="button"
                        disabled={isDisabled}
                        aria-pressed={size === s}
                        onClick={() => setSizeMap((m) => ({ ...m, [c.id]: s }))}
                        className={cn(
                          "min-w-[2.25rem] border px-2 py-1 text-[10.5px] uppercase tracking-wide transition-colors",
                          size === s
                            ? "border-primary bg-primary text-primary-foreground"
                            : "border-input hover:border-primary",
                          isDisabled &&
                            "cursor-not-allowed border-dashed text-muted-foreground/50 line-through hover:border-input"
                        )}
                      >
                        {s}
                      </button>
                    );
                  })}
                </div>
              )}
            </BundleItemCard>
          ))}
        </div>

        <div className="flex flex-col gap-4 border-t border-border px-6 py-6 sm:flex-row sm:items-center sm:justify-between md:px-10">
          <div className="flex items-baseline gap-2.5">
            <span className="eyebrow">{t.total}</span>
            <span className="font-serif text-xl">{formatPrice(total)}</span>
          </div>
          <Button variant="accent" size="lg" onClick={handleAdd} className="w-full sm:w-auto">
            <ShoppingBag className="h-4 w-4" />
            {t.addToBag}
          </Button>
        </div>
      </div>
    </section>
  );
}
