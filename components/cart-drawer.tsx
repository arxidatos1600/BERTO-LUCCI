"use client";

import * as React from "react";
import Link from "next/link";
import { Minus, Plus, ShoppingBag, Trash2 } from "lucide-react";
import { formatPrice } from "@/lib/utils";
import { useCart } from "@/store/cart";
import { SmartImage } from "./smart-image";
import { Button } from "./ui/button";
import { Separator } from "./ui/separator";
import { Sheet, SheetContent, SheetHeader, SheetTitle } from "./ui/sheet";
import { CheckoutDialog } from "./checkout-dialog";
import { useLang } from "./lang-provider";

/** Global slide-over bag, mounted once in the providers tree. */
export function CartDrawer() {
  const { lang, t: dict } = useLang();
  const label = (i: { title: string; titleGr?: string }) =>
    lang === "gr" && i.titleGr ? i.titleGr : i.title;
  const t = dict.cart;
  const { isOpen, setOpen, items, updateQuantity, removeItem } = useCart();
  const subtotal = useCart((s) => s.items.reduce((t, i) => t + i.price * i.quantity, 0));
  const count = items.reduce((n, i) => n + i.quantity, 0);
  const [checkout, setCheckout] = React.useState(false);

  return (
    <>
      <Sheet open={isOpen} onOpenChange={setOpen}>
        <SheetContent side="right" className="w-full p-0 sm:max-w-md">
          <SheetHeader className="border-b border-border">
            <SheetTitle className="flex items-center gap-2 text-base uppercase tracking-luxe">
              <ShoppingBag className="h-4 w-4" />
              {t.yourBag} {count > 0 && <span className="text-muted-foreground">({count})</span>}
            </SheetTitle>
          </SheetHeader>

          {items.length === 0 ? (
            <div className="flex flex-1 flex-col items-center justify-center gap-4 px-6 text-center">
              <ShoppingBag className="h-10 w-10 text-muted-foreground" strokeWidth={1} />
              <p className="text-sm text-muted-foreground">{t.bagEmpty}</p>
              <Button variant="outline" onClick={() => setOpen(false)} asChild>
                <Link href="/shop">{t.continueShopping}</Link>
              </Button>
            </div>
          ) : (
            <>
              <div className="thin-scroll flex-1 overflow-y-auto px-6">
                {items.map((item) => (
                  <div key={item.key} className="flex gap-4 py-5">
                    <Link
                      href={`/products/${encodeURIComponent(item.handle)}`}
                      onClick={() => setOpen(false)}
                      className="relative h-28 w-20 shrink-0 overflow-hidden bg-secondary"
                    >
                      <SmartImage local={item.image} fallback={item.imageSrc} alt={label(item)} />
                    </Link>

                    <div className="flex flex-1 flex-col">
                      <div className="flex justify-between gap-2">
                        <Link
                          href={`/products/${encodeURIComponent(item.handle)}`}
                          onClick={() => setOpen(false)}
                          className="font-serif text-sm leading-snug hover:underline"
                        >
                          {label(item)}
                        </Link>
                        <button
                          aria-label="Remove item"
                          onClick={() => removeItem(item.key)}
                          className="-mr-2 inline-flex h-9 w-9 shrink-0 items-center justify-center text-muted-foreground transition-colors hover:text-destructive"
                        >
                          <Trash2 className="h-4 w-4" />
                        </button>
                      </div>
                      <p className="mt-1 text-xs text-muted-foreground">
                        {item.colorName} · {item.size}
                      </p>

                      <div className="mt-auto flex items-center justify-between pt-3">
                        <div className="flex items-center border border-border">
                          <button
                            aria-label="Decrease quantity"
                            className="flex h-8 w-8 items-center justify-center hover:bg-secondary"
                            onClick={() => updateQuantity(item.key, item.quantity - 1)}
                          >
                            <Minus className="h-3 w-3" />
                          </button>
                          <span className="w-8 text-center text-sm tabular-nums">
                            {item.quantity}
                          </span>
                          <button
                            aria-label="Increase quantity"
                            className="flex h-8 w-8 items-center justify-center hover:bg-secondary"
                            onClick={() => updateQuantity(item.key, item.quantity + 1)}
                          >
                            <Plus className="h-3 w-3" />
                          </button>
                        </div>
                        <span className="text-sm">
                          {formatPrice(item.price * item.quantity)}
                        </span>
                      </div>
                    </div>
                  </div>
                ))}
              </div>

              <div className="border-t border-border p-6">
                <div className="flex items-center justify-between">
                  <span className="eyebrow">{t.subtotal}</span>
                  <span className="font-serif text-lg">{formatPrice(subtotal)}</span>
                </div>
                <p className="mt-1 text-xs text-muted-foreground">{t.shippingTaxesNote}</p>
                <div className="mt-4 flex flex-col gap-2">
                  <Button variant="accent" size="lg" onClick={() => setCheckout(true)}>
                    {t.checkout}
                  </Button>
                  <Button variant="ghost" asChild onClick={() => setOpen(false)}>
                    <Link href="/cart">{t.viewFullBag}</Link>
                  </Button>
                </div>
              </div>
            </>
          )}
        </SheetContent>
      </Sheet>

      <CheckoutDialog open={checkout} onOpenChange={setCheckout} />
    </>
  );
}
