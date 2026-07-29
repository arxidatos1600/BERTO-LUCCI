import type { Metadata } from "next";
import Link from "next/link";
import { ArrowRight, Phone, Mail, MapPin, Clock, Scissors, Users, Heart } from "lucide-react";
import { products } from "@/lib/products";
import { SmartImage } from "@/components/smart-image";
import { StoreMap } from "@/components/store-map";
import { Button } from "@/components/ui/button";
import { jsonLdSafe } from "@/lib/utils";
import { getLang } from "@/lib/get-lang";
import { getDictionary } from "@/lib/i18n";

const SITE_URL = "https://www.bertolucci.com.gr";

export const metadata: Metadata = {
  title: "Our Story",
  description:
    "Berto Lucci is a family-owned Greek menswear house founded in Athens in 1976 and designed in collaboration with renowned Italian ateliers. Discover the heritage and the boutiques.",
  alternates: { canonical: "/about" },
  openGraph: {
    type: "website",
    title: "Our Story · Berto Lucci",
    description:
      "A family-owned Greek menswear house founded in Athens in 1976, with twenty boutiques across Greece.",
    url: `${SITE_URL}/about`,
  },
};

const VALUE_ICONS = [Scissors, Heart, Users];
const CONTACT_ICONS = [Phone, Mail, MapPin, Clock];

