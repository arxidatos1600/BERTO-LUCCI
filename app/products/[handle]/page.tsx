import type { Metadata } from "next";
import Link from "next/link";
import { notFound } from "next/navigation";
import { ChevronRight } from "lucide-react";
import { getProduct, getRelated, getAllHandles } from "@/lib/products";
import { jsonLdSafe } from "@/lib/utils";
import { ProductDetail } from "@/components/product-detail";
import { RelatedProducts } from "@/components/related-products";

interface PageProps {
  params: Promise<{ handle: string }>;
}

const SITE_URL = "https://www.bertolucci.com.gr";
const stripHtml = (s: string) => s.replace(/<[^>]+>/g, " ").replace(/\s+/g, " ").replace(/—/g, ",").trim();
const abs = (local: string) => `${SITE_URL}${encodeURI(local)}`;

// Pre-render every product page at build time.
export function generateStaticParams() {
  return getAllHandles().map((handle) => ({ handle }));
}

export async function generateMetadata({ params }: PageProps): Promise<Metadata> {
  const { handle } = await params;
  const product = getProduct(handle);
  if (!product) return { title: "Product not found" };

  const desc = `${product.title}: ${product.category.toLowerCase()} by Berto Lucci, tailored from Italian-designed cloth. Free shipping over 40 euro and easy 14 day returns.`;
  const path = `/products/${encodeURIComponent(product.handle)}`;
  // Prefer the Shopify CDN URL: /public/bertolucci_images is excluded from the
  // deployment, so an absolute local path would 404 for crawlers and social
  // unfurlers. Fall back to the local path only if a product has no CDN src.
  const image = product.images[0]
    ? (product.images[0].src || abs(product.images[0].local))
    : undefined;

  return {
    title: product.title,
    description: desc,
    alternates: { canonical: path },
    openGraph: {
      type: "website",
      title: `${product.title} · Berto Lucci`,
      description: desc,
      url: `${SITE_URL}${path}`,
      images: image ? [{ url: image, alt: product.title }] : undefined,
    },
    twitter: {
      card: "summary_large_image",
      title: `${product.title} · Berto Lucci`,
      description: desc,
      images: image ? [image] : undefined,
    },
  };
}

export default async function ProductPage({ params }: PageProps) {
  const { handle } = await params;
  const product = getProduct(handle);
  if (!product) notFound();

  const related = getRelated(product, 4);

  const productJsonLd = {
    "@context": "https://schema.org",
    "@type": "Product",
    name: product.title,
    image: product.images.slice(0, 4).map((i) => i.src || abs(i.local)),
    description: stripHtml(product.bodyHtml).slice(0, 320) ||
      `${product.title}, ${product.category} by Berto Lucci.`,
    sku: product.id,
    mpn: product.id,
    category: product.category,
    brand: { "@type": "Brand", name: "Berto Lucci" },
    ...(product.colors.length ? { color: product.colors.map((c) => c.name).join(", ") } : {}),
    offers: {
      "@type": "Offer",
      priceCurrency: "EUR",
      price: product.price.toFixed(2),
      availability: product.available
        ? "https://schema.org/InStock"
        : "https://schema.org/OutOfStock",
      itemCondition: "https://schema.org/NewCondition",
      url: `${SITE_URL}/products/${encodeURIComponent(product.handle)}`,
      priceValidUntil: "2026-12-31",
      seller: { "@type": "Organization", name: "Berto Lucci" },
    },
  };

  const breadcrumbJsonLd = {
    "@context": "https://schema.org",
    "@type": "BreadcrumbList",
    itemListElement: [
      { "@type": "ListItem", position: 1, name: "Home", item: SITE_URL },
      {
        "@type": "ListItem",
        position: 2,
        name: product.category,
        item: `${SITE_URL}/shop?category=${encodeURIComponent(product.category)}`,
      },
      { "@type": "ListItem", position: 3, name: product.title },
    ],
  };

  return (
    <div className="py-8 lg:py-12">
      <script type="application/ld+json" dangerouslySetInnerHTML={{ __html: jsonLdSafe(productJsonLd) }} />
      <script type="application/ld+json" dangerouslySetInnerHTML={{ __html: jsonLdSafe(breadcrumbJsonLd) }} />
      {/* Breadcrumb */}
      <nav className="container mb-8 flex items-center gap-1.5 text-xs text-muted-foreground">
        <Link href="/" className="hover:text-foreground">Home</Link>
        <ChevronRight className="h-3 w-3" />
        <Link
          href={`/shop?category=${encodeURIComponent(product.category)}`}
          className="hover:text-foreground"
        >
          {product.category}
        </Link>
        <ChevronRight className="h-3 w-3" />
        <span className="truncate text-foreground">{product.title}</span>
      </nav>

      <div className="container">
        <ProductDetail product={product} />
      </div>

      <RelatedProducts products={related} />
    </div>
  );
}
