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

/**
 * Real Berto Lucci shipping policy: free over €40, otherwise a €3.50 flat rate.
 * Lives here because BOTH the /cart summary and the slide-over bag quote it —
 * when only /cart knew the rule, the drawer (where most people actually check
 * out) silently showed a subtotal as if it were the total.
 */
export const FREE_SHIPPING_THRESHOLD = 40;
export const FLAT_SHIPPING_RATE = 3.5;

/** Shipping cost for a given subtotal. An empty bag ships nothing. */
export function shippingFor(subtotal: number): number {
  return subtotal >= FREE_SHIPPING_THRESHOLD || subtotal === 0 ? 0 : FLAT_SHIPPING_RATE;
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
