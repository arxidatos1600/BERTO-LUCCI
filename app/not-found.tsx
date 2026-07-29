import type { Metadata } from "next";
import Link from "next/link";
import { Button } from "@/components/ui/button";
import { getLang } from "@/lib/get-lang";
import { getDictionary } from "@/lib/i18n";

export const metadata: Metadata = {
  title: "Page not found",
  robots: { index: false, follow: true },
};

export default async function NotFound() {
  const t = getDictionary(await getLang()).product;
  return (
    <div className="on-dark bg-background text-foreground">
      <div className="container flex min-h-[80vh] flex-col items-center justify-center gap-5 py-32 text-center">
        <p className="eyebrow-gold">{t.notFoundEyebrow}</p>
        <h1 className="font-display text-5xl font-medium md:text-7xl">{t.notFoundTitle}</h1>
        <p className="max-w-sm text-sm text-muted-foreground">{t.notFoundText}</p>
        <Button variant="accent" size="lg" className="btn-sheen" asChild>
          <Link href="/shop">{t.notFoundCta}</Link>
        </Button>
      </div>
    </div>
  );
}