export default async function AboutPage() {
  const lang = await getLang();
  const t = getDictionary(lang).about;

  // Pull a couple of real garments for editorial imagery.
  const heroImg =
    products.find((p) => ["Suits", "Coats", "Blazers"].includes(p.category)) ?? products[0];
  const sideImg =
    products.find((p) => p.category === "Ties") ?? products[1];

  // Store directory as structured data (English names) for local SEO.
  const en = getDictionary("en").about.stores;
  const storesJsonLd = {
    "@context": "https://schema.org",
    "@type": "ItemList",
    name: "Berto Lucci boutiques",
    itemListElement: en.groups
      .flatMap((g) => g.stores)
      .map(([city, address, tel], i) => ({
        "@type": "ListItem",
        position: i + 1,
        item: {
          "@type": "ClothingStore",
          name: `Berto Lucci ${city}`,
          address: { "@type": "PostalAddress", streetAddress: address, addressLocality: city, addressCountry: "GR" },
          telephone: `+30 ${tel}`,
          parentOrganization: { "@type": "Organization", name: "Berto Lucci", url: SITE_URL },
        },
      })),
  };

  return (
    <div>
      <script type="application/ld+json" dangerouslySetInnerHTML={{ __html: jsonLdSafe(storesJsonLd) }} />
      {/* ============================ HERO ============================ */}
      <section className="on-dark parallax-frame relative h-[64vh] min-h-[440px] w-full bg-[hsl(var(--navy-900))]">
        <div className="parallax-inner">
          <SmartImage
            local={heroImg.images[0].local}
            fallback={heroImg.images[0].src}
            alt="Berto Lucci"
            sizes="100vw"
            className="h-full w-full object-cover object-[center_16%] opacity-85"
          />
        </div>
        <div className="absolute inset-0 bg-gradient-to-t from-[hsl(var(--navy-900)/0.92)] via-[hsl(var(--navy-900)/0.45)] to-[hsl(var(--navy-900)/0.5)]" />
        <div className="container relative flex h-full flex-col justify-end pb-16 text-[hsl(var(--cream))]">
          <p className="eyebrow animate-rise-in text-[hsl(var(--camel-light))]" style={{ animationDelay: "0.1s" }}>
            {t.hero.eyebrow}
          </p>
          <h1
            className="mt-4 max-w-3xl animate-blur-in font-display text-4xl font-medium leading-[1.02] md:text-6xl lg:text-7xl"
            style={{ animationDelay: "0.25s" }}
          >
            {t.hero.title} <span className="italic text-gold">{t.hero.titleYear}</span>
          </h1>
        </div>
      </section>

      {/* ========================= HISTORY ========================= */}
      <section id="history" className="container grid gap-12 scroll-mt-24 py-20 md:grid-cols-2 md:gap-16 md:py-24">
        <div className="reveal">
          <p className="eyebrow-gold">{t.history.eyebrow}</p>
          <h2 className="mt-3 font-display text-3xl font-medium leading-tight md:text-[2.6rem]">
            {t.history.title}
          </h2>
          <div className="mt-6 h-px w-16 bg-accent/60" />
        </div>
        <div className="prose-bl reveal max-w-xl text-[15px]">
          <p>{t.history.p1}</p>
          <p>{t.history.p2}</p>
        </div>
      </section>

      {/* ========================== STATS ========================== */}
      <section className="on-dark relative overflow-hidden bg-primary text-primary-foreground">
        <div className="hairline-gold absolute inset-x-0 top-0" />
        <div className="container grid grid-cols-2 gap-y-10 py-16 md:grid-cols-4">
          {t.stats.map((s, i) => (
            <div
              key={s.l}
              className={`reveal px-4 text-center ${i < 3 ? "md:border-r md:border-[hsl(var(--navy-700))]" : ""}`}
            >
              <p className="font-display text-5xl font-medium text-gold md:text-6xl">{s.n}</p>
              <p className="eyebrow mt-3 text-[hsl(var(--cream)/0.65)]">{s.l}</p>
            </div>
          ))}
        </div>
      </section>

      {/* ========================= VALUES ========================== */}
      <section id="craft" className="container scroll-mt-24 py-20 md:py-24">
        <div className="reveal mb-14 text-center">
          <p className="eyebrow-gold">{t.values.eyebrow}</p>
          <h2 className="mt-3 font-display text-4xl font-medium md:text-5xl">{t.values.title}</h2>
          <div className="mx-auto mt-5 h-px w-16 bg-accent/60" />
        </div>
        <div className="grid gap-10 md:grid-cols-3">
          {t.values.items.map((item, i) => {
            const Icon = VALUE_ICONS[i];
            return (
              <div key={item.title} className="group reveal text-center">
                <div className="mx-auto flex h-16 w-16 items-center justify-center rounded-full border border-accent/30 bg-secondary text-accent transition-colors duration-500 group-hover:bg-accent group-hover:text-accent-foreground">
                  <Icon className="h-6 w-6" />
                </div>
                <h3 className="mt-5 font-display text-xl font-medium">{item.title}</h3>
                <p className="mt-3 text-sm leading-relaxed text-muted-foreground">{item.text}</p>
              </div>
            );
          })}
        </div>
      </section>

      {/* ======================== EDITORIAL ======================== */}
      <section className="container grid items-stretch py-10 md:grid-cols-2">
        <div className="on-dark reveal flex flex-col justify-center bg-primary p-10 text-primary-foreground md:p-16">
          <p className="eyebrow text-[hsl(var(--cream)/0.7)]">{t.network.eyebrow}</p>
          <h2 className="mt-3 font-display text-3xl font-medium leading-tight md:text-[2.6rem]">
            {t.network.title}
          </h2>
          <p className="mt-5 max-w-md text-sm leading-relaxed text-[hsl(var(--cream)/0.8)]">
            {t.network.body}
          </p>
          <div className="mt-8">
            <Button variant="accent" className="btn-sheen" asChild>
              <Link href="/shop">
                {t.network.cta} <ArrowRight className="h-4 w-4" />
              </Link>
            </Button>
          </div>
        </div>
        <div className="parallax-frame reveal-zoom relative aspect-[4/3] bg-secondary md:aspect-auto">
          <div className="parallax-inner">
            <SmartImage
              local={sideImg.images[0].local}
              fallback={sideImg.images[0].src}
              alt={sideImg.title}
              sizes="(max-width: 768px) 100vw, 50vw"
              className="h-full w-full object-cover object-[center_18%]"
            />
          </div>
        </div>
      </section>

      {/* ====================== STORE DIRECTORY ===================== */}
      <section id="stores" className="on-dark relative scroll-mt-24 bg-background py-20 md:py-24">
        <div className="hairline-gold absolute inset-x-0 top-0 opacity-70" />
        <div className="container">
          <div className="reveal mb-14 text-center">
            <p className="eyebrow-gold">{t.stores.eyebrow}</p>
            <h2 className="mt-3 font-display text-4xl font-medium md:text-5xl">{t.stores.title}</h2>
            <p className="mx-auto mt-3 max-w-xl text-sm text-muted-foreground">
              {t.stores.subtitle}
            </p>
            <div className="mx-auto mt-5 h-px w-16 bg-accent/60" />
          </div>

          {/* Interactive store locator — switch the live map between boutiques */}
          <div className="reveal">
            <StoreMap t={t.stores} />
          </div>
        </div>
      </section>

      {/* ========================= CONTACT ========================= */}
      <section className="container py-20 md:py-24">
        <div className="reveal mb-12 text-center">
          <p className="eyebrow-gold">{t.contact.eyebrow}</p>
          <h2 className="mt-3 font-display text-4xl font-medium md:text-5xl">{t.contact.title}</h2>
        </div>
        <div className="mx-auto grid max-w-4xl gap-4 sm:grid-cols-2 lg:grid-cols-4">
          {t.contact.items.map((item, i) => {
            const Icon = CONTACT_ICONS[i];
            return (
              <div
                key={item.label}
                className="card-lift group reveal border border-border bg-card p-6 text-center hover:border-accent"
              >
                <span className="mx-auto flex h-11 w-11 items-center justify-center rounded-full bg-secondary text-accent transition-colors duration-500 group-hover:bg-accent group-hover:text-accent-foreground">
                  <Icon className="h-5 w-5" />
                </span>
                <p className="eyebrow mt-4">{item.label}</p>
                <p className="mt-1 text-sm">{item.value}</p>
              </div>
            );
          })}
        </div>
      </section>
    </div>
  );
}
