import type { Product, Facets } from "./types";
// Imported at build time for server components (home + product pages). This file
// lives in `data/`, NOT `public/data/`: anything under public/ is served as a
// static asset, so the full 7.9 MB catalogue (every variant, price, cost-bearing
// description and unpublished field) was downloadable at /data/bertolucci_products.json
// and was shipped in the deployment for no reason. The bundler inlines what the
// server actually uses, and the browser gets the slim `public/data/shop-list.json`
// projection instead (see scripts/build-shop-list.mjs).
import productsJson from "@/data/bertolucci_products.json";
import facetsJson from "@/public/data/facets.json";

export const products = productsJson as unknown as Product[];
export const facets = facetsJson as unknown as Facets;

/** All product handles (used by generateStaticParams). */
export function getAllHandles(): string[] {
  return products.map((p) => p.handle);
}

/** Find a product by handle, tolerant of URL-encoding. */
export function getProduct(handle: string): Product | undefined {
  const decoded = safeDecode(handle);
  return products.find((p) => p.handle === handle || p.handle === decoded);
}

function safeDecode(s: string): string {
  try {
    return decodeURIComponent(s);
  } catch {
    return s;
  }
}

/** Related products: same category first, then padded with other items. */
export function getRelated(product: Product, limit = 4): Product[] {
  const sameCategory = products.filter(
    (p) => p.category === product.category && p.handle !== product.handle
  );
  const others = products.filter(
    (p) => p.category !== product.category && p.handle !== product.handle
  );
  return [...sameCategory, ...others].slice(0, limit);
}

/** A curated, stable selection for the homepage "featured" rail. */
export function getFeatured(limit = 8): Product[] {
  // Prefer items with multiple images for a richer hero grid.
  return [...products]
    .filter((p) => p.images.length >= 3)
    .slice(0, limit);
}

/** Synthesized outlet items (deterministic sale flag from the dataset). */
export function getOutlet(limit = 8): Product[] {
  return products.filter((p) => p.onSale).slice(0, limit);
}

/** One representative product per top category, for the category showcase. */
export function getCategoryHighlights(limit = 6): { category: string; product: Product }[] {
  const seen = new Set<string>();
  const out: { category: string; product: Product }[] = [];
  for (const cat of facets.categories) {
    if (seen.has(cat.name)) continue;
    const product = products.find((p) => p.category === cat.name);
    if (product) {
      out.push({ category: cat.name, product });
      seen.add(cat.name);
    }
    if (out.length >= limit) break;
  }
  return out;
}
