import Link from "next/link";
import { Phone, Mail, MapPin } from "lucide-react";
import { getDictionary, type Lang } from "@/lib/i18n";
import { SocialLinks } from "./social-links";
import { BoutiqueBand } from "./boutique-band";
import { PaymentLogos } from "./payment-logos";

// Real Berto Lucci storefront photos for the parallaxing boutique band — led by
// the full exterior, each positioned so the shopfront + BERTO LUCCI signage stays
// in frame so it reads clearly as the stores seen from the street.
// `widths` lists the pre-generated WebP/JPEG rungs (scripts have written
// `<base>-<w>.webp` and `<base>-<w>.jpg` into public/stores). Each list stops at
// the source width — store-window-3 is a 1050px-wide portrait, so there is no
// 1280/1600 rung to serve and upscaling would only cost bytes.
const STORE_PHOTOS = [
  {
    base: "/stores/store-exterior",
    widths: [480, 768, 1024, 1280, 1400],
    alt: "Berto Lucci storefront on the street at night",
    pos: "object-[center_30%]",
  },
  {
    base: "/stores/store-window-1",
    widths: [480, 768, 1024, 1280, 1400],
    alt: "Berto Lucci shop window from the street",
    pos: "object-[center_22%]",
  },
  {
    base: "/stores/store-window-3",
    widths: [480, 768, 1024, 1050],
    alt: "Berto Lucci boutique window from the street",
    pos: "object-[center_28%]",
  },
];

export function Footer({ lang }: { lang: Lang }) {
  const t = getDictionary(lang).footer;

  const COLUMNS = [
    {
      title: t.shop.title,
      links: [
        { label: t.shop.allProducts, href: "/shop" },
        { label: t.shop.suits, href: "/shop?category=Suits" },
        { label: t.shop.formalShirts, href: "/shop?category=Formal+Shirts" },
        { label: t.shop.ties, href: "/shop?category=Ties" },
        { label: t.shop.outlet, href: "/shop?sale=1" },
      ],
    },
    {
      title: t.maison.title,
      links: [
        { label: t.maison.ourStory, href: "/about" },
        { label: t.maison.history, href: "/about#history" },
        { label: t.maison.network, href: "/about#stores" },
        { label: t.maison.design, href: "/about#craft" },
      ],
    },
    {
      title: t.care.title,
      links: [
        { label: t.care.contact, href: "/contact" },
        { label: t.care.shipping, href: "/shipping" },
        { label: t.care.payment, href: "/payment" },
        { label: t.care.returns, href: "/returns" },
        { label: t.care.terms, href: "/terms" },
      ],
    },
  ];

  return (
    <footer className="on-dark relative mt-0 bg-primary text-primary-foreground">
      <div className="hairline-gold absolute inset-x-0 top-0" />

      {/* ===== Find-a-boutique band (real storefront photos, parallaxed) ===== */}
      <BoutiqueBand
        photos={STORE_PHOTOS}
        title={t.findStoreTitle}
        text={t.findStoreText}
        cta={t.findStoreCta}
      />

      {/* ===== Main footer ===== */}
      <div className="container py-16">
        {/* Centered brand header */}
        <div className="mb-14 flex flex-col items-center border-b border-[hsl(var(--navy-700))] pb-12 text-center">
          <Link href="/" aria-label="Berto Lucci Milano, home">
            <img
              src="/brand/logo_full.svg"
              alt="Berto Lucci Milano"
              className="h-28 w-auto opacity-95 [filter:brightness(0)_invert(1)] sm:h-32"
              width={228}
              height={122}
            />
          </Link>
          <p className="mt-6 max-w-md text-[15px] leading-relaxed text-[hsl(var(--cream)/0.8)]">{t.tagline}</p>
        </div>

        <div className="grid gap-12 md:grid-cols-[1.5fr_repeat(3,1fr)]">
          {/* Contact + socials */}
          <div>
            <div className="space-y-3 text-[15px] text-[hsl(var(--cream)/0.85)]">
              <a href="tel:+302105246634" className="flex items-center gap-2.5 transition-colors hover:text-[hsl(var(--cream))]">
                <Phone className="h-[18px] w-[18px] shrink-0 text-[hsl(var(--camel-light))]" /> +30 210 524 6634
              </a>
              <a href="mailto:info@bertolucci.com.gr" className="flex items-center gap-2.5 transition-colors hover:text-[hsl(var(--cream))]">
                <Mail className="h-[18px] w-[18px] shrink-0 text-[hsl(var(--camel-light))]" /> info@bertolucci.com.gr
              </a>
              <p className="flex items-center gap-2.5">
                <MapPin className="h-[18px] w-[18px] shrink-0 text-[hsl(var(--camel-light))]" /> {t.address}
              </p>
            </div>

            <div className="mt-7">
              <p className="eyebrow-gold mb-3">{t.followUs}</p>
              <SocialLinks size={20} />
            </div>
          </div>

          {COLUMNS.map((col) => (
            <div key={col.title}>
              <p className="eyebrow-gold mb-4">{col.title}</p>
              <ul className="space-y-2.5">
                {col.links.map((l, i) => (
                  <li key={`${l.href}-${i}`}>
                    <Link
                      href={l.href}
                      className="link-underline text-sm text-[hsl(var(--cream)/0.85)] transition-colors hover:text-[hsl(var(--cream))]"
                    >
                      {l.label}
                    </Link>
                  </li>
                ))}
              </ul>
            </div>
          ))}
        </div>

        {/* Bottom bar */}
        <div className="mt-14 flex flex-col gap-5 border-t border-[hsl(var(--navy-700))] pt-8 sm:flex-row sm:items-center sm:justify-between">
          <div className="flex flex-col gap-1.5 text-xs text-[hsl(var(--cream)/0.7)]">
            <p>© {new Date().getFullYear()} {t.rights}</p>
            <p>{t.demo}</p>
          </div>
          <div className="flex flex-wrap items-center gap-2">
            <span className="mr-1 text-[11px] uppercase tracking-luxe text-[hsl(var(--cream)/0.7)]">{t.payments}</span>
            <PaymentLogos />
          </div>
        </div>
      </div>
    </footer>
  );
}
