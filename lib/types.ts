/**
 * Domain types for the Berto Lucci storefront.
 * These mirror the shape produced by build_dataset.py ->
 * public/data/bertolucci_products.json
 */

export interface ProductImage {
  /** Local path under /public, e.g. /bertolucci_images/{handle}/01_xxx.jpg */
  local: string;
  /** Original Shopify CDN URL — used as a graceful fallback. */
  src: string;
  alt: string;
}

export interface ProductColor {
  /** Original Greek option value (kept for matching variants). */
  value: string;
  /** English display name, e.g. "Navy". */
  name: string;
  /** Swatch hex. */
  hex: string;
  /** True for tie/pocket-square "pattern" swatches (no single colour). */
  pattern: boolean;
  /** This colour's variant photo (local path) — present in the slim shop feed
   *  when it differs from the product's primary image. */
  img?: string;
  /** Remote CDN fallback for the colour's variant photo. */
  imgSrc?: string;
}

export interface Variant {
  id: string;
  color: string;        // Greek option value
  colorName: string;    // English
  colorHex: string;
  size: string;
  price: number;
  compareAtPrice: number | null;
  available: boolean;
  image: string;        // local path of this variant's featured image
  imageSrc: string;     // remote fallback
}

export interface Product {
  id: string;
  handle: string;
  title: string;             // clean English title, e.g. "Navy Silk Tie"
  titleOriginal: string;     // original Greek title
  category: string;          // English category label
  productTypeGreek: string;
  bodyHtml: string;
  price: number;             // lowest variant price
  compareAtPrice: number | null;
  onSale: boolean;
  salePercent: number;
  colors: ProductColor[];
  sizes: string[];
  featuredImage: { local: string; src: string };
  images: ProductImage[];
  variants: Variant[];
  available: boolean;
}

export interface Facets {
  categories: { name: string; count: number }[];
  colors: { name: string; hex: string; count: number }[];
  sizes: string[];
  priceMin: number;
  priceMax: number;
  total: number;
  onSaleCount: number;
}

/** A single line in the shopping cart. */
export interface CartItem {
  key: string;          // `${productId}:${variantId}`
  productId: string;
  handle: string;
  variantId: string;
  title: string;
  /** Greek product name, kept alongside the English one so a language switch
   *  after adding to the bag still renders the right label. Optional so carts
   *  already persisted in localStorage keep working. */
  titleGr?: string;
  colorName: string;
  size: string;
  price: number;
  image: string;
  imageSrc: string;
  quantity: number;
}
