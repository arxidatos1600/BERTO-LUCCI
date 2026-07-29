import { cookies } from "next/headers";
import type { Lang } from "./i18n";

// `next/headers` is server-only, so importing this module from a client
// component will fail fast — no extra guard package needed.

/** Read the active locale from the `bl_lang` cookie (server components only). */
export async function getLang(): Promise<Lang> {
  const store = await cookies();
  return store.get("bl_lang")?.value === "gr" ? "gr" : "en";
}
