"use client";

import * as React from "react";
import { Play, Pause } from "lucide-react";
import { cn } from "@/lib/utils";

export interface Reel {
  /** Local file under /public, e.g. "/videos/reel-1.mp4". */
  src: string;
  /** Optional local poster frame, e.g. "/videos/reel-1.jpg". */
  poster?: string;
  /** Permalink used for the "watch on TikTok" fallback / caption link. */
  href: string;
  /** Resolved server-side: false means the file isn't on disk, so we render the
   *  link-out card and never emit a <video> that would 404. */
  available?: boolean;
}

/**
 * Self-hosted vertical video reels.
 *
 * Replaces TikTok's `embed.js` blockquote embed, which (a) loaded heavy
 * third-party JS that sets cookies, and (b) only reliably rendered the FIRST
 * blockquote — the reason videos 2 and 3 never played. These are plain local
 * <video> elements: no third-party request, no cookies, every reel playable.
 *
 * - one at a time: starting a reel pauses the others
 * - `playsInline` so iOS plays inline instead of hijacking fullscreen
 * - `preload="metadata"` so we fetch a few KB, not the whole file, up front
 * - if a file is missing the card degrades to a link out instead of a dead player
 */
export function VideoReels({
  reels,
  playLabel,
  pauseLabel,
  fallbackLabel,
}: {
  reels: Reel[];
  playLabel: string;
  pauseLabel: string;
  fallbackLabel: string;
}) {
  const videoRefs = React.useRef<(HTMLVideoElement | null)[]>([]);
  const [playing, setPlaying] = React.useState<number | null>(null);
  const [failed, setFailed] = React.useState<Record<number, boolean>>({});

  // A missing file 404s while the SSR'd markup is still parsing — i.e. BEFORE
  // React attaches onError — so the handler alone would never fire and the card
  // would sit on a dead player. Re-check each element's own error state on mount.
  React.useEffect(() => {
    const stale: Record<number, boolean> = {};
    videoRefs.current.forEach((v, i) => {
      if (v && (v.error !== null || v.networkState === HTMLMediaElement.NETWORK_NO_SOURCE)) {
        stale[i] = true;
      }
    });
    if (Object.keys(stale).length) setFailed((f) => ({ ...f, ...stale }));
  }, [reels]);

  /** Play one reel and pause every other. */
  const toggle = (i: number) => {
    const el = videoRefs.current[i];
    if (!el) return;
    if (el.paused) {
      videoRefs.current.forEach((v, j) => {
        if (v && j !== i) v.pause();
      });
      void el.play().catch(() => setFailed((f) => ({ ...f, [i]: true })));
    } else {
      el.pause();
    }
  };

  return (
    <div className="thin-scroll -mx-6 flex snap-x gap-5 overflow-x-auto px-6 pb-3 md:mx-0 md:justify-center md:overflow-visible md:px-0">
      {reels.map((reel, i) => {
        const isPlaying = playing === i;
        // `available === false` is decided on the server, so a missing file never
        // even renders a <video> — no 404, no wasted request.
        const isFailed = failed[i] || reel.available === false;

        return (
          <div
            key={reel.src}
            className="group relative aspect-[9/16] w-[260px] shrink-0 snap-start overflow-hidden rounded-lg bg-[hsl(var(--navy))] sm:w-[300px]"
          >
            {isFailed ? (
              /* File missing → graceful link-out, never a broken player */
              <a
                href={reel.href}
                target="_blank"
                rel="noreferrer"
                className="flex h-full w-full flex-col items-center justify-center gap-3 p-6 text-center"
              >
                <span className="flex h-12 w-12 items-center justify-center rounded-full border border-[hsl(var(--cream)/0.3)] text-[hsl(var(--cream))]">
                  <Play className="h-5 w-5 translate-x-[1px]" />
                </span>
                <span className="text-xs uppercase tracking-luxe text-[hsl(var(--cream)/0.75)]">
                  {fallbackLabel}
                </span>
              </a>
            ) : (
              <>
                <video
                  ref={(el) => {
                    videoRefs.current[i] = el;
                  }}
                  src={reel.src}
                  poster={reel.poster}
                  playsInline
                  preload="metadata"
                  controls={isPlaying}
                  controlsList="nodownload"
                  onPlay={() => setPlaying(i)}
                  onPause={() => setPlaying((p) => (p === i ? null : p))}
                  onEnded={() => setPlaying((p) => (p === i ? null : p))}
                  onError={() => setFailed((f) => ({ ...f, [i]: true }))}
                  className="h-full w-full object-cover"
                />

                {/* Play / pause overlay — hidden while playing so it never covers the controls */}
                <button
                  type="button"
                  onClick={() => toggle(i)}
                  aria-label={isPlaying ? pauseLabel : playLabel}
                  className={cn(
                    "absolute inset-0 flex items-center justify-center transition-opacity duration-300",
                    "focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-[hsl(var(--camel-light))] focus-visible:ring-inset",
                    isPlaying
                      ? "pointer-events-none bg-transparent opacity-0"
                      : "bg-[hsl(var(--navy-900)/0.35)] opacity-100 hover:bg-[hsl(var(--navy-900)/0.2)]"
                  )}
                >
                  <span className="flex h-14 w-14 items-center justify-center rounded-full bg-[hsl(var(--cream)/0.92)] text-[hsl(var(--navy))] shadow-lg transition-transform duration-300 group-hover:scale-105">
                    {isPlaying ? (
                      <Pause className="h-6 w-6" />
                    ) : (
                      <Play className="h-6 w-6 translate-x-[2px]" />
                    )}
                  </span>
                </button>
              </>
            )}
          </div>
        );
      })}
    </div>
  );
}
