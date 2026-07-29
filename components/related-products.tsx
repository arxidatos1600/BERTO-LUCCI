import type { Product } from "@/lib/types";
import { ProductCard } from "./product-card";
import { getLang } from "@/lib/get-lang";
import { getDictionary } from "@/lib/i18n";

export async function RelatedProducts({ products }: { products: Product[] }) {
  if (!products.length) return null;
  const t = getDictionary(await getLang()).product;
  return (
    <section className="container mt-20">
      <div className="mb-10 text-center">
        <h2 className="font-display text-3xl font-medium md:text-4xl">{t.relatedTitle}</h2>
        <div className="mx-auto mt-5 h-px w-16 bg-accent/60" />
      </div>
      <div className="grid grid-cols-2 gap-x-5 gap-y-9 md:grid-cols-4">
        {products.map((p) => (
          <ProductCard key={p.id} product={p} />
        ))}
      </div>
    </section>
  );
}
