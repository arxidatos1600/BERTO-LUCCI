"use client";

import * as React from "react";
import { Search, X, Check } from "lucide-react";
import { cn } from "@/lib/utils";
import type { Facets } from "@/lib/types";
import { Input } from "./ui/input";
import { Slider } from "./ui/slider";
import { Separator } from "./ui/separator";
import { Button } from "./ui/button";
import { useLang } from "./lang-provider";

export interface FilterState {
  search: string;
  categories: string[];
  colors: string[];
  sizes: string[];
  price: [number, number];
  inStockOnly: boolean;
  onSaleOnly: boolean;
}

interface FiltersProps {
  facets: Facets;
  value: FilterState;
  onChange: (next: FilterState) => void;
  onReset: () => void;
}

/** True when a swatch hex is light enough to need a dark check-mark. */
function isLight(hex: string): boolean {
  const m = /^#?([0-9a-f]{6})$/i.exec(hex.trim());
  if (!m) return false;
  const n = parseInt(m[1], 16);
  const r = (n >> 16) & 255, g = (n >> 8) & 255, b = n & 255;
  // Perceived luminance (sRGB-ish).
  return (0.299 * r + 0.587 * g + 0.114 * b) / 255 > 0.7;
}

/** Collapsible filter section. */
function Section({ title, hint, children }: { title: string; hint?: string; children: React.ReactNode }) {
  return (
    <div className="py-5">
      <div className="mb-3 flex items-baseline justify-between">
        <p className="eyebrow text-navy">{title}</p>
        {hint && <span className="text-[11px] text-muted-foreground">{hint}</span>}
      </div>
      {children}
    </div>
  );
}

