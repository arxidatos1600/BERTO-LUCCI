"use client";

import * as React from "react";
import { Instagram } from "lucide-react";
import { useLang } from "./lang-provider";
import { VideoReels, type Reel } from "./video-reels";
import { SmartImage } from "./smart-image";

const IG_URL = "https://www.instagram.com/bertoluccimilano/";
const TT_URL = "https://www.tiktok.com/@berto.lucci";

export interface IgPost {
  img: string;
  /** CDN url, so the tile still renders where the local library is absent. */
  imgSrc?: string;
  alt: string;
}

/** TikTok glyph (lucide has no TikTok icon). */
function TikTokIcon({ className }: { className?: string }) {
  return (
    <svg viewBox="0 0 24 24" fill="currentColor" aria-hidden className={className}>
      <path d="M16.5 3c.3 2 1.5 3.4 3.5 3.6v2.5c-1.2.1-2.4-.2-3.5-.8v5.4c0 3.1-2.4 5.3-5.2 5.3A5.1 5.1 0 0 1 6 13.8a5 5 0 0 1 5.6-5v2.6c-.3-.1-.6-.1-.9-.1-1.3 0-2.4 1.1-2.4 2.5s1.1 2.5 2.5 2.5c1.4 0 2.4-1.1 2.4-2.6V3h1.3z" />
    </svg>
  );
}

/**
 * Social proof section: the house Instagram feed (links out to @bertoluccimilano)
 * and the house video reels, served from our own /public/videos — no TikTok
 * embed script, so no third-party JS and no cookies.
 */
export function SocialFeed({ igPosts, reels }: { igPosts: IgPost[]; reels: Reel[] }) {
  const { t: dict } = useLang();
  const t = dict.social;

  return (
    <section className="relative overflow-hidden bg-secondary py-20 md:py-28">
      <div className="hairline-gold absolute inset-x-0 top-0" />
      <div className="container">
        {/* Header */}
        <div className="reveal mb-12 flex flex-col items-start gap-6 sm:flex-row sm:items-end sm:justify-between">
          <div>
            <span className="chip-beige">{t.eyebrow}</span>
            <h2 className="mt-4 break-all font-display text-[1.7rem] font-medium text-navy sm:break-normal sm:text-4xl md:text-5xl">{t.title}</h2>
            <p className="mt-3 max-w-md text-sm leading-relaxed text-muted-foreground">{t.subtitle}</p>
          </div>
          <div className="flex flex-wrap gap-3">
            <a
              href={IG_URL}
              target="_blank"
              rel="noreferrer"
              className="inline-flex items-center gap-2 border border-input px-4 py-2.5 text-xs font-semibold uppercase tracking-luxe transition-colors hover:border-accent hover:text-accent"
            >
              <Instagram className="h-4 w-4" /> {t.instagramCta}
            </a>
            <a
              href={TT_URL}
              target="_blank"
              rel="noreferrer"
              className="inline-flex items-center gap-2 border border-input px-4 py-2.5 text-xs font-semibold uppercase tracking-luxe transition-colors hover:border-accent hover:text-accent"
            >
              <TikTokIcon className="h-4 w-4" /> {t.tiktokCta}
            </a>
          </div>
        </div>

        {/* Instagram feed */}
        <p className="eyebrow-gold mb-4">{t.instagramHeading}</p>
        <div className="reveal grid grid-cols-2 gap-3 sm:grid-cols-3 lg:grid-cols-6">
          {igPosts.map((p, i) => (
            <a
              key={i}
              href={IG_URL}
              target="_blank"
              rel="noreferrer"
              aria-label="View on Instagram"
              className="img-zoom group relative aspect-square overflow-hidden bg-secondary"
            >
              <SmartImage
                local={p.img}
                fallback={p.imgSrc}
                alt={p.alt}
                sizes="(max-width: 640px) 50vw, (max-width: 1024px) 33vw, 16vw"
                className="transition-transform duration-700 group-hover:scale-105"
              />
              <div className="absolute inset-0 flex items-center justify-center bg-[hsl(var(--navy-900)/0)] opacity-0 transition-all duration-300 group-hover:bg-[hsl(var(--navy-900)/0.5)] group-hover:opacity-100">
                <Instagram className="h-6 w-6 text-[hsl(var(--cream))]" />
              </div>
            </a>
          ))}
        </div>

        {/* Video reels — self-hosted, cookie-free, all playable */}
        <p className="eyebrow-gold mb-5 mt-16">{t.tiktokHeading}</p>
        <div className="reveal">
          <VideoReels
            reels={reels}
            playLabel={t.playLabel}
            pauseLabel={t.pauseLabel}
            fallbackLabel={t.videoSoon}
          />
        </div>
      </div>
    </section>
  );
}
