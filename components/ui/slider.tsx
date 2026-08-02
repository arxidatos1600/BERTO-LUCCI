"use client";

import * as React from "react";
import * as SliderPrimitive from "@radix-ui/react-slider";
import { cn } from "@/lib/utils";

interface SliderProps extends React.ComponentPropsWithoutRef<typeof SliderPrimitive.Root> {
  /** Per-value announcement (e.g. -1 -> "Tighter") — Radix only exposes the
   *  raw numeric `aria-valuenow` otherwise, which means nothing out of context. */
  getAriaValueText?: (value: number, index: number) => string;
}

const Slider = React.forwardRef<React.ElementRef<typeof SliderPrimitive.Root>, SliderProps>(
  ({ className, "aria-label": ariaLabel, getAriaValueText, ...props }, ref) => (
    <SliderPrimitive.Root
      ref={ref}
      className={cn(
        "relative flex w-full touch-none select-none items-center",
        className
      )}
      {...props}
    >
      <SliderPrimitive.Track className="relative h-1.5 w-full grow overflow-hidden rounded-full bg-border">
        <SliderPrimitive.Range className="absolute h-full bg-accent" />
      </SliderPrimitive.Track>
      {props.value?.map((v, i) => (
        <SliderPrimitive.Thumb
          key={i}
          // Radix puts `role="slider"` on the Thumb, not the Root, so the
          // accessible name has to land here to be announced at all.
          aria-label={ariaLabel}
          aria-valuetext={getAriaValueText?.(v, i)}
          className="flex h-5 w-5 items-center justify-center rounded-full border-2 border-accent bg-card shadow-md ring-offset-background transition-transform hover:scale-110 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring focus-visible:ring-offset-1 disabled:pointer-events-none disabled:opacity-50"
        >
          <span className="h-1.5 w-1.5 rounded-full bg-accent" />
        </SliderPrimitive.Thumb>
      ))}
    </SliderPrimitive.Root>
  )
);
Slider.displayName = SliderPrimitive.Root.displayName;

export { Slider };
