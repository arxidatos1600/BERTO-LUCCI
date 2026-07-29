"use client";

import * as React from "react";
import { getDictionary, type Lang, type Dictionary } from "@/lib/i18n";

const LangContext = React.createContext<{ lang: Lang; t: Dictionary }>({
  lang: "en",
  t: getDictionary("en"),
});

/**
 * Provides the active locale + dictionary to client components (shop, cart,
 * product, drawer) that can't read the cookie server-side. Set once from the
 * server layout, so SSR and client render the same language (no hydration flash).
 */
export function LangProvider({ lang, children }: { lang: Lang; children: React.ReactNode }) {
  const value = React.useMemo(() => ({ lang, t: getDictionary(lang) }), [lang]);
  return <LangContext.Provider value={value}>{children}</LangContext.Provider>;
}

export function useLang() {
  return React.useContext(LangContext);
}
