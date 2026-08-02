"use client";

import { create } from "zustand";
import { persist } from "zustand/middleware";
import type { CartItem, Product, Variant } from "@/lib/types";

interface CartState {
  items: CartItem[];
  /** Controls the slide-over cart drawer. */
  isOpen: boolean;
  open: () => void;
  close: () => void;
  setOpen: (v: boolean) => void;

  addItem: (product: Product, variant: Variant, quantity?: number) => void;
  removeItem: (key: string) => void;
  updateQuantity: (key: string, quantity: number) => void;
  clear: () => void;

  // Derived selectors (call as functions to stay reactive)
  totalItems: () => number;
  subtotal: () => number;
}

export const useCart = create<CartState>()(
  persist(
    (set, get) => ({
      items: [],
      isOpen: false,
      open: () => set({ isOpen: true }),
      close: () => set({ isOpen: false }),
      setOpen: (v) => set({ isOpen: v }),

      addItem: (product, variant, quantity = 1) => {
        const key = `${product.id}:${variant.id}`;
        const current = get().items;
        const existing = current.find((i) => i.key === key);
        if (existing) {
          // Map to a NEW line object rather than mutating the one already in the
          // store. The old code did `existing.quantity += quantity` on an object
          // still referenced by the previous state, so any consumer memoising on
          // the line item (or a devtools/time-travel snapshot) saw the change
          // retroactively. It only ever repainted because the array identity
          // changed; equality-checked selectors were free to skip the update.
          set({
            items: current.map((i) =>
              i.key === key ? { ...i, quantity: i.quantity + quantity } : i
            ),
          });
          return;
        }
        set({
          items: [
            ...current,
            {
              key,
              productId: product.id,
              handle: product.handle,
              variantId: variant.id,
              title: product.title,
              titleGr: product.titleOriginal,
              colorName: variant.colorName,
              size: variant.size,
              price: variant.price,
              image: variant.image || product.featuredImage.local,
              imageSrc: variant.imageSrc || product.featuredImage.src,
              quantity,
            },
          ],
        });
      },

      removeItem: (key) => set({ items: get().items.filter((i) => i.key !== key) }),

      updateQuantity: (key, quantity) => {
        if (quantity <= 0) {
          set({ items: get().items.filter((i) => i.key !== key) });
          return;
        }
        set({
          items: get().items.map((i) =>
            i.key === key ? { ...i, quantity } : i
          ),
        });
      },

      clear: () => set({ items: [] }),

      totalItems: () => get().items.reduce((n, i) => n + i.quantity, 0),
      subtotal: () => get().items.reduce((s, i) => s + i.price * i.quantity, 0),
    }),
    {
      name: "berto-lucci-cart",
      // Only persist the line items, not the drawer open state.
      partialize: (state) => ({ items: state.items }),
    }
  )
);
