import { clsx, type ClassValue } from "clsx";
import { twMerge } from "tailwind-merge";

/** Merge Tailwind class names without conflicts (shadcn convention). */
export function cn(...inputs: ClassValue[]) {
  return twMerge(clsx(inputs));
}

/** Format a number as EUR currency, e.g. 32 -> "€32.00". */
export function formatPrice(value: number): string {
  return new Intl.NumberFormat("en-IE", {
    style: "currency",
    currency: "EUR",
    minimumFractionDigits: 2,
  }).format(value);
}

/** Percentage discount between an original and a sale price. */
export function discountPercent(price: number, compareAt?: number | null): number {
  if (!compareAt || compareAt <= price) return 0;
  return Math.round(((compareAt - price) / compareAt) * 100);
}

/**
 * Serialise an object for a <script type="application/ld+json"> tag. Escapes the
 * `<` character so a value containing `</script>` (e.g. in a product title or
 * description) can never break out of the script element — the standard XSS-safe
 * way to embed JSON-LD.
 */
export function jsonLdSafe(data: unknown): string {
  return JSON.stringify(data).replace(/</g, "\\u003c");
}
