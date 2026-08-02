import type { Metadata } from "next";
import {
  Jost,
  Cormorant_Garamond,
  Bodoni_Moda,
  GFS_Didot,
  EB_Garamond,
  Noto_Sans,
} from "next/font/google";
import "./globals.css";
import { Navbar } from "@/components/navbar";
import { Footer } from "@/components/footer";
import { Providers } from "@/components/providers";
import { LangProvider } from "@/components/lang-provider";
import { UtilityBar } from "@/components/utility-bar";
import ChatWidget from "@/components/chat-widget";
import { getLang } from "@/lib/get-lang";
import { products } from "@/lib/products";
import { jsonLdSafe } from "@/lib/utils";

// Refined geometric sans for nav + UI — a quietly European, fashion-forward feel.
const jost = Jost({
  subsets: ["latin"],
  weight: ["300", "400", "500", "600"],
  variable: "--font-sans",
  display: "swap",
});

// Elegant serif for the sartorial, Italian feel.
const cormorant = Cormorant_Garamond({
  subsets: ["latin"],
  weight: ["400", "500", "600", "700"],
  variable: "--font-serif",
  display: "swap",
});

// Bodoni Moda — the razor-sharp, high-contrast Italian fashion serif used for
// hero and display headings. This is the signature "couture" voice of the site.
const bodoni = Bodoni_Moda({
  subsets: ["latin"],
  weight: ["400", "500", "600", "700"],
  style: ["normal", "italic"],
  variable: "--font-display",
  display: "swap",
});

/* ---------------------------------------------------------------------------
   GREEK COVERAGE.
   Bodoni Moda, Jost and Cormorant Garamond ship NO greek subset (verified
   against the Google Fonts CSS API), so every Greek glyph was falling back to
   an arbitrary OS font whose metrics don't match our tight, Latin-tuned
   leading — the real cause of Greek headings overlapping and spilling out of
   their boxes. Font fallback is resolved PER GLYPH, so pairing each brand face
   with a Greek-capable partner keeps Latin exactly as designed while giving
   Greek a real, metrics-known face. Each partner is loaded greek-only, so the
   extra payload is a few KB.
   - GFS Didot    : a Greek Didone, the natural counterpart to Bodoni's couture look
   - EB Garamond  : a Garamond, matching Cormorant Garamond
   - Noto Sans    : neutral grotesque standing in for Jost
--------------------------------------------------------------------------- */
const gfsDidot = GFS_Didot({
  subsets: ["greek"],
  weight: "400",
  variable: "--font-display-el",
  display: "swap",
});

const ebGaramond = EB_Garamond({
  subsets: ["greek"],
  weight: ["400", "500", "600"],
  variable: "--font-serif-el",
  display: "swap",
});

const notoSansEl = Noto_Sans({
  subsets: ["greek"],
  weight: ["300", "400", "500", "600"],
  variable: "--font-sans-el",
  display: "swap",
});

const SITE_URL = "https://www.bertolucci.com.gr";

export const metadata: Metadata = {
  metadataBase: new URL(SITE_URL),
  title: {
    default: "Berto Lucci · Italian Menswear & Tailoring Since 1976",
    template: "%s · Berto Lucci",
  },
  description:
    "Berto Lucci is a family-owned Greek menswear house tailoring Italian-designed suits, shirts, ties and essentials since 1976. Shop online or visit one of twenty boutiques across Greece.",
  applicationName: "Berto Lucci",
  authors: [{ name: "Berto Lucci" }],
  creator: "Berto Lucci",
  publisher: "Berto Lucci",
  keywords: [
    "Berto Lucci", "Italian menswear", "men's suits", "tailored suits", "menswear Greece",
    "Athens menswear", "silk ties", "formal shirts", "ανδρικά κοστούμια", "ανδρική μόδα",
    "γραβάτες", "πουκάμισα", "κοστούμια Αθήνα", "ραφτή κομψότητα",
  ],
  // NOTE: no `alternates.canonical` here on purpose. Root metadata is inherited,
  // so a canonical of "/" made every page that didn't override it declare itself
  // a duplicate of the homepage — which de-indexes /shop, /cart, /contact and the
  // legal routes. Each page sets its own canonical instead.
  category: "Fashion",
  openGraph: {
    type: "website",
    siteName: "Berto Lucci",
    title: "Berto Lucci · Italian Menswear & Tailoring Since 1976",
    description:
      "Family-owned Greek menswear, tailoring Italian-designed suits, shirts and ties since 1976. Twenty boutiques across Greece.",
    url: SITE_URL,
    locale: "el_GR",
    alternateLocale: ["en_GB"],
  },
  twitter: {
    card: "summary_large_image",
    title: "Berto Lucci · Italian Menswear & Tailoring",
    description: "Family-owned Greek menswear, tailored from Italian-designed cloth since 1976.",
  },
  robots: {
    index: true,
    follow: true,
    googleBot: { index: true, follow: true, "max-image-preview": "large", "max-snippet": -1 },
  },
  icons: { icon: "/brand/favicon.svg" },
  formatDetection: { telephone: true, address: true, email: true },
};