export function Filters({ facets, value, onChange, onReset }: FiltersProps) {
  const { t: dict } = useLang();
  const t = dict.shop;
  const toggle = (key: "categories" | "colors" | "sizes", item: string) => {
    const set = new Set(value[key]);
    set.has(item) ? set.delete(item) : set.add(item);
    onChange({ ...value, [key]: Array.from(set) });
  };

  // Editable price inputs, clamped to the facet bounds and to each other.
  const setMin = (raw: string) => {
    const n = Math.max(facets.priceMin, Math.min(Number(raw) || facets.priceMin, value.price[1]));
    onChange({ ...value, price: [n, value.price[1]] });
  };
  const setMax = (raw: string) => {
    const n = Math.min(facets.priceMax, Math.max(Number(raw) || facets.priceMax, value.price[0]));
    onChange({ ...value, price: [value.price[0], n] });
  };

  const activeCount =
    value.categories.length + value.colors.length + value.sizes.length +
    (value.inStockOnly ? 1 : 0) + (value.onSaleOnly ? 1 : 0) +
    (value.price[0] > facets.priceMin || value.price[1] < facets.priceMax ? 1 : 0);

  return (
    <div className="thin-scroll on-dark rounded-lg bg-[hsl(var(--section-navy))] p-5 text-foreground lg:sticky lg:top-20 lg:max-h-[calc(100vh-6rem)] lg:overflow-y-auto">
      <div className="flex items-center justify-between">
        <p className="font-serif text-lg text-navy">
          {t.filters}
          {activeCount > 0 && (
            <span className="ml-2 inline-flex h-5 min-w-5 items-center justify-center rounded-full bg-accent px-1.5 text-[10px] font-semibold text-accent-foreground">
              {activeCount}
            </span>
          )}
        </p>
        <Button variant="link" size="sm" onClick={onReset} className="h-auto px-0 text-xs text-accent">
          {t.resetAll}
        </Button>
      </div>

      {/* Search */}
      <Section title={t.search}>
        <div className="relative">
          <Search className="absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-muted-foreground" />
          <Input
            value={value.search}
            onChange={(e) => onChange({ ...value, search: e.target.value })}
            placeholder={t.searchPlaceholder}
            className="pl-9"
          />
          {value.search && (
            <button
              onClick={() => onChange({ ...value, search: "" })}
              className="absolute right-3 top-1/2 -translate-y-1/2 text-muted-foreground hover:text-foreground"
              aria-label="Clear search"
            >
              <X className="h-4 w-4" />
            </button>
          )}
        </div>
      </Section>

      <Separator />

      {/* Availability + sale toggles */}
      <Section title={t.availability}>
        <div className="space-y-2.5">
          <Toggle
            label={t.inStockOnly}
            checked={value.inStockOnly}
            onChange={(v) => onChange({ ...value, inStockOnly: v })}
          />
          <Toggle
            label={t.onSale}
            checked={value.onSaleOnly}
            onChange={(v) => onChange({ ...value, onSaleOnly: v })}
          />
        </div>
      </Section>

      <Separator />

      {/* Category */}
      <Section title={t.category}>
        <div className="thin-scroll max-h-56 space-y-0.5 overflow-y-auto pr-1">
          {facets.categories.map((c) => {
            const active = value.categories.includes(c.name);
            return (
              <label
                key={c.name}
                className={cn(
                  "flex cursor-pointer items-center justify-between rounded-sm px-2 py-1.5 text-sm transition-colors",
                  active ? "bg-accent/10" : "hover:bg-secondary/60"
                )}
              >
                {/* sr-only checkbox first, so `peer-focus-visible` can ring the
                    visual box for keyboard users. */}
                <input
                  type="checkbox"
                  className="peer sr-only"
                  checked={active}
                  onChange={() => toggle("categories", c.name)}
                />
                <span className="flex items-center gap-2.5">
                  <span
                    className={cn(
                      "flex h-4 w-4 items-center justify-center rounded-[3px] border transition-colors peer-focus-visible:ring-2 peer-focus-visible:ring-ring peer-focus-visible:ring-offset-1",
                      active ? "border-accent bg-accent text-accent-foreground" : "border-input"
                    )}
                  >
                    {active && <Check className="h-3 w-3" strokeWidth={3} />}
                  </span>
                  <span className={cn(active ? "font-medium text-navy" : "text-foreground/85")}>{c.name}</span>
                </span>
                <span className="text-xs text-muted-foreground">{c.count}</span>
              </label>
            );
          })}
        </div>
      </Section>

      {/* Colour — only the colours present in the current results */}
      {facets.colors.length > 0 && (
        <>
          <Separator />
          <Section title={t.colour} hint={`${facets.colors.length}`}>
            <div className="flex flex-wrap gap-2.5">
              {facets.colors.map((c) => {
                const active = value.colors.includes(c.name);
                const light = isLight(c.hex);
                return (
                  <button
                    key={c.name}
                    title={`${c.name} (${c.count})`}
                    aria-label={`${c.name}, ${c.count} items`}
                    aria-pressed={active}
                    onClick={() => toggle("colors", c.name)}
                    className={cn(
                      "relative flex h-8 w-8 items-center justify-center rounded-full border transition-all duration-200 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring focus-visible:ring-offset-2 focus-visible:ring-offset-background",
                      active
                        ? "ring-2 ring-accent ring-offset-2 ring-offset-background"
                        : "hover:scale-110 hover:shadow-sm",
                      light ? "border-black/15" : "border-black/10"
                    )}
                    style={{ backgroundColor: c.hex }}
                  >
                    {active && (
                      <Check
                        className={cn("h-3.5 w-3.5", light ? "text-black/80" : "text-white")}
                        strokeWidth={3}
                      />
                    )}
                  </button>
                );
              })}
            </div>
          </Section>
        </>
      )}

      {/* Size */}
      {facets.sizes.length > 0 && (
        <>
          <Separator />
          <Section title={t.size} hint={value.sizes.length ? `${value.sizes.length} ${t.selected}` : undefined}>
            <div className="grid grid-cols-4 gap-2 sm:grid-cols-5">
              {facets.sizes.map((s) => {
                const active = value.sizes.includes(s);
                return (
                  <button
                    key={s}
                    onClick={() => toggle("sizes", s)}
                    aria-pressed={active}
                    className={cn(
                      "flex h-10 items-center justify-center border px-1 text-xs font-medium uppercase tracking-wide transition-all focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring focus-visible:ring-offset-1",
                      active
                        ? "border-accent bg-accent text-accent-foreground shadow-sm"
                        : "border-input text-foreground/80 hover:border-accent hover:text-foreground"
                    )}
                  >
                    {s}
                  </button>
                );
              })}
            </div>
          </Section>
        </>
      )}

      <Separator />

      {/* Price — slider + editable numeric range */}
      <Section title={t.price}>
        <Slider
          min={facets.priceMin}
          max={facets.priceMax}
          step={5}
          value={value.price}
          onValueChange={(v) => onChange({ ...value, price: [v[0], v[1]] as [number, number] })}
          className="mt-1"
        />
        <div className="mt-4 flex items-center gap-3">
          <label className="flex-1">
            <span className="mb-1 block text-[10px] uppercase tracking-luxe text-muted-foreground">{t.min}</span>
            <div className="relative">
              <span className="pointer-events-none absolute left-2.5 top-1/2 -translate-y-1/2 text-sm text-muted-foreground">€</span>
              <Input
                type="number"
                inputMode="numeric"
                min={facets.priceMin}
                max={value.price[1]}
                value={value.price[0]}
                onChange={(e) => setMin(e.target.value)}
                className="h-9 pl-6 text-sm"
                aria-label={`${t.price} ${t.min}`}
              />
            </div>
          </label>
          <span className="mt-5 h-px w-3 bg-border" />
          <label className="flex-1">
            <span className="mb-1 block text-[10px] uppercase tracking-luxe text-muted-foreground">{t.max}</span>
            <div className="relative">
              <span className="pointer-events-none absolute left-2.5 top-1/2 -translate-y-1/2 text-sm text-muted-foreground">€</span>
              <Input
                type="number"
                inputMode="numeric"
                min={value.price[0]}
                max={facets.priceMax}
                value={value.price[1]}
                onChange={(e) => setMax(e.target.value)}
                className="h-9 pl-6 text-sm"
                aria-label={`${t.price} ${t.max}`}
              />
            </div>
          </label>
        </div>
      </Section>
    </div>
  );
}

function Toggle({
  label,
  checked,
  onChange,
}: {
  label: string;
  checked: boolean;
  onChange: (v: boolean) => void;
}) {
  return (
    <button
      type="button"
      role="switch"
      onClick={() => onChange(!checked)}
      aria-checked={checked}
      className="group flex w-full items-center justify-between text-sm"
    >
      <span className={cn("transition-colors", checked && "font-medium text-navy")}>{label}</span>
      <span
        className={cn(
          "relative h-5 w-9 shrink-0 rounded-full transition-colors duration-200",
          "ring-offset-background group-focus-visible:outline-none group-focus-visible:ring-2 group-focus-visible:ring-ring group-focus-visible:ring-offset-2",
          checked ? "bg-accent" : "bg-border"
        )}
      >
        {/* Knob anchored with an explicit left inset (left-0.5) so its position
            never depends on the browser's static-position guess. It slides a
            fixed 16px between the two 2px-inset end stops. */}
        <span
          className={cn(
            "absolute left-0.5 top-0.5 h-4 w-4 rounded-full bg-white shadow-sm transition-transform duration-200",
            checked ? "translate-x-4" : "translate-x-0"
          )}
        />
      </span>
    </button>
  );
}
