"use client";

import * as React from "react";
import Link from "next/link";
import { ArrowLeft, Minus, Plus, Trash2, ShoppingBag } from "lucide-react";
import { formatPrice, shippingFor, FREE_SHIPPING_THRESHOLD } from "@/lib/utils";
import { useCart } from "@/store/cart";
import { SmartImage } from "@/components/smart-image";
import { Button } from "@/components/ui/button";
import { Separator } from "@/components/ui/separator";
import { CheckoutDialog } from "@/components/checkout-dialog";
import { useLang } from "@/components/lang-provider";

export default function CartPage() {
  const { lang, t: dict } = useLang();
  const label = (i: { title: string; titleGr?: string }) =>
    lang === "gr" && i.titleGr ? i.titleGr : i.title;
  const t = dict.cart;
  const { items, updateQuantity, removeItem } = useCart();
  const subtotal = useCart((s) => s.items.reduce((t, i) => t + i.price * i.quantity, 0));
  const [checkout, setCheckout] = React.useState(false);

  // Avoid hydration mismatch: the persisted cart only exists on the client.
  const [mounted, setMounted] = React.useState(false);
  React.useEffect(() => setMounted(true), []);

  // Shipping policy lives in lib/utils so the slide-over bag quotes the same rule.
  const shipping = shippingFor(subtotal);
  const total = subtotal + shipping;

  if (!mounted) {
    return (
      <div className="on-dark min-h-[60vh] bg-background text-foreground">
        <div className="container py-20 text-sm text-muted-foreground">{t.loading}</div>
      </div>
    );
  }

  if (items.length === 0) {
    return (
      <div className="on-dark bg-background text-foreground">
        <div className="container flex min-h-[70vh] flex-col items-center justify-center gap-5 py-28 text-center">
          <ShoppingBag className="h-12 w-12 text-muted-foreground" strokeWidth={1} />
          <h1 className="font-serif text-3xl">{t.emptyTitle}</h1>
          <p className="max-w-sm text-sm text-muted-foreground">{t.emptyText}</p>
          <Button variant="accent" size="lg" asChild>
            <Link href="/shop">{t.startShopping}</Link>
          </Button>
        </div>
      </div>
    );
  }

  return (
    <div className="on-dark bg-background text-foreground">
      <div className="container py-10 lg:py-14">
      <div className="mb-8 flex items-end justify-between">
        <div>
          <p className="eyebrow-gold">{t.eyebrow}</p>
          <h1 className="mt-2 font-display text-4xl font-medium md:text-5xl">{t.title}</h1>
        </div>
        <Link href="/shop" className="hidden items-center gap-1.5 text-sm text-muted-foreground hover:text-foreground sm:flex">
          <ArrowLeft className="h-4 w-4" /> {t.continueShopping}
        </Link>
      </div>

      <div className="grid gap-12 lg:grid-cols-[1fr_360px]">
        {/* Line items */}
        <div>
          <div className="hidden grid-cols-[1fr_auto_auto] gap-4 border-b border-border pb-3 text-xs uppercase tracking-luxe text-muted-foreground sm:grid">
            <span>{t.colProduct}</span>
            <span className="w-32 text-center">{t.colQuantity}</span>
            <span className="w-24 text-right">{t.colTotal}</span>
          </div>

          {items.map((item) => (
            <div
              key={item.key}
              className="grid grid-cols-[auto_1fr] gap-4 border-b border-border py-6 sm:grid-cols-[auto_1fr_auto_auto] sm:items-center"
            >
              <Link
                href={`/products/${encodeURIComponent(item.handle)}`}
                className="relative h-32 w-24 shrink-0 overflow-hidden bg-secondary"
              >
                <SmartImage local={item.image} fallback={item.imageSrc} alt={label(item)} />
              </Link>

              <div className="min-w-0">
                <Link
                  href={`/products/${encodeURIComponent(item.handle)}`}
                  className="font-serif text-base hover:underline"
                >
                  {label(item)}
                </Link>
                <p className="mt-1 text-xs text-muted-foreground">
                  {item.colorName} · {t.sizeLabel} {item.size}
                </p>
                <p className="mt-1 text-sm">{formatPrice(item.price)}</p>
                <button
                  onClick={() => removeItem(item.key)}
                  className="mt-3 inline-flex items-center gap-1 text-xs text-muted-foreground hover:text-destructive sm:hidden"
                >
                  <Trash2 className="h-3.5 w-3.5" /> {t.remove}
                </button>
              </div>

              {/* Quantity */}
              <div className="flex items-center sm:w-32 sm:justify-center">
                <div className="flex items-center border border-border">
                  <button
                    aria-label={t.decreaseQtyAria}
                    className="flex h-9 w-9 items-center justify-center hover:bg-secondary"
                    onClick={() => updateQuantity(item.key, item.quantity - 1)}
                  >
                    <Minus className="h-3 w-3" />
                  </button>
                  <span className="w-9 text-center text-sm tabular-nums">{item.quantity}</span>
                  <button
                    aria-label={t.increaseQtyAria}
                    className="flex h-9 w-9 items-center justify-center hover:bg-secondary"
                    onClick={() => updateQuantity(item.key, item.quantity + 1)}
                  >
                    <Plus className="h-3 w-3" />
                  </button>
                </div>
              </div>

              {/* Line total + remove (desktop) */}
              <div className="hidden w-24 items-center justify-end gap-3 sm:flex">
                <span className="text-sm tabular-nums">
                  {formatPrice(item.price * item.quantity)}
                </span>
                <button
                  aria-label={t.removeAria}
                  onClick={() => removeItem(item.key)}
                  className="text-muted-foreground hover:text-destructive"
                >
                  <Trash2 className="h-4 w-4" />
                </button>
              </div>
            </div>
          ))}
        </div>

        {/* Summary */}
        <aside className="lg:sticky lg:top-24 lg:self-start">
          <div className="border border-border bg-card p-6">
            <h2 className="font-serif text-xl">{t.orderSummary}</h2>
            <Separator className="my-5" />
            <dl className="space-y-3 text-sm">
              <div className="flex justify-between">
                <dt className="text-muted-foreground">{t.subtotal}</dt>
                <dd>{formatPrice(subtotal)}</dd>
              </div>
              <div className="flex justify-between">
                <dt className="text-muted-foreground">{t.shipping}</dt>
                <dd>{shipping === 0 ? t.free : formatPrice(shipping)}</dd>
              </div>
              {shipping > 0 && (
                <p className="text-xs text-muted-foreground">
                  {t.freeShipping.replace("{x}", formatPrice(FREE_SHIPPING_THRESHOLD - subtotal))}
                </p>
              )}
            </dl>
            <Separator className="my-5" />
            <div className="flex items-baseline justify-between">
              <span className="text-sm uppercase tracking-luxe">{t.total}</span>
              <span className="font-serif text-2xl">{formatPrice(total)}</span>
            </div>
            <Button
              variant="accent"
              size="lg"
              className="mt-6 w-full"
              onClick={() => setCheckout(true)}
            >
              {t.checkout}
            </Button>
            <p className="mt-3 text-center text-xs text-muted-foreground">{t.secureNote}</p>
          </div>
        </aside>
      </div>

      <CheckoutDialog open={checkout} onOpenChange={setCheckout} />
      </div>
    </div>
  );
}
