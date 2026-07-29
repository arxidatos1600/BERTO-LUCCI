"use client";

import * as React from "react";
import { ShieldCheck } from "lucide-react";
import { formatPrice } from "@/lib/utils";
import { useCart } from "@/store/cart";
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogHeader,
  DialogTitle,
} from "./ui/dialog";
import { Button } from "./ui/button";
import { useLang } from "./lang-provider";

/**
 * Placeholder checkout. In production this would hand off to Shopify Checkout;
 * for now it explains that and lets the user clear the bag.
 */
export function CheckoutDialog({
  open,
  onOpenChange,
}: {
  open: boolean;
  onOpenChange: (v: boolean) => void;
}) {
  const { t: dict } = useLang();
  const tc = dict.cart;
  const subtotal = useCart((s) => s.items.reduce((acc, i) => acc + i.price * i.quantity, 0));
  const clear = useCart((s) => s.clear);

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent>
        <DialogHeader>
          <div className="mx-auto mb-2 flex h-12 w-12 items-center justify-center rounded-full bg-secondary sm:mx-0">
            <ShieldCheck className="h-6 w-6 text-accent" />
          </div>
          <DialogTitle>{tc.checkoutSoonTitle}</DialogTitle>
          <DialogDescription>
            {tc.checkoutSoonDesc1}
            <strong className="text-foreground">{tc.checkoutShopify}</strong>
            {tc.checkoutSoonDesc2}
            <strong className="text-foreground">{formatPrice(subtotal)}</strong>.
          </DialogDescription>
        </DialogHeader>
        <div className="mt-2 flex flex-col gap-2 sm:flex-row sm:justify-end">
          <Button variant="outline" onClick={() => onOpenChange(false)}>
            {tc.keepShopping}
          </Button>
          <Button
            variant="accent"
            onClick={() => {
              clear();
              onOpenChange(false);
            }}
          >
            {tc.simulateOrder}
          </Button>
        </div>
      </DialogContent>
    </Dialog>
  );
}
