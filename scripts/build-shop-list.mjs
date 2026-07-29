/**
 * Generate public/data/shop-list.json — a slim projection of the full
 * bertolucci_products.json containing ONLY the fields the client-side shop grid
 * and filters need (card + facet data). The full file (~7.6 MB, with bodyHtml +
 * every variant + every image) is never shipped to the browser; product detail
 * pages read the full file server-side at build time instead.
 *
 * Run automatically via the `prebuild` npm script, or manually:
 *   node scripts/build-shop-list.mjs
 */
import { readFileSync, writeFileSync } from "fs";
import { dirname, join } from "path";
import { fileURLToPath } from "url";

const root = join(dirname(fileURLToPath(import.meta.url)), "..");
const SRC = join(root, "public/data/bertolucci_products.json");
const OUT = join(root, "public/data/shop-list.json");

const products = JSON.parse(readFileSync(SRC, "utf8"));

const slim = products.map((p) => {
  const primaryLocal = p.images?.[0]?.local;
  // Map each colour to its variant's featured image (so the card can swap the
  // photo to the selected colour). Keyed by both English name and Greek value.
  const colorImg = {};
  for (const v of p.variants || []) {
    if (!v.image) continue;
    for (const key of [v.colorName, v.color]) {
      if (key && !colorImg[key]) colorImg[key] = { local: v.image, src: v.imageSrc };
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
    colors: (p.colors || []).map((c) => {
      const ci = colorImg[c.name] || colorImg[c.value];
      // Only carry the image when it actually differs from the primary shot.
      const hasOwn = ci && ci.local && ci.local !== primaryLocal;
      return {
        value: c.value,
        name: c.name,
        hex: c.hex,
        pattern: c.pattern,
        ...(hasOwn ? { img: ci.local, imgSrc: ci.src } : {}),
      };
    }),
    sizes: p.sizes,
    // Only the first two images (primary + hover) are used by the product card.
    images: (p.images || []).slice(0, 2).map((i) => ({ local: i.local, src: i.src, alt: i.alt })),
  };
});

writeFileSync(OUT, JSON.stringify(slim));

const kb = (Buffer.byteLength(JSON.stringify(slim)) / 1024).toFixed(0);
console.log(`✓ shop-list.json written: ${slim.length} products, ${kb} KB`);
