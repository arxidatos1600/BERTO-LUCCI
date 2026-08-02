/**
 * Size-recommendation logic for the PDP Size Guide calculator.
 *
 * IMPORTANT (Gate J — real data only): Berto Lucci's product data has no
 * per-garment lab measurements, only size labels (S/M/L/XL/2XL...). Rather
 * than inventing garment-specific cm figures, this uses the published,
 * industry-standard EU/IT menswear chest-circumference correspondence — the
 * same bands used across the EU apparel trade — clearly presented in the UI
 * as a GENERAL guide, never as this-exact-garment's own measurements.
 *
 * The recommendation always resolves to one of the PRODUCT's own available
 * `sizes`, so it never suggests a size the item isn't actually offered in.
 */

export type SizeLabel = "XS" | "S" | "M" | "L" | "XL" | "XXL" | "3XL" | "4XL" | "5XL" | "6XL";

/**
 * Standard EU/IT menswear chest circumference bands, in cm (upper bound).
 * Labels match the real catalog vocabulary (`public/data/bertolucci_products.json`
 * uses "XXL", not "2XL", and stocks up to "6XL" on shirts) — the 4XL-6XL bands
 * continue the same ~8cm-per-step progression already established XS-3XL.
 */
const CHEST_BANDS: { size: SizeLabel; max: number }[] = [
  { size: "XS", max: 92 },
  { size: "S", max: 100 },
  { size: "M", max: 108 },
  { size: "L", max: 116 },
  { size: "XL", max: 124 },
  { size: "XXL", max: 132 },
  { size: "3XL", max: 140 },
  { size: "4XL", max: 148 },
  { size: "5XL", max: 156 },
  { size: "6XL", max: 999 },
];

const ORDER: SizeLabel[] = ["XS", "S", "M", "L", "XL", "XXL", "3XL", "4XL", "5XL", "6XL"];

/** Fit preference: -1 = tighter (size down), 0 = true to size, 1 = looser (size up). */
export type FitPreference = -1 | 0 | 1;

export interface SizeRecommendation {
  /** The recommended size, drawn from the product's own `availableSizes`. */
  size: string;
  /** 0 (tight end) to 1 (loose end) — position on the visual fit gauge. */
  gaugePosition: number;
  /** Whether the exact computed size exists on this product; if not, the
   *  nearest available one was substituted. */
  substituted: boolean;
}

/** Chest cm -> base standard size label, before fit-preference adjustment. */
function bandForChest(chestCm: number): SizeLabel {
  const hit = CHEST_BANDS.find((b) => chestCm <= b.max);
  return hit ? hit.size : "6XL";
}

/**
 * Recommend a size from the product's own available sizes.
 * @param chestCm customer-provided chest measurement (their own body data)
 * @param fit -1 tighter, 0 true-to-size, 1 looser
 * @param availableSizes the PRODUCT's real size labels (never invented)
 */
export function recommendSize(
  chestCm: number,
  fit: FitPreference,
  availableSizes: string[]
): SizeRecommendation | null {
  if (!chestCm || chestCm <= 0 || availableSizes.length === 0) return null;

  const base = bandForChest(chestCm);
  let idx = ORDER.indexOf(base) + fit; // shift a size band per fit preference
  idx = Math.max(0, Math.min(ORDER.length - 1, idx));
  const target = ORDER[idx];

  // Resolve against what this product actually offers.
  const normalized = (s: string) => s.trim().toUpperCase();
  const available = availableSizes.map(normalized);
  let resolved = target;
  let substituted = false;
  if (!available.includes(target)) {
    // Walk outward from the target band to the nearest size this product has.
    let offset = 1;
    while (offset < ORDER.length) {
      const down = ORDER[idx - offset];
      const up = ORDER[idx + offset];
      if (down && available.includes(down)) { resolved = down; substituted = true; break; }
      if (up && available.includes(up)) { resolved = up; substituted = true; break; }
      offset++;
    }
    if (!available.includes(resolved)) {
      // No numeric overlap at all (e.g. a ONE-size accessory) — nothing to
      // recommend; caller should fall back to the static chart only.
      return null;
    }
  }

  const original = availableSizes[available.indexOf(resolved)];
  const gaugePosition = ORDER.length > 1 ? idx / (ORDER.length - 1) : 0.5;

  return { size: original, gaugePosition, substituted };
}

/** The general chart shown on the static "Size Chart" tab (cm, chest circumference). */
export const GENERAL_CHEST_CHART: { size: SizeLabel; min: number; max: number }[] = [
  { size: "XS", min: 84, max: 92 },
  { size: "S", min: 92, max: 100 },
  { size: "M", min: 100, max: 108 },
  { size: "L", min: 108, max: 116 },
  { size: "XL", min: 116, max: 124 },
  { size: "XXL", min: 124, max: 132 },
  { size: "3XL", min: 132, max: 140 },
  { size: "4XL", min: 140, max: 148 },
  { size: "5XL", min: 148, max: 156 },
  { size: "6XL", min: 156, max: 164 },
];

/**
 * Whether a product's own size vocabulary corresponds to the chest-based
 * system at all. Real catalog sizing splits into three shapes that don't mix:
 * letter runs (XS-6XL, chest-relevant — what this guide serves), a single
 * "ONE" size (accessories: ties, pashminas, pocket squares), and numeric
 * waist sizes (trousers/jeans/shorts, a different measurement entirely this
 * guide has no data for). Returns false for the latter two, so callers can
 * hide the chest-based guide entirely rather than show it where it's wrong.
 */
export function hasChestSizing(availableSizes: string[]): boolean {
  return (
    availableSizes.length > 0 &&
    GENERAL_CHEST_CHART.some(
      (band) => recommendSize((band.min + band.max) / 2, 0, availableSizes) !== null
    )
  );
}
