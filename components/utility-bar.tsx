"use client";

import { Phone } from "lucide-react";
import { SocialLinks } from "./social-links";
import { LangToggle } from "./lang-toggle";
import { useLang } from "./lang-provider";

/**
 * Sticky mobile-only utility strip: call, socials, language. Solid background
 * (no backdrop-filter) so it never forces a re-composite while the mobile
 * browser chrome animates on scroll — see the house mobile-viewport rule.
 */
export function UtilityBar() {
  const { lang, t: dict } = useLang();
  const t = dict.utilityBar;

  return (
    <div className="fixed inset-x-0 bottom-0 z-40 flex h-14 items-center justify-between border-t border-border bg-background px-4 md:hidden">
      <a
        href="tel:+302105246634"
        aria-label={t.callUs}
        className="flex min-h-6 items-center gap-2 text-xs uppercase tracking-luxe text-foreground"
      >
        <Phone className="h-4 w-4 text-accent" />
        {t.callUs}
      </a>

      <SocialLinks variant="bare" size={17} tone="dark" itemClassName="text-foreground/70" />

      <div className="flex items-center gap-2">
        <span className="sr-only">{t.language}</span>
        <LangToggle lang={lang} />
      </div>
    </div>
  );
}
