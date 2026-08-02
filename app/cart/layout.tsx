import type { Metadata } from "next";

/**
 * `page.tsx` is a client component, which cannot export `metadata` — so this
 * route inherited the site-wide default title and shipped the same <title> as
 * the homepage. A layout is a server component and can carry it.
 */
export const metadata: Metadata = {
  title: "Shopping Bag",
  description: "Review the pieces in your Berto Lucci bag before checkout.",
  alternates: { canonical: "/cart" },
  // A personal bag has nothing to index and no two visitors see the same page.
  robots: { index: false, follow: true },
};

export default function CartLayout({ children }: { children: React.ReactNode }) {
  return children;
}
