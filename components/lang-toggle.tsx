"use client";

import * as React from "react";
import { useRouter } from "next/navigation";
import { cn } from "@/lib/utils";
import type { Lang } from "@/lib/i18n";

/**
 * EN / ΕΛ language switch. Persists the choice in the `bl_lang` cookie and
 * calls router.refresh() so the server components re-render in the new locale
 * in place — no full page reload, cart/scroll state preserved.
 */
export function LangToggle({ lang, className }: { lang: Lang; className?: string }) {
  const router = useRouter();
  const [pending, startTransition] = React.useTransition();

  const set = (l: Lang) => {
    if (l === lang) return;
    document.cookie = `bl_lang=${l}; path=/; max-age=31536000; samesite=lax`;
    startTransition(() => router.refresh());
  };

  return (
    <div
      className={cn(
        "flex items-center gap-1.5 text-xs uppercase tracking-luxe transition-opacity",
        pending && "opacity-50",
        className
      )}
    >
      <button
        type="button"
        onClick={() => set("en")}
        aria-pressed={lang === "en"}
        className={cn(
          "transition-colors",
          lang === "en" ? "text-accent" : "text-foreground/70 hover:text-foreground"
        )}
      >
        EN
      </button>
      <span className="text-foreground/30">/</span>
      <button
        type="button"
        onClick={() => set("gr")}
        aria-pressed={lang === "gr"}
        className={cn(
          "transition-colors",
          lang === "gr" ? "text-accent" : "text-foreground/70 hover:text-foreground"
        )}
      >
        ΕΛ
      </button>
    </div>
  );
}