// Organisation + WebSite structured data for rich results.
const ORG_JSONLD = {
  "@context": "https://schema.org",
  "@type": "ClothingStore",
  "@id": `${SITE_URL}/#organization`,
  name: "Berto Lucci",
  alternateName: "Berto Lucci Milano",
  url: SITE_URL,
  logo: `${SITE_URL}/brand/logo_full.svg`,
  image: `${SITE_URL}/opengraph-image`,
  description:
    "Family-owned Greek menswear house tailoring Italian-designed suits, shirts, ties and essentials since 1976.",
  foundingDate: "1976",
  slogan: "The Italian art of effortless elegance.",
  priceRange: "€€",
  telephone: "+30 210 524 6634",
  email: "info@bertolucci.com.gr",
  address: {
    "@type": "PostalAddress",
    streetAddress: "28is Oktovriou 9",
    addressLocality: "Athens",
    postalCode: "104 32",
    addressCountry: "GR",
  },
  areaServed: "GR",
  sameAs: [
    "https://www.facebook.com/bertolucci76",
    "https://www.instagram.com/bertolucci_milano",
    "https://www.tiktok.com/@berto.lucci",
  ],
};

const WEBSITE_JSONLD = {
  "@context": "https://schema.org",
  "@type": "WebSite",
  "@id": `${SITE_URL}/#website`,
  url: SITE_URL,
  name: "Berto Lucci",
  publisher: { "@id": `${SITE_URL}/#organization` },
  inLanguage: ["el", "en"],
  potentialAction: {
    "@type": "SearchAction",
    target: { "@type": "EntryPoint", urlTemplate: `${SITE_URL}/shop?q={search_term_string}` },
    "query-input": "required name=search_term_string",
  },
};

export default async function RootLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  const lang = await getLang();
  // A featured editorial shot for the mega-menu panel.
  const menuProduct =
    products.find((p) => ["Coats", "Suits", "Blazers", "Overshirts"].includes(p.category) && p.images[0]) ??
    products[0];
  const menuImage = {
    local: menuProduct.images[0].local,
    fallback: menuProduct.images[0].src,
    handle: menuProduct.handle,
  };
  return (
    <html
      lang={lang === "gr" ? "el" : "en"}
      className={`${jost.variable} ${cormorant.variable} ${bodoni.variable} ${gfsDidot.variable} ${ebGaramond.variable} ${notoSansEl.variable}`}
    >
      <body className="flex min-h-screen flex-col pb-14 font-sans md:pb-0">
        <a
          href="#main-content"
          className="sr-only rounded-sm focus:not-sr-only focus:fixed focus:left-4 focus:top-4 focus:z-[100] focus:bg-background focus:px-4 focus:py-2 focus:text-foreground focus:outline-none focus:ring-2 focus:ring-ring"
        >
          {lang === "gr" ? "Μετάβαση στο περιεχόμενο" : "Skip to content"}
        </a>
        <script
          type="application/ld+json"
          dangerouslySetInnerHTML={{ __html: jsonLdSafe(ORG_JSONLD) }}
        />
        <script
          type="application/ld+json"
          dangerouslySetInnerHTML={{ __html: jsonLdSafe(WEBSITE_JSONLD) }}
        />
        <LangProvider lang={lang}>
          <Providers>
            <Navbar lang={lang} menuImage={menuImage} />
            <main id="main-content" tabIndex={-1} className="flex-1 outline-none">{children}</main>
            <Footer lang={lang} />
            <UtilityBar />
            <ChatWidget />
          </Providers>
        </LangProvider>
      </body>
    </html>
  );
}
