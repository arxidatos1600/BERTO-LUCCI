"use client";

import * as React from "react";
import { ChevronDown, Info, Ruler } from "lucide-react";
import { cn } from "@/lib/utils";
import { GENERAL_CHEST_CHART, recommendSize, type FitPreference } from "@/lib/size-guide";
import { Dialog, DialogContent, DialogHeader, DialogTitle } from "./ui/dialog";
import { Button } from "./ui/button";
import { Input } from "./ui/input";
import { Label } from "./ui/label";
import { Slider } from "./ui/slider";
import { useLang } from "./lang-provider";

interface SizeGuideModalProps {
  open: boolean;
  onOpenChange: (v: boolean) => void;
  /** The PRODUCT's own real, currently-purchasable size labels (never
   *  invented, never sold-out) — the calculator's recommendation always
   *  resolves to one of these. */
  availableSizes: string[];
  /** The button that opened this modal — focus returns here on close,
   *  since it's rendered outside a Radix DialogTrigger. */
  triggerRef?: React.RefObject<HTMLButtonElement | null>;
}

type Tab = "chart" | "calculator";

/**
 * Size Guide modal — two tabs, both chest-sizing only:
 *  - "Chart": the static, general EU/IT menswear chest-circumference reference
 *    (GENERAL_CHEST_CHART), explicitly disclaimed as general, not this exact
 *    garment's own lab measurements.
 *  - "Calculator": chest-cm + fit-preference -> a recommended size, always
 *    drawn from `availableSizes` (lib/size-guide.ts guarantees this).
 * The caller (`variant-selector.tsx`) only mounts this modal at all when
 * `hasChestSizing(availableSizes)` is true, so both tabs are always usable
 * here — a one-size accessory or a numeric-waist trouser never reaches this
 * component in the first place.
 */
