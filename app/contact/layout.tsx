import type { Metadata } from "next";

/**
 * `page.tsx` is a client component and cannot export `metadata`, so this route
 * fell back to the site-wide default title. A layout is a server component and
 * can carry the per-route title, description and canonical.
 */
export const metadata: Metadata = {
  title: "Contact",
  description:
    "Call Berto Lucci for a phone order or customer service, or send us a message. Athens flagship at 28is Oktovriou 9.",
  alternates: { canonical: "/contact" },
};

export default function ContactLayout({ children }: { children: React.ReactNode }) {
  return children;
}
