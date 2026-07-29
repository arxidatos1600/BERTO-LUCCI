"use client";

import { Toaster } from "sonner";
import { CartDrawer } from "./cart-drawer";

/** Client-only chrome mounted once around the app. */
export function Providers({ children }: { children: React.ReactNode }) {
  return (
    <>
      {children}
      <CartDrawer />
      <Toaster
        position="bottom-right"
        toastOptions={{
          style: {
            borderRadius: "0",
            border: "1px solid hsl(var(--border))",
          },
        }}
      />
    </>
  );
}
