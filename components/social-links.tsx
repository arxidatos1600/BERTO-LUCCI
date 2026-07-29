import * as React from "react";
import { cn } from "@/lib/utils";

/**
 * House social channels. Centralised so the navbar, hero and footer all draw
 * from one list and stay in sync. Glyphs are inline SVG paths (no brand-icon
 * dependency) drawn at 24×24 and scaled by the `size` prop.
 */
export const SOCIAL: { label: string; href: string; path: React.ReactNode }[] = [
  {
    label: "Facebook",
    href: "https://www.facebook.com/bertolucci76",
    path: <path d="M13.5 21v-7h2.4l.4-2.8h-2.8V9.4c0-.8.2-1.4 1.4-1.4h1.5V5.6C16.5 5.5 15.6 5.4 14.6 5.4c-2.1 0-3.6 1.3-3.6 3.7v2.1H8.6V14h2.4v7h2.5z" />,
  },
  {
    label: "Instagram",
    href: "https://www.instagram.com/bertolucci_milano",
    path: (
      <g fill="none" stroke="currentColor" strokeWidth="1.7">
        <rect x="3.2" y="3.2" width="17.6" height="17.6" rx="5" />
        <circle cx="12" cy="12" r="3.8" />
        <circle cx="17.4" cy="6.6" r="1.1" fill="currentColor" stroke="none" />
      </g>
    ),
  },
  {
    label: "TikTok",
    href: "https://www.tiktok.com/@berto.lucci",
    path: <path d="M16.5 3c.3 2 1.5 3.4 3.5 3.6v2.5c-1.2.1-2.4-.2-3.5-.8v5.4c0 3.1-2.4 5.3-5.2 5.3A5.1 5.1 0 016 13.8a5 5 0 015.6-5v2.6c-.3-.1-.6-.1-.9-.1-1.3 0-2.4 1.1-2.4 2.5s1.1 2.5 2.5 2.5c1.4 0 2.4-1.1 2.4-2.6V3h1.3z" />,
  },
];

type Variant = "circle" | "bare";

/**
 * Render the house socials as enlarged, tappable links. `circle` wraps each in
 * a bordered button (used in the hero + footer); `bare` shows the glyph only
 * (used inline in the navbar). `size` sets the glyph px.
 */
export function SocialLinks({
  variant = "circle",
  size = 20,
  className,
  itemClassName,
  tone = "light",
}: {
  variant?: Variant;
  size?: number;
  className?: string;
  itemClassName?: string;
  /** `light` = pale glyphs for dark backgrounds; `dark` = ink glyphs for light. */
  tone?: "light" | "dark";
}) {
  return (
    <div className={cn("flex items-center", variant === "circle" ? "gap-3" : "gap-4", className)}>
      {SOCIAL.map((s) => (
        <a
          key={s.label}
          href={s.href}
          target="_blank"
          rel="noreferrer"
          aria-label={s.label}
          className={cn(
            "group inline-flex items-center justify-center transition-all duration-300",
            variant === "circle"
              ? cn(
                  "h-11 w-11 rounded-full border hover:-translate-y-0.5",
                  tone === "light"
                    ? "border-[hsl(var(--cream)/0.28)] text-[hsl(var(--cream)/0.85)] hover:border-[hsl(var(--camel-light))] hover:text-[hsl(var(--camel-light))] hover:bg-[hsl(var(--cream)/0.06)]"
                    : "border-border text-foreground/70 hover:border-accent hover:text-accent hover:bg-accent/5"
                )
              : cn(
                  tone === "light"
                    ? "text-[hsl(var(--cream)/0.8)] hover:text-[hsl(var(--camel-light))]"
                    : "text-foreground/75 hover:text-accent hover:-translate-y-0.5"
                ),
            itemClassName
          )}
        >
          <svg width={size} height={size} viewBox="0 0 24 24" fill="currentColor" aria-hidden>
            {s.path}
          </svg>
        </a>
      ))}
    </div>
  );
}
