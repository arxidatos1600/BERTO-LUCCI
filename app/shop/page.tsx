import type { Metadata } from "next";
import { ShopClient } from "@/components/shop-client";

export const metadata: Metadata = {
  alternates: { canonical: "/shop" },
  title: "Shop All",
  description: "Browse the full Berto Lucci collection of Italian menswear.",
};

/**
 * The URL params are read HERE, on the server, and handed to ShopClient as props.
 *
 * Previously ShopClient called useSearchParams(), which forced it inside a
 * <Suspense> boundary. On a HARD load of /shop that boundary never resolved: the
 * skeletons rendered server-side, the component never mounted on the client, its
 * data effect never ran, and the page sat on "Loading shop…" forever for anyone
 * arriving from a search result, a shared link, a bookmark or a refresh. Reading
 * the params server-side removes the hook, the boundary and the failure mode at
 * once — and a client-side nav to ?category=… simply re-renders this server
 * component and pushes fresh props down, which is what keeps category switching
 * working without a remount.
 */
export default async function ShopPage({
  searchParams,
}: {
  searchParams: Promise<Record<string, string | string[] | undefined>>;
}) {
  const sp = await searchParams;
  const one = (v: string | string[] | undefined) => (Array.isArray(v) ? v[0] : v) ?? "";

  return (
    <ShopClient
      categoryParam={one(sp.category)}
      saleParam={one(sp.sale) === "1"}
      qParam={one(sp.q)}
    />
  );
}