export function SizeGuideModal({ open, onOpenChange, availableSizes, triggerRef }: SizeGuideModalProps) {
  const { t: dict } = useLang();
  const t = dict.sizeGuide;

  const [tab, setTab] = React.useState<Tab>("chart");
  const [step, setStep] = React.useState<"input" | "result">("input");
  const [chest, setChest] = React.useState("");
  const [fit, setFit] = React.useState<FitPreference>(0);
  const [showOtherSizes, setShowOtherSizes] = React.useState(false);

  const chartId = React.useId();
  const calcId = React.useId();
  const chestInputId = React.useId();
  const chestHelperId = React.useId();
  const otherSizesId = React.useId();

  // Fresh state every time the modal opens.
  React.useEffect(() => {
    if (!open) return;
    setTab("chart");
    setStep("input");
    setChest("");
    setFit(0);
    setShowOtherSizes(false);
  }, [open]);

  const chestNum = parseFloat(chest);
  const recommendation = React.useMemo(
    () => recommendSize(chestNum, fit, availableSizes),
    [chestNum, fit, availableSizes]
  );
  const otherSizes = React.useMemo(
    () => availableSizes.filter((s) => s !== recommendation?.size),
    [availableSizes, recommendation]
  );

  function handleTabKeyDown(e: React.KeyboardEvent) {
    if (e.key !== "ArrowLeft" && e.key !== "ArrowRight") return;
    e.preventDefault();
    setTab((cur) => (cur === "chart" ? "calculator" : "chart"));
  }

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent
        aria-describedby={undefined}
        onCloseAutoFocus={(e) => {
          if (triggerRef?.current) {
            e.preventDefault();
            triggerRef.current.focus();
          }
        }}
        className="flex w-[calc(100%-2rem)] max-w-xl flex-col gap-0 overflow-hidden p-0 size-guide-content"
      >
        <DialogHeader className="border-b border-border px-6 py-5 text-left">
          <DialogTitle>{t.title}</DialogTitle>
        </DialogHeader>

        {/* Tabs */}
        <div role="tablist" aria-label={t.title} className="flex gap-8 border-b border-border px-6">
          <button
            role="tab"
            id={`${chartId}-tab`}
            aria-selected={tab === "chart"}
            aria-controls={`${chartId}-panel`}
            tabIndex={tab === "chart" ? 0 : -1}
            onClick={() => setTab("chart")}
            onKeyDown={handleTabKeyDown}
            className={cn(
              "relative py-4 text-[13px] uppercase tracking-luxe transition-colors",
              tab === "chart" ? "text-foreground" : "text-muted-foreground hover:text-foreground"
            )}
          >
            {t.tabs.chart}
            <span
              className={cn(
                "absolute inset-x-0 -bottom-px h-px bg-primary transition-opacity",
                tab === "chart" ? "opacity-100" : "opacity-0"
              )}
            />
          </button>
          <button
            role="tab"
            id={`${calcId}-tab`}
            aria-selected={tab === "calculator"}
            aria-controls={`${calcId}-panel`}
            tabIndex={tab === "calculator" ? 0 : -1}
            onClick={() => setTab("calculator")}
            onKeyDown={handleTabKeyDown}
            className={cn(
              "relative py-4 text-[13px] uppercase tracking-luxe transition-colors",
              tab === "calculator" ? "text-foreground" : "text-muted-foreground hover:text-foreground"
            )}
          >
            {t.tabs.calculator}
            <span
              className={cn(
                "absolute inset-x-0 -bottom-px h-px bg-primary transition-opacity",
                tab === "calculator" ? "opacity-100" : "opacity-0"
              )}
            />
          </button>
        </div>

        {/* Panels */}
        <div className="min-h-0 flex-1 overflow-y-auto px-6 py-6">
          {/* ---------------- Chart ---------------- */}
          <div role="tabpanel" id={`${chartId}-panel`} aria-labelledby={`${chartId}-tab`} hidden={tab !== "chart"}>
            <p className="font-serif text-lg">{t.chart.title}</p>

            <div className="mt-3 flex items-start gap-2.5 border border-border bg-secondary/60 px-3.5 py-3">
              <Info className="mt-0.5 h-3.5 w-3.5 shrink-0 text-accent" />
              <p className="text-xs leading-relaxed text-muted-foreground">{t.chart.disclaimer}</p>
            </div>

            <div className="mt-5 border border-border">
              <div className="thin-scroll overflow-x-auto">
                <table className="w-full border-collapse text-sm">
                  <thead>
                    <tr className="border-b border-border bg-secondary/60">
                      <th scope="col" className="px-3 py-2.5 text-left text-[11px] font-medium uppercase tracking-luxe text-muted-foreground sm:px-4">
                        {dict.product.size}
                      </th>
                      <th scope="col" className="px-3 py-2.5 text-left text-[11px] font-medium uppercase tracking-luxe text-muted-foreground sm:px-4">
                        {t.calculator.chestLabel} (cm)
                      </th>
                    </tr>
                  </thead>
                  <tbody>
                    {GENERAL_CHEST_CHART.map((band, i) => (
                      <tr key={band.size} className={i > 0 ? "border-t border-border" : undefined}>
                        <td className="px-3 py-2.5 font-medium text-foreground sm:px-4">{band.size}</td>
                        <td className="px-3 py-2.5 tabular-nums text-muted-foreground sm:px-4">
                          {band.min}&ndash;{band.max} cm
                        </td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>
            </div>

            <div className="mt-8">
              <p className="flex items-center gap-2 font-serif text-lg">
                <Ruler className="h-4 w-4 text-accent" />
                {t.chart.howToMeasureTitle}
              </p>
              <ol className="mt-4 space-y-4">
                {t.chart.howToMeasure.map((item, i) => (
                  <li key={item.title} className="flex gap-3.5">
                    <span className="flex h-6 w-6 shrink-0 items-center justify-center rounded-full bg-primary font-serif text-[12px] text-primary-foreground">
                      {i + 1}
                    </span>
                    <div>
                      <p className="text-sm font-medium text-foreground">{item.title}</p>
                      <p className="mt-0.5 text-sm leading-relaxed text-muted-foreground">{item.text}</p>
                    </div>
                  </li>
                ))}
              </ol>
            </div>
          </div>

          {/* -------------- Calculator -------------- */}
          <div role="tabpanel" id={`${calcId}-panel`} aria-labelledby={`${calcId}-tab`} hidden={tab !== "calculator"}>
            {step === "input" ? (
              <form
                className="space-y-8"
                onSubmit={(e) => {
                  e.preventDefault();
                  if (chestNum > 0) setStep("result");
                }}
              >
                <div>
                  <Label htmlFor={chestInputId}>{t.calculator.chestLabel}</Label>
                  <p id={chestHelperId} className="mt-1 text-xs text-muted-foreground">
                    {t.calculator.chestHelper}
                  </p>
                  <div className="relative mt-3">
                    <Input
                      id={chestInputId}
                      type="number"
                      inputMode="decimal"
                      min={50}
                      max={200}
                      placeholder={t.calculator.chestPlaceholder}
                      value={chest}
                      onChange={(e) => setChest(e.target.value)}
                      aria-describedby={chestHelperId}
                      className="pr-11"
                    />
                    <span aria-hidden="true" className="pointer-events-none absolute right-3.5 top-1/2 -translate-y-1/2 text-xs text-muted-foreground">
                      cm
                    </span>
                  </div>
                </div>

                <div>
                  <span className="eyebrow">{t.calculator.fitTitle}</span>
                  <p className="mt-1.5 text-sm text-foreground">{t.calculator.fitQuestion}</p>
                  <div className="mt-6 px-1">
                    <Slider
                      value={[fit]}
                      min={-1}
                      max={1}
                      step={1}
                      onValueChange={([v]) => setFit(v as FitPreference)}
                      aria-label={t.calculator.fitQuestion}
                      getAriaValueText={(v) =>
                        v === -1 ? t.calculator.fitTightLabel : v === 1 ? t.calculator.fitLooseLabel : t.calculator.fitTrueToSizeLabel
                      }
                    />
                  </div>
                  <div className="mt-2.5 flex justify-between text-xs text-muted-foreground">
                    <span>{t.calculator.fitTightLabel}</span>
                    <span>{t.calculator.fitTrueToSizeLabel}</span>
                    <span>{t.calculator.fitLooseLabel}</span>
                  </div>
                </div>

                <Button type="submit" variant="accent" size="lg" className="w-full" disabled={!(chestNum > 0)}>
                  {t.calculator.continueCta}
                </Button>
              </form>
            ) : recommendation ? (
              <div>
                <div className="border border-border bg-secondary/50 px-6 py-7 text-center">
                  <p className="font-serif text-2xl">
                    {t.calculator.resultTitle.replace("{size}", recommendation.size)}
                  </p>
                  {recommendation.substituted && (
                    <p className="mt-2 flex items-center justify-center gap-1.5 text-xs text-muted-foreground">
                      <Info className="h-3 w-3 shrink-0" />
                      {t.calculator.substitutedNote}
                    </p>
                  )}

                  <div className="mx-5 mt-8">
                    <div className="relative h-1.5 rounded-full bg-border">
                      <div
                        className="absolute inset-y-0 left-0 rounded-full bg-accent"
                        style={{ width: `${Math.min(1, Math.max(0, recommendation.gaugePosition)) * 100}%` }}
                      />
                      <div
                        className="absolute top-1/2 h-4 w-4 -translate-x-1/2 -translate-y-1/2 rounded-full border-2 border-accent bg-card shadow-md"
                        style={{ left: `${Math.min(1, Math.max(0, recommendation.gaugePosition)) * 100}%` }}
                      />
                    </div>
                    <div className="mt-2 flex justify-between text-[11px] uppercase tracking-luxe text-muted-foreground">
                      <span>{t.calculator.fitTightLabel}</span>
                      <span>{t.calculator.fitLooseLabel}</span>
                    </div>
                  </div>
                </div>

                {otherSizes.length > 0 && (
                  <div className="mt-5 border border-border">
                    <button
                      onClick={() => setShowOtherSizes((v) => !v)}
                      aria-expanded={showOtherSizes}
                      aria-controls={otherSizesId}
                      className="flex w-full items-center justify-between px-4 py-3 text-sm text-foreground"
                    >
                      {t.calculator.seeOtherSizes}
                      <ChevronDown
                        className={cn(
                          "h-4 w-4 text-muted-foreground transition-transform duration-300",
                          showOtherSizes && "rotate-180"
                        )}
                      />
                    </button>
                    <div id={otherSizesId} className="acc-panel" data-open={showOtherSizes} inert={showOtherSizes ? undefined : true}>
                      <div>
                        <div className="flex flex-wrap gap-2 px-4 pb-4">
                          {otherSizes.map((s) => (
                            <span
                              key={s}
                              className="min-w-[3rem] border border-input px-3 py-2 text-center text-xs uppercase tracking-wide text-muted-foreground"
                            >
                              {s}
                            </span>
                          ))}
                        </div>
                      </div>
                    </div>
                  </div>
                )}

                <div className="mt-6 flex flex-col gap-2.5 sm:flex-row">
                  <Button
                    variant="outline"
                    className="sm:flex-1"
                    onClick={() => {
                      setStep("input");
                      setChest("");
                      setFit(0);
                      setShowOtherSizes(false);
                    }}
                  >
                    {t.calculator.startOver}
                  </Button>
                  <Button variant="accent" className="sm:flex-1" onClick={() => onOpenChange(false)}>
                    {t.calculator.continueShopping}
                  </Button>
                </div>
              </div>
            ) : null}
          </div>
        </div>
      </DialogContent>
    </Dialog>
  );
}
