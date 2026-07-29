"use client";

import * as React from "react";
import Link from "next/link";
import { usePathname } from "next/navigation";
import { cn } from "@/lib/utils";

const INFO_NAV = [
  { label: "Our Story", href: "/about" },
  { label: "Shipping & Delivery", href: "/shipping" },
  { label: "Payment Methods", href: "/payment" },
  { label: "Returns & Exchanges", href: "/returns" },
  { label: "Terms & Privacy", href: "/terms" },
  { label: "Contact", href: "/contact" },
];

/** Shared layout for all informational / policy pages. */
export function InfoLayout({
  eyebrow = "Client Care",
  title,
  intro,
  children,
}: {
  eyebrow?: string;
  title: string;
  intro?: string;
  children: React.ReactNode;
}) {
  const pathname = usePathname();
  return (
    <div className="on-dark min-h-[70vh] bg-background text-foreground">
      <div className="container py-14 lg:py-20">
        <header className="mb-10 border-b border-border pb-8">
          <p className="eyebrow-gold">{eyebrow}</p>
          <h1 className="mt-3 font-display text-4xl font-medium md:text-6xl">{title}</h1>
          {intro && <p className="mt-4 max-w-2xl text-muted-foreground">{intro}</p>}
        </header>

        <div className="grid gap-12 lg:grid-cols-[230px_1fr]">
          {/* Side nav */}
          <aside className="lg:sticky lg:top-24 lg:self-start">
            <p className="eyebrow-gold mb-4">Information</p>
            <nav className="flex flex-col">
              {INFO_NAV.map((item) => {
                const active = pathname === item.href;
                return (
                  <Link
                    key={item.href}
                    href={item.href}
                    className={cn(
                      "border-l-2 py-2 pl-4 text-sm transition-colors",
                      active
                        ? "border-accent font-medium text-foreground"
                        : "border-transparent text-muted-foreground hover:border-border hover:text-foreground"
                    )}
                  >
                    {item.label}
                  </Link>
                );
              })}
            </nav>
          </aside>

          {/* Content */}
          <div className="max-w-2xl">{children}</div>
        </div>
      </div>
    </div>
  );
}

/** A titled content block within an info page. */
export function InfoSection({
  title,
  children,
}: {
  title?: string;
  children: React.ReactNode;
}) {
  return (
    <section className="mb-10">
      {title && <h2 className="mb-4 font-serif text-xl md:text-2xl">{title}</h2>}
      <div className="prose-bl">{children}</div>
    </section>
  );
}

/**
 * Renders a whole legal/commercial page from the localized deck in lib/legal.ts,
 * so Terms / Shipping / Returns / Payment stay in sync across EN and EL instead
 * of each hardcoding its own English JSX.
 */
export function LegalBody({
  sections,
}: {
  sections: { heading: string; body: string[]; bullets?: string[] }[];
}) {
  return (
    <>
      {sections.map((s) => (
        <InfoSection key={s.heading} title={s.heading}>
          {s.body.map((p, i) => (
            <p key={i}>{p}</p>
          ))}
          {s.bullets && s.bullets.length > 0 && (
            <ul>
              {s.bullets.map((b, i) => (
                <li key={i}>{b}</li>
              ))}
            </ul>
          )}
        </InfoSection>
      ))}
    </>
  );
}
