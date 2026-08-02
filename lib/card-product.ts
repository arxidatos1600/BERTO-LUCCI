import type { Product, ProductColor, ProductImage, Variant } from "./types";

/**
 * The only fields a <ProductCard> (and the shop grid's filter/sort logic) reads.
 *
 * Why this type exists: the homepage rails are server components that hand
 * products to a CLIENT component, so every product passed down is serialised in
 * full into the RSC payload embedded in the HTML. A `Product` carries
 * `bodyHtml` (the complete marketing description) plus every `Variant` (one per
 * colour x size, with prices and image URLs) — none of which a card renders.
 * With ~50 products across the homepage rails that was ~850 KB of uncompressed
 * markup shipped to paint 50 thumbnails.
 *
 * `Product` is structurally assignable to `CardProduct`, so anything that still
 * has a full product keeps working; `variants` stays optional for exactly that
 * reason (see `colorImage` in product-card.tsx, which uses it as a fallback when
 * a colour has no pre-resolved photo).
 *
 * This mirrors the shape scripts/build-shop-list.mjs already writes for the
 * client-side shop feed — keep the two in step.
 */
export interface CardProduct {
  id: string;
  handle: string;
  title: string;
  titleOriginal: string;
  category: string;
  productTypeGreek: string;
  price: number;
  compareAtPrice: number | null;
  onSale: boolean;
  salePercent: number;
  available: boolean;
  colors: ProductColor[];
  sizes: string[];
  /** Primary shot plus the hover shot. Nothing else is ever rendered on a card. */
  images: ProductImage[];
  /** Only present when a full `Product` was passed through unchanged. */
  variants?: Variant[];
}

/**
 * Project a full `Product` down to what a card needs, resolving each colour's
 * variant photo up front so the card never has to walk `variants` at runtime.
 */
export function toCardProduct(p: Product): CardProduct {
  const primaryLocal = p.images?.[0]?.local;

  // Keyed by both the English colour name and the original Greek option value,
  // because `ProductColor` matches on either.
  const colorImg = new Map<string, { local: string; src: string }>();
  for (const v of p.variants || []) {
    if (!v.image) continue;
    for (const key of [v.colorName, v.color]) {
      if (key && !colorImg.has(key)) colorImg.set(key, { local: v.image, src: v.imageSrc });
    }
  }

  return {
    id: p.id,
    handle: p.handle,
    title: p.title,
    titleOriginal: p.titleOriginal,
    category: p.category,
    productTypeGreek: p.productTypeGreek,
    price: p.price,
    compareAtPrice: p.compareAtPrice,
    onSale: p.onSale,
    salePercent: p.salePercent,
    available: p.available,
    sizes: p.sizes,
    colors: (p.colors || []).map((c) => {
      const ci = colorImg.get(c.name) ?? colorImg.get(c.value);
      // Carry the photo only when it actually differs from the primary shot,
      // otherwise the swatch would "switch" to the image already on screen.
      const hasOwn = ci && ci.local && ci.local !== primaryLocal;
      return {
        value: c.value,
        name: c.name,
        hex: c.hex,
        pattern: c.pattern,
        ...(hasOwn ? { img: ci.local, imgSrc: ci.src } : {}),
      };
    }),
    images: (p.images || []).slice(0, 2).map((i) => ({ local: i.local, src: i.src, alt: i.alt })),
  };
}

export const toCardProducts = (list: Product[]): CardProduct[] => list.map(toCardProduct);
