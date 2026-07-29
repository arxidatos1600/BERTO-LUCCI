import type { Metadata } from "next";
import { products } from "@/lib/products";
import { SmartImage } from "@/components/smart-image";
import { LoginForm } from "@/components/login-form";
import { getLang } from "@/lib/get-lang";
import { getDictionary } from "@/lib/i18n";

export const metadata: Metadata = {
  title: "Sign In",
  description:
    "Sign in to your Berto Lucci account for orders, saved pieces and a faster checkout.",
  alternates: { canonical: "/login" },
  robots: { index: false, follow: true },
};

export default async function LoginPage() {
  const lang = await getLang();
  const t = getDictionary(lang).login;

  // A strong full-length suit look for the editorial panel.
  const img =
    products.find((p) => p.category === "Suits" && p.images[0]) ?? products[0];

  return (
    <div className="grid min-h-[82vh] lg:grid-cols-2">
      {/* ---- Editorial photo panel (desktop) ---- */}
      <div className="relative hidden overflow-hidden bg-[hsl(var(--navy-900))] lg:block">
        <SmartImage
          local={img.images[0].local}
          fallback={img.images[0].src}
          alt="Berto Lucci"
          priority
          sizes="50vw"
          className="h-full w-full object-cover object-[center_14%] contrast-[1.03]"
        />
        <div className="absolute inset-0 bg-gradient-to-t from-[hsl(var(--navy-900)/0.9)] via-[hsl(var(--navy-900)/0.2)] to-[hsl(var(--navy-900)/0.35)]" />
        <div className="hairline-gold absolute inset-x-0 top-0" />
        <div className="absolute inset-x-0 bottom-0 p-12 text-[hsl(var(--cream))] xl:p-16">
          <img
            src="/brand/logo_full.svg"
            alt="Berto Lucci Milano"
            className="h-14 w-auto opacity-95 [filter:brightness(0)_invert(1)]"
            width={228}
            height={122}
          />
          <h2 className="mt-7 max-w-sm font-display text-3xl font-light italic leading-tight md:text-4xl">
            {t.panelTitle}
          </h2>
          <p className="mt-3 max-w-sm text-sm leading-relaxed text-[hsl(var(--cream)/0.75)]">
            {t.panelSubtitle}
          </p>
        </div>
      </div>

      {/* ---- Form ---- */}
      <div className="flex items-center justify-center bg-background px-6 py-16 sm:px-10">
        <LoginForm />
      </div>
    </div>
  );
}
