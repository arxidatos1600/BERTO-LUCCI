import { existsSync } from "node:fs";
import path from "node:path";
import type { Metadata } from "next";
import Link from "next/link";
import { ArrowRight, Truck, RefreshCw, ShieldCheck, Sparkles } from "lucide-react";
import { products, getFeatured, getOutlet, getCategoryHighlights } from "@/lib/products";
import { toCardProduct, toCardProducts } from "@/lib/card-product";
import { ProductCard } from "@/components/product-card";
import { SmartImage } from "@/components/smart-image";
import { Hero, type HeroSlide } from "@/components/hero";
import { StoryFeature } from "@/components/story-feature";
import { BestSellers } from "@/components/best-sellers";
import { SummerCollection } from "@/components/summer-collection";
import { SocialFeed } from "@/components/social-feed";
import { Newsletter } from "@/components/newsletter";
import { Button } from "@/components/ui/button";
import { getLang } from "@/lib/get-lang";
import { getDictionary } from "@/lib/i18n";
import { formatPrice } from "@/lib/utils";

export const metadata: Metadata = {
  alternates: { canonical: "/" },
};

export default async function HomePage() {
  const lang = await getLang();
  const dict = getDictionary(lang);
  const t = dict.home;
  // NOTE: every list that ends up inside a <ProductCard> is projected through
  // `toCardProduct` before it crosses the server/client boundary. A full
  // `Product` carries bodyHtml and every variant, and this page hands ~50 of
  // them to client components — all of which get serialised into the RSC payload
  // embedded in the HTML. The projection keeps that markup to what actually
  // paints. `products` (the full set) stays server-side for the picking logic.
  const featuredFull = getFeatured(8);
  const featured = toCardProducts(featuredFull);
  const outlet = toCardProducts(getOutlet(4));
  // The showcase only paints one photo per category, so pass the two image URLs
  // rather than the whole product (which would otherwise cross into SmartImage).
  const categories = getCategoryHighlights(6).map(({ category, product }) => ({
    category,
    local: product.images[0].local,
    src: product.images[0].src,
  }));

  // Curate strong, model-led editorial shots for the rotating hero, padded from
  // featured so several slides are always available. (Data flow unchanged — the
  // hero is a presentational client component fed real product imagery.)
  const heroSlides: HeroSlide[] = (() => {
    // Strictly tailoring: full-length suit looks where the model and face are in
    // frame, in the black / navy / grey / beige palette of the house. A curated
    // order leads with the strongest shots, then pads with any remaining suits.
    const preferred = [
      "ανδρικό-κοστούμι-σε-στενή-γραμμή",
      "ανδρικό-ελαστικό-κοστούμι-με-γιλέκο-slim-fit",
      "ανδρικό-κοστούμι-classic-line-ελαστική-εφαρμογή-σταθερή-γραμμή",
      "ανδρικό-κοστούμι-slim-fit-διαχρονική-κομψότητα-με-μοντέρνο-ύφος",
      "ανδρικό-κοστούμι-slim-fit-peach-feeling",
      "ανδρικό-κοστούμι-με-μεταλλικό-κούμπωμα-ελαστική-άνεση-σύγχρονη-γραμμή",
    ];
    const picks: typeof products = [];
    for (const h of preferred) {
      const p = products.find((x) => x.handle === h && x.images[0]);
      if (p && !picks.includes(p)) picks.push(p);
    }
    for (const p of products) {
      if (picks.length >= 6) break;
      if (p.category === "Suits" && p.images[0] && !picks.includes(p)) picks.push(p);
    }
    return picks.map((p) => ({
      handle: p.handle,
      local: p.images[0].local,
      fallback: p.images[0].src,
      alt: p.title,
      name: lang === "gr" ? p.titleOriginal || p.title : p.title,
      category: lang === "gr" ? p.productTypeGreek || p.category : p.category,
      price: formatPrice(p.price),
    }));
  })();

  // A strong, model-led portrait for the Our Story parallax tile (prefer a
  // tailored coat/blazer/suit shot for the heritage mood).
  const storyProduct =
    products.find((p) => ["Coats", "Blazers"].includes(p.category) && p.images[0]) ??
    products.find((p) => p.category === "Suits" && p.images[0]) ??
    featuredFull[0];
  const storyImage = {
    local: storyProduct.images[0].local,
    fallback: storyProduct.images[0].src,
    alt: storyProduct.title,
  };

  // Tabbed best-sellers — a product set per localized tab category.
  const bestSellersGroups = dict.bestSellers.tabs.map((tab) =>
    toCardProducts(products.filter((p) => p.category === tab.category && p.images[0]).slice(0, 8))
  );

  // A strong editorial shot for the SS26 lookbook banner.
  const lookImg =
    products.find((p) => ["Coats", "Leather Jackets", "Suits"].includes(p.category) && p.images.length > 1) ??
    featuredFull[0];

  // A texture-rich look for the Cloth & Craft feature.
  const editorial =
    products.find((p) => ["Knitwear", "Overshirts", "Printed Shirts"].includes(p.category) && p.images[0]) ??
    featuredFull[1];

  // Summer-season looks for the changing parallax banner — prefer model-led
  // shots (>1 image) from warm-weather categories, one per category for variety.
  const summerImages = (() => {
    const SUMMER_CATS = [
      "Printed Short-Sleeve Shirts",
      "Polo Shirts",
      "Printed Shirts",
      "Chinos",
      "Overshirts",
      "Denim Shorts",
      "T-Shirts",
    ];
    const picks: typeof products = [];
    for (const cat of SUMMER_CATS) {
      const p = products.find((x) => x.category === cat && x.images.length > 1 && !picks.includes(x));
      if (p) picks.push(p);
    }
    for (const p of products) {
      if (picks.length >= 5) break;
      if (SUMMER_CATS.includes(p.category) && p.images[0] && !picks.includes(p)) picks.push(p);
    }
    return picks.slice(0, 5).map((p) => ({
      local: p.images[0].local,
      fallback: p.images[0].src,
      alt: p.title,
    }));
  })();

  // Model-led shots for the Instagram feed grid (one per category, for variety).
  const socialPosts = (() => {
    const cats = ["Suits", "Polo Shirts", "Check Shirts", "Printed Shirts", "Overshirts", "Jeans", "T-Shirts", "Coats"];
    const picks: typeof products = [];
    for (const cat of cats) {
      const p = products.find((x) => x.category === cat && x.images.length > 1 && !picks.includes(x));
      if (p) picks.push(p);
    }
    for (const p of products) {
      if (picks.length >= 6) break;
      if (p.images.length > 1 && !picks.includes(p)) picks.push(p);
    }
    // Carry the CDN url too: these tiles must still render on a machine that
    // doesn't have the local image library (it isn't in the repo).
    return picks.slice(0, 6).map((p) => ({
      img: p.images[0].local,
      imgSrc: p.images[0].src,
      alt: p.title,
    }));
  })();

  // Real @berto.lucci TikTok video IDs (they play inline via TikTok's embed).
  // Self-hosted reels — served from /public/videos, so no TikTok embed script
  // and no third-party cookies. `href` keeps the original permalink so a reel
  // whose file isn't present yet still links out instead of dying.
  //
  // Existence is resolved HERE, on the server: emitting a <video src> for a file
  // that doesn't exist costs a hard 404 (plus a poster 404) on every single page
  // load. Checking first means a missing reel renders as a link-out card and
  // makes no request at all.
  const reels = [
    { src: "/videos/reel-1.mp4", poster: "/videos/reel-1.jpg", href: "https://www.tiktok.com/@berto.lucci/video/7515798591395335457" },
    { src: "/videos/reel-2.mp4", poster: "/videos/reel-2.jpg", href: "https://www.tiktok.com/@berto.lucci/video/7505121995588373783" },
    { src: "/videos/reel-3.mp4", poster: "/videos/reel-3.jpg", href: "https://www.tiktok.com/@berto.lucci/video/7494353611355376918" },
  ].map((r) => {
    const inPublic = (p: string) => existsSync(path.join(process.cwd(), "public", p));
    return {
      ...r,
      available: inPublic(r.src),
      poster: inPublic(r.poster) ? r.poster : undefined,
    };
  });

  return (
    <>
      {/* ============================ HERO ============================ */}
      <Hero slides={heroSlides} t={t.hero} />

      {/* ======================= OUR STORY ========================= */}
      <StoryFeature t={t.story} image={storyImage} />

      {/* ====================== SERVICE STRIP ======================= */}
      <section className="relative border-b border-border bg-card">
        <div className="container grid grid-cols-1 divide-y divide-border sm:grid-cols-3 sm:divide-x sm:divide-y-0">
          {[Truck, RefreshCw, ShieldCheck].map((Icon, i) => (
            <div
              key={t.services[i].title}
              className="group flex items-center justify-start gap-3.5 px-4 py-6 transition-colors hover:bg-secondary/60 sm:px-6"
            >
              <span className="flex h-10 w-10 shrink-0 items-center justify-center rounded-full bg-secondary text-accent transition-colors duration-500 group-hover:bg-accent group-hover:text-accent-foreground">
                <Icon className="h-[18px] w-[18px] transition-transform duration-500 group-hover:scale-110" />
              </span>
              <div>
                <p className="text-sm font-medium text-navy">{t.services[i].title}</p>
                <p className="text-xs text-muted-foreground">{t.services[i].text}</p>
              </div>
            </div>
          ))}
        </div>
      </section>

      {/* ====================== NEW ARRIVALS ======================= */}
      <section className="relative overflow-hidden bg-secondary py-20 md:py-28">
        {/* Highlighted areas — soft champagne + navy light pools and a top hairline */}
        <div className="hairline-gold absolute inset-x-0 top-0" />
        <div className="pointer-events-none absolute -right-40 top-0 h-[34rem] w-[34rem] rounded-full bg-[radial-gradient(circle_at_center,hsl(var(--camel-light)/0.5),transparent_70%)]" />
        <div className="pointer-events-none absolute -left-40 bottom-0 h-[28rem] w-[28rem] rounded-full bg-[radial-gradient(circle_at_center,hsl(var(--ink-navy)/0.07),transparent_70%)]" />
        {/* Oversized typographic watermark — fully visible, graphite metallic + depth */}
        <span
          aria-hidden="true"
          className="text-graphite txt-depth-light pointer-events-none absolute right-5 top-8 select-none whitespace-nowrap font-display text-[1.85rem] italic leading-none opacity-90 sm:right-8 sm:text-[3rem] lg:text-[4.5rem]"
        >
          Season 2026
        </span>

        <div className="container relative">
          <div className="reveal mb-12 flex flex-col items-start gap-5 sm:flex-row sm:items-end sm:justify-between">
            <div>
              <span className="chip-beige">{t.newArrivals.eyebrow}</span>
              <h2 className="mt-4 font-display text-4xl font-medium text-navy md:text-5xl">{t.newArrivals.title}</h2>
              <div className="mt-4 h-px w-16 bg-accent/70" />
            </div>
            <Link
              href="/shop"
              className="link-underline text-xs uppercase tracking-luxe text-navy"
            >
              {t.newArrivals.viewAll}
            </Link>
          </div>

          <div className="grid grid-cols-2 gap-x-5 gap-y-10 md:grid-cols-4">
            {featured.map((p) => (
              <div key={p.id} className="reveal-lift rounded-sm bg-card/0 p-2 transition-all duration-500 hover:bg-card/70 hover:shadow-[0_30px_60px_-32px_hsl(var(--ink-navy)/0.35)]">
                <ProductCard product={p} />
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* =================== SUMMER 2026 EDIT ====================== */}
      <SummerCollection images={summerImages} />

      {/* ====================== BEST SELLERS ======================= */}
      <BestSellers groups={bestSellersGroups} />

      {/* ===================== CATEGORY SHOWCASE ==================== */}
      <section className="relative bg-secondary/50 py-20 md:py-24">
        <div className="hairline-gold absolute inset-x-0 top-0 opacity-70" />
        <div className="container">
          <div className="reveal mb-12 text-center">
            <span className="chip-beige">{t.categories.eyebrow}</span>
            <h2 className="mt-4 font-display text-4xl font-medium text-navy md:text-5xl">{t.categories.title}</h2>
            <div className="mx-auto mt-5 h-px w-16 bg-accent/70" />
          </div>
          <div className="grid grid-cols-2 gap-4 md:grid-cols-3">
            {categories.map(({ category, local, src }) => (
              <Link
                key={category}
                href={`/shop?category=${encodeURIComponent(category)}`}
                className="parallax-frame group reveal-lift relative aspect-[4/5] bg-secondary"
              >
                <div className="parallax-inner">
                  <SmartImage
                    local={local}
                    fallback={src}
                    alt={category}
                    sizes="(max-width: 768px) 50vw, 33vw"
                    className="h-full w-full object-cover"
                  />
                </div>
                <div className="absolute inset-0 bg-gradient-to-t from-[hsl(var(--navy-900)/0.85)] via-transparent to-transparent transition-opacity duration-500 group-hover:from-[hsl(var(--navy-900)/0.92)]" />
                <div className="absolute inset-x-0 bottom-0 p-5 text-[hsl(var(--cream))]">
                  <h3 className="font-display text-xl font-medium md:text-2xl">{category}</h3>
                  <span className="mt-1 inline-flex translate-y-0 items-center gap-1.5 text-[10px] uppercase tracking-luxe text-[hsl(var(--camel-light))] opacity-0 transition-all duration-500 group-hover:gap-2.5 group-hover:opacity-100">
                    {t.categories.shopNow} <ArrowRight className="h-3 w-3" />
                  </span>
                </div>
                <span className="pointer-events-none absolute inset-0 border border-accent/0 transition-colors duration-500 group-hover:border-accent/60" />
              </Link>
            ))}
          </div>
        </div>
      </section>

      {/* ====================== LOOKBOOK SS26 ====================== */}
      <section className="on-dark parallax-frame relative h-[72vh] min-h-[460px] w-full bg-[hsl(var(--navy-900))]">
        <div className="parallax-inner">
          <SmartImage
            local={lookImg.images[0].local}
            fallback={lookImg.images[0].src}
            alt={lookImg.title}
            sizes="100vw"
            className="h-full w-full object-cover object-[center_22%] contrast-[1.03] md:object-top"
          />
        </div>
        <div className="absolute inset-0 bg-gradient-to-r from-[hsl(var(--navy-900)/0.82)] via-[hsl(var(--navy-900)/0.35)] to-transparent" />
        <div className="container relative flex h-full flex-col justify-center text-[hsl(var(--cream))]">
          <p className="reveal eyebrow text-[hsl(var(--camel-light))]">{dict.lookbook.eyebrow}</p>
          <h2 className="reveal mt-4 max-w-xl font-display text-4xl font-medium leading-[1.05] md:text-6xl">
            {dict.lookbook.title}
          </h2>
          <p className="reveal mt-4 max-w-md text-sm leading-relaxed text-[hsl(var(--cream)/0.85)]">
            {dict.lookbook.subtitle}
          </p>
          <div className="reveal mt-8">
            <Button size="lg" variant="accent" className="btn-sheen" asChild>
              <Link href="/shop">
                {dict.lookbook.cta} <ArrowRight className="h-4 w-4" />
              </Link>
            </Button>
          </div>
        </div>
      </section>

      {/* ====================== CLOTH & CRAFT ====================== */}
      <section className="grid items-stretch md:grid-cols-2">
        <div className="parallax-frame reveal-zoom relative min-h-[440px] bg-secondary md:order-2">
          <div className="parallax-inner">
            <SmartImage
              local={editorial.images[0].local}
              fallback={editorial.images[0].src}
              alt={editorial.title}
              sizes="(max-width: 768px) 100vw, 50vw"
              className="h-full w-full object-cover object-[center_18%]"
            />
          </div>
        </div>
        <div className="on-dark reveal flex flex-col justify-center bg-primary p-10 text-primary-foreground md:order-1 md:p-16 xl:p-20">
          <Sparkles className="mb-5 h-6 w-6 text-accent" />
          <p className="eyebrow text-[hsl(var(--cream)/0.7)]">{t.editorial.eyebrow}</p>
          <h2 className="mt-3 font-display text-3xl font-medium leading-tight md:text-[2.6rem]">
            {t.editorial.title} <span className="italic text-gold">{t.editorial.titleYear}</span>
          </h2>
          <p className="mt-5 max-w-md text-sm leading-relaxed text-[hsl(var(--cream)/0.8)]">
            {t.editorial.body}
          </p>
          <div className="mt-8 flex flex-wrap gap-3">
            <Button variant="accent" className="btn-sheen" asChild>
              <Link href="/shop?category=Suits">
                {t.editorial.ctaStory} <ArrowRight className="h-4 w-4" />
              </Link>
            </Button>
            <Button
              variant="outline"
              asChild
              className="border-[hsl(var(--cream)/0.4)] bg-transparent text-[hsl(var(--cream))] hover:bg-[hsl(var(--cream))] hover:text-[hsl(var(--navy))]"
            >
              <Link href="/shop">{t.editorial.ctaShop}</Link>
            </Button>
          </div>
        </div>
      </section>

      {/* ========================= OUTLET ========================== */}
      {outlet.length > 0 && (
        <section className="container pb-24">
          <div className="reveal mb-12 flex items-end justify-between border-t border-border pt-16">
            <div>
              <p className="eyebrow text-destructive">{t.outlet.eyebrow}</p>
              <h2 className="mt-3 font-display text-4xl font-medium md:text-5xl">{t.outlet.title}</h2>
              <p className="mt-2 text-sm text-muted-foreground">
                {t.outlet.subtitle}
              </p>
            </div>
            <Link
              href="/shop?sale=1"
              className="link-underline hidden text-xs uppercase tracking-luxe sm:inline-block"
            >
              {t.outlet.shopOutlet}
            </Link>
          </div>
          <div className="grid grid-cols-2 gap-x-5 gap-y-10 md:grid-cols-4">
            {outlet.map((p) => (
              <ProductCard key={p.id} product={p} className="reveal" />
            ))}
          </div>
        </section>
      )}

      {/* ===================== SOCIAL / TIKTOK ===================== */}
      <SocialFeed igPosts={socialPosts} reels={reels} />

      {/* ======================= NEWSLETTER ======================== */}
      <Newsletter />
    </>
  );
}
