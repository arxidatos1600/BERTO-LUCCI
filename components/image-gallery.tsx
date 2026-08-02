"use client";

import * as React from "react";
import { ZoomIn } from "lucide-react";
import { cn } from "@/lib/utils";
import type { ProductImage } from "@/lib/types";
import { SmartImage } from "./smart-image";

interface ImageGalleryProps {
  images: ProductImage[];
  activeIndex: number;
  onSelect: (index: number) => void;
}

/**
 * Main image + thumbnail rail with a cursor-tracked magnifier. Hover (desktop)
 * or tap (touch) zooms the active image toward the pointer; the thumbnails stay
 * controlled so the gallery can sync with the selected variant colour.
 */
export function ImageGallery({ images, activeIndex, onSelect }: ImageGalleryProps) {
  const active = images[activeIndex] ?? images[0];
  const lensRef = React.useRef<HTMLDivElement>(null);
  const rectRef = React.useRef<DOMRect | null>(null);
  const [zoomed, setZoomed] = React.useState(false);

  // The lens rect only changes on layout/scroll, not per pointer move — so cache
  // it when the pointer enters and reuse it, instead of forcing a layout read on
  // every high-frequency mousemove/touchmove.
  const measure = () => {
    const el = lensRef.current;
    if (el) rectRef.current = el.getBoundingClientRect();
  };

  function track(e: React.MouseEvent | React.TouchEvent) {
    const el = lensRef.current;
    if (!el) return;
    const rect = rectRef.current ?? el.getBoundingClientRect();
    const point = "touches" in e ? e.touches[0] : (e as React.MouseEvent);
    const x = ((point.clientX - rect.left) / rect.width) * 100;
    const y = ((point.clientY - rect.top) / rect.height) * 100;
    el.style.setProperty("--x", `${Math.max(0, Math.min(100, x))}%`);
    el.style.setProperty("--y", `${Math.max(0, Math.min(100, y))}%`);
  }

  return (
    <div className="min-w-0 flex flex-col-reverse gap-4 lg:flex-row">
      {/* Thumbnails */}
      <div className="thin-scroll flex gap-3 overflow-x-auto lg:flex-col lg:overflow-visible">
        {images.map((img, i) => (
          <button
            key={img.local}
            onClick={() => onSelect(i)}
            aria-label={`View image ${i + 1}`}
            className={cn(
              "relative aspect-[3/4] w-16 shrink-0 overflow-hidden bg-secondary transition-all lg:w-20",
              i === activeIndex
                ? "ring-1 ring-accent ring-offset-2 ring-offset-background"
                : "opacity-65 hover:opacity-100"
            )}
          >
            <SmartImage local={img.local} fallback={img.src} alt={img.alt} sizes="80px" />
          </button>
        ))}
      </div>

      {/* Main image — magnifier */}
      <div
        ref={lensRef}
        className={cn("zoom-lens group relative aspect-[3/4] flex-1 bg-secondary", zoomed && "is-zoomed")}
        onMouseEnter={() => { setZoomed(true); measure(); }}
        onMouseLeave={() => setZoomed(false)}
        onMouseMove={track}
        onTouchStart={(e) => { setZoomed(true); measure(); track(e); }}
        onTouchMove={track}
        onTouchEnd={() => setZoomed(false)}
      >
        <SmartImage
          key={active.local}
          local={active.local}
          fallback={active.src}
          alt={active.alt}
          priority
          sizes="(max-width: 1024px) 100vw, 45vw"
          className="animate-fade-up"
        />
        {/* Zoom hint */}
        <span
          className={cn(
            "pointer-events-none absolute right-3 top-3 inline-flex items-center gap-1.5 rounded-full bg-[hsl(var(--navy)/0.65)] px-2.5 py-1 text-[10px] uppercase tracking-luxe text-[hsl(var(--cream))] backdrop-blur transition-opacity duration-300",
            zoomed ? "opacity-0" : "opacity-100"
          )}
        >
          <ZoomIn className="h-3 w-3" /> Zoom
        </span>
      </div>
    </div>
  );
}
