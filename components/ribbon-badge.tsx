import { cn } from "@/lib/utils";

/**
 * A pointed corner "flag" tag for product-card imagery (sale % / new-in),
 * replacing the flat pill badge in that one spot with something closer to the
 * reference site's ribbon treatment — reshaped into OUR monochrome/metallic
 * language (solid black or shimmering silver) rather than its bright pink,
 * so it reads as house style, not a copy.
 */
export function RibbonBadge({
  children,
  tone = "dark",
  className,
}: {
  children: React.ReactNode;
  /** "dark" = solid black/milky-white (sale). "shine" = metallic silver (new-in). */
  tone?: "dark" | "shine";
  className?: string;
}) {
  return (
    <span
      className={cn(
        "relative inline-flex items-center py-1 pl-2.5 pr-4 text-[10px] font-semibold uppercase tracking-luxe shadow-sm",
        tone === "dark" && "bg-primary text-primary-foreground",
        tone === "shine" && "text-silver bg-[hsl(0_0%_10%)]",
        className
      )}
      style={{ clipPath: "polygon(0 0, 100% 0, 88% 50%, 100% 100%, 0 100%)" }}
    >
      {children}
    </span>
  );
}
