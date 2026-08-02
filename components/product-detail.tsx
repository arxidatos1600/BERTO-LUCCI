"use client";

import * as React from "react";
import { Check, Truck, RefreshCw, ShoppingBag, FileDown } from "lucide-react";
import { toast } from "sonner";
import type { Product } from "@/lib/types";
import { cn, formatPrice } from "@/lib/utils";
import { useCart } from "@/store/cart";
import { recordView } from "@/lib/recently-viewed";
import { ImageGallery } from "./image-gallery";
import { VariantSelector } from "./variant-selector";
import { AccordionItem } from "./accordion";
import { FrequentlyBoughtTogether } from "./frequently-bought-together";
import { Button } from "./ui/button";
import { Badge } from "./ui/badge";
import { Separator } from "./ui/separator";
import { useLang } from "./lang-provider";

export function ProductDetail({ product, companions = [] }: { product: Product; companions?: Product[] }) {
  const { lang, t: dict } = useLang();
  const t = dict.product;
  const addItem = useCart((s) => s.addItem);
  const openCart = useCart((s) => s.open);

  // Pick a sensible initial colour/size from the first available variant.
  const firstAvailable = product.variants.find((v) => v.available) ?? product.variants[0];
  const [color, setColor] = React.useState(firstAvailable?.color ?? product.colors[0]?.value ?? "");
  const [size, setSize] = React.useState(firstAvailable?.size ?? product.sizes[0] ?? "");
  const [imageIndex, setImageIndex] = React.useState(0);

  // The variant matching the current colour + size.
  const variant = React.useMemo(
    () => product.variants.find((v) => v.color === color && v.size === size),
    [product.variants, color, size]
  );

  // Pull the composition line ("Σύνθεση: ...") out of the Greek body copy and,
  // on the English site, translate the common material names.
  const fabricLine = React.useMemo(() => {
    const text = product.bodyHtml
      .replace(/<br\s*\/?>/gi, "\n")
      .replace(/<[^>]+>/g, " ")
      .replace(/&amp;/g, "&");
    const m = text.match(/Σύνθεση\s*:?\s*([^\n•]+)/i);
    let comp = m ? m[1].trim() : "";
    if (!comp) return "";
    if (lang === "en") {
      const map: Record<string, string> = {
        "Μετάξι": "Silk", "Βαμβάκι": "Cotton", "Λινό": "Linen", "Μαλλί": "Wool",
        "Πολυεστέρας": "Polyester", "Ελαστάνη": "Elastane", "Σπάντεξ": "Elastane",
        "Βισκόζη": "Viscose", "Ραγιόν": "Viscose", "Τεριλέν": "Terylene",
        "Κασμίρι": "Cashmere", "Πολυαμίδιο": "Polyamide", "Νάιλον": "Nylon",
        "Ακρυλικό": "Acrylic", "Μοντάλ": "Modal",
      };
      for (const [gr, en] of Object.entries(map)) comp = comp.replace(new RegExp(gr, "g"), en);
    }
    return comp.replace(/\s+/g, " ").trim();
  }, [product.bodyHtml, lang]);

  // Track this visit for the Recently Viewed rail (localStorage, no backend).
  React.useEffect(() => {
    recordView({
      handle: product.handle,
      local: product.featuredImage.local,
      fallback: product.featuredImage.src,
      title: product.title,
      titleGr: product.titleOriginal,
      price: product.price,
    });
  }, [product.handle, product.featuredImage.local, product.featuredImage.src, product.title, product.titleOriginal, product.price]);

  const price = variant?.price ?? product.price;
  const compareAt = variant?.compareAtPrice ?? product.compareAtPrice;
  const onSale = !!compareAt && compareAt > price;
  const canAdd = !!variant && variant.available;

  // When the colour changes, jump the gallery to that colour's image and
  // re-pick a valid size if the current one isn't offered for it.
  function handleColor(next: string) {
    setColor(next);
    const v = product.variants.find((x) => x.color === next);
    if (v) {
      const idx = product.images.findIndex((img) => img.local === v.image);
      if (idx >= 0) setImageIndex(idx);
    }
    const stillValid = product.variants.some(
      (x) => x.color === next && x.size === size && x.available
    );
    if (!stillValid) {
      const firstSize = product.variants.find((x) => x.color === next && x.available)?.size;
      if (firstSize) setSize(firstSize);
    }
  }

  function handleAdd() {
    if (!variant) return;
    addItem(product, variant, 1);
    toast.success(t.addedToast, {
      description: `${lang === "gr" ? product.titleOriginal : product.title} · ${variant.colorName} · ${variant.size}`,
    });
    openCart();
  }

  return (
    <>
    <div className="container grid gap-10 lg:grid-cols-2 lg:gap-16">
      {/* Gallery */}
      <ImageGallery images={product.images} activeIndex={imageIndex} onSelect={setImageIndex} />

      {/* Details */}
      <div className="min-w-0 lg:py-2">
        <p className="eyebrow-gold">{lang === "gr" ? product.productTypeGreek : product.category}</p>
        <h1 className="mt-2 font-serif text-3xl leading-tight md:text-4xl">
          {lang === "gr" ? product.titleOriginal : product.title}
        </h1>

        <div className="mt-4 flex items-center gap-3">
          <span className={cn("text-xl", onSale && "text-destructive")}>
            {formatPrice(price)}
          </span>
          {onSale && compareAt && (
            <>
              <span className="text-base text-muted-foreground line-through">
                {formatPrice(compareAt)}
              </span>
              <Badge variant="sale">−{product.salePercent}%</Badge>
            </>
          )}
        </div>

        <Separator className="my-7" />

        <VariantSelector
          product={product}
          selectedColor={color}
          selectedSize={size}
          onColor={handleColor}
          onSize={setSize}
        />

        {/* Stock line */}
        <div className="mt-6 flex items-center gap-2 text-sm">
          <span
            className={cn(
              "inline-block h-2 w-2 rounded-full",
              canAdd ? "bg-emerald-600" : "bg-muted-foreground"
            )}
          />
          <span className={canAdd ? "text-foreground" : "text-muted-foreground"}>
            {canAdd ? t.inStock : t.comboUnavailable}
          </span>
        </div>

        <div className="mt-6 flex flex-col gap-3 sm:flex-row">
          <Button
            size="lg"
            variant="accent"
            // `flex-1` alone collapsed this to ~19px below sm: in a flex-col the
            // main axis is vertical, so flex-basis:0 beat the h-14 from size="lg".
            // Full width below sm, flex only once the row layout kicks in.
            className="w-full min-h-14 sm:w-auto sm:flex-1"
            disabled={!canAdd}
            onClick={handleAdd}
          >
            <ShoppingBag className="h-4 w-4" />
            {canAdd ? t.addToBag : t.unavailable}
          </Button>
        </div>

        {/* Reassurance */}
        <div className="mt-8 grid grid-cols-1 gap-3 sm:grid-cols-3">
          {[
            { icon: Truck, label: t.freeShipping },
            { icon: RefreshCw, label: t.returns14 },
            { icon: Check, label: t.estItaly },
          ].map(({ icon: Icon, label }) => (
            <div key={label} className="flex items-center gap-2 text-xs text-muted-foreground">
              <Icon className="h-4 w-4 text-accent" />
              {label}
            </div>
          ))}
        </div>

        {/* Details · Fabric & Care · Shipping — elegant accordion */}
        <div className="mt-10">
          {product.bodyHtml && (
            <AccordionItem title={t.descriptionLabel} defaultOpen>
              <div className="prose-bl" dangerouslySetInnerHTML={{ __html: product.bodyHtml }} />
            </AccordionItem>
          )}
          <AccordionItem title={t.fabricCare} defaultOpen={!product.bodyHtml}>
            <div className="prose-bl space-y-3">
              {fabricLine && (
                <p className="flex flex-wrap gap-x-6 gap-y-1">
                  <span><span className="font-medium text-foreground">{t.compositionLabel}:</span> {fabricLine}</span>
                </p>
              )}
              <p>{t.careBody}</p>
            </div>
          </AccordionItem>
          <AccordionItem title={t.shippingReturns}>
            <p className="prose-bl">{t.shippingBody}</p>
            <a
              href={lang === "gr" ? "/legal/withdrawal-form-el.pdf" : "/legal/withdrawal-form-en.pdf"}
              download
              className="link-underline mt-4 inline-flex items-center gap-2 text-sm text-foreground"
            >
              <FileDown className="h-4 w-4 text-accent" />
              {dict.withdrawalForm.linkLabel}
            </a>
            <p className="mt-1.5 text-xs text-muted-foreground">{dict.withdrawalForm.context}</p>
          </AccordionItem>
        </div>
      </div>
    </div>

    {variant && companions.length > 0 && (
      <FrequentlyBoughtTogether product={product} variant={variant} companions={companions} />
    )}
    </>
  );
}
