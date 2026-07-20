import { createFileRoute, Link, useRouter } from "@tanstack/react-router";
import { useEffect, useState } from "react";
import { useQuery, useQueryClient } from "@tanstack/react-query";
import { useServerFn } from "@tanstack/react-start";
import { getCart, updateCartItem } from "@/lib/cart.functions";
import { SiteHeader } from "@/components/site-header";
import { SiteFooter } from "@/components/site-footer";
import { formatPrice, itemPrice, deliveryFee } from "@/lib/format";
import { Minus, Plus, Trash2, ShoppingBag } from "lucide-react";
import { toast } from "sonner";

export const Route = createFileRoute("/cart")({
  head: () => ({ meta: [{ title: "Your cart — Harvest" }] }),
  component: CartPage,
});

function CartPage() {
  const router = useRouter();
  const qc = useQueryClient();
  const [checkingAuth, setCheckingAuth] = useState(true);
  const [signedIn, setSignedIn] = useState(false);
  const cartFn = useServerFn(getCart);
  const updateFn = useServerFn(updateCartItem);

  useEffect(() => {
    const userId = localStorage.getItem("userId");
    setSignedIn(!!userId);
    setCheckingAuth(false);
  }, []);

  const { data: items, isLoading } = useQuery({
    queryKey: ["cart", signedIn],
    queryFn: () => cartFn(),
    enabled: signedIn,
  });

  if (checkingAuth) {
    return (
      <div className="flex min-h-screen flex-col">
        <SiteHeader />
        <div className="flex flex-1 items-center justify-center text-muted-foreground">Loading…</div>
      </div>
    );
  }

  if (!signedIn) {
    return (
      <div className="flex min-h-screen flex-col">
        <SiteHeader />
        <main className="mx-auto w-full max-w-2xl flex-1 px-4 py-20 text-center md:px-6">
          <ShoppingBag className="mx-auto h-12 w-12 text-primary" />
          <h1 className="mt-4 font-display text-3xl">Sign in to see your cart</h1>
          <p className="mt-2 text-muted-foreground">Your cart is tied to your Harvest account.</p>
          <Link
            to="/auth"
            search={{ next: "/cart" }}
            className="mt-6 inline-flex rounded-full bg-primary px-6 py-3 text-sm font-semibold text-primary-foreground"
          >
            Sign in or create account
          </Link>
        </main>
        <SiteFooter />
      </div>
    );
  }

  const groups = groupByVendor(items ?? []);
  const subtotal = (items ?? []).reduce(
    (sum: number, it: any) => sum + it.quantity * itemPrice(it.product?.price_cents ?? 0),
    0
  );
  const delivery = deliveryFee(subtotal, items?.length ?? 0);
  const total = subtotal + delivery;

  const setQty = async (itemId: string, quantity: number) => {
    try {
      await updateFn({ data: { itemId, quantity } });
      qc.invalidateQueries({ queryKey: ["cart"] });
      qc.invalidateQueries({ queryKey: ["cart-count"] });
    } catch (e: any) {
      toast.error(e?.message ?? "Update failed");
    }
  };

  return (
    <div className="flex min-h-screen flex-col">
      <SiteHeader />
      <main className="mx-auto w-full max-w-6xl flex-1 px-4 py-10 md:px-6">
        <h1 className="font-display text-4xl md:text-5xl">Your cart</h1>

        {isLoading && <p className="mt-8 text-muted-foreground">Loading…</p>}

        {items && items.length === 0 && (
          <div className="mt-10 rounded-2xl border border-border/60 bg-card p-10 text-center">
            <p className="text-muted-foreground">Your cart is empty.</p>
            <Link
              to="/"
              className="mt-4 inline-flex rounded-full bg-primary px-6 py-3 text-sm font-semibold text-primary-foreground"
            >
              Start shopping
            </Link>
          </div>
        )}

        {items && items.length > 0 && (
          <div className="mt-8 grid gap-8 lg:grid-cols-[1fr_360px]">
            <div className="space-y-6">
              {Object.entries(groups).map(([vendorName, list]) => (
                <section
                  key={vendorName}
                  className="overflow-hidden rounded-2xl border border-border/60 bg-card"
                >
                  <header className="flex items-center justify-between border-b border-border/60 px-5 py-3">
                    <p className="text-sm font-semibold uppercase tracking-wide text-vendor">
                      {vendorName}
                    </p>
                    <p className="text-sm font-medium">
                      {formatPrice(
                        list.reduce((s, it: any) => s + it.quantity * itemPrice(it.product.price_cents), 0)
                      )}
                    </p>
                  </header>
                  <ul className="divide-y divide-border/60">
                    {list.map((it: any) => (
                      <li key={it.id} className="flex gap-4 p-4">
                        <Link
                          to="/p/$slug"
                          params={{ slug: it.product.slug }}
                          className="h-20 w-20 flex-shrink-0 overflow-hidden rounded-xl bg-muted"
                        >
                          {it.product.image_url && (
                            <img
                              src={it.product.image_url}
                              alt={it.product.name}
                              className="h-full w-full object-cover"
                            />
                          )}
                        </Link>
                        <div className="flex flex-1 flex-col">
                          <Link
                            to="/p/$slug"
                            params={{ slug: it.product.slug }}
                            className="font-medium hover:underline"
                          >
                            {it.product.name}
                          </Link>
                          <p className="text-xs text-muted-foreground">{it.product.unit_label}</p>
                          <div className="mt-auto flex items-center justify-between pt-2">
                            <div className="inline-flex items-center rounded-full border border-input">
                              <button
                                onClick={() => setQty(it.id, it.quantity - 1)}
                                aria-label="Decrease"
                                className="inline-flex h-8 w-8 items-center justify-center rounded-l-full hover:bg-muted"
                              >
                                <Minus className="h-3.5 w-3.5" />
                              </button>
                              <span className="w-8 text-center text-sm font-medium">
                                {it.quantity}
                              </span>
                              <button
                                onClick={() => setQty(it.id, it.quantity + 1)}
                                aria-label="Increase"
                                className="inline-flex h-8 w-8 items-center justify-center rounded-r-full hover:bg-muted"
                              >
                                <Plus className="h-3.5 w-3.5" />
                              </button>
                            </div>
                            <div className="flex items-center gap-3">
                              <span className="font-medium">
                                {formatPrice(it.quantity * itemPrice(it.product.price_cents))}
                              </span>
                              <button
                                onClick={() => setQty(it.id, 0)}
                                aria-label="Remove"
                                className="text-muted-foreground hover:text-destructive"
                              >
                                <Trash2 className="h-4 w-4" />
                              </button>
                            </div>
                          </div>
                        </div>
                      </li>
                    ))}
                  </ul>
                </section>
              ))}
            </div>

            <aside className="h-fit rounded-2xl border border-border/60 bg-card p-6 lg:sticky lg:top-24">
              <h2 className="font-display text-xl">Order summary</h2>
              <dl className="mt-4 space-y-2 text-sm">
                <div className="flex justify-between">
                  <dt className="text-muted-foreground">Subtotal</dt>
                  <dd>{formatPrice(subtotal)}</dd>
                </div>
                <div className="flex justify-between">
                  <dt className="text-muted-foreground">Delivery</dt>
                  <dd>{delivery === 0 ? "Free" : formatPrice(delivery)}</dd>
                </div>
              </dl>
              <div className="mt-4 flex items-baseline justify-between border-t border-border/60 pt-4">
                <span className="font-semibold">Total</span>
                <span className="font-display text-2xl font-semibold">{formatPrice(total)}</span>
              </div>
              <button
                onClick={() => router.navigate({ to: "/checkout" })}
                className="mt-6 inline-flex h-12 w-full items-center justify-center rounded-full bg-primary text-sm font-semibold text-primary-foreground hover:bg-primary/90"
              >
                Checkout
              </button>
              <p className="mt-3 text-center text-xs text-muted-foreground">
                Multi-vendor orders ship together in one delivery.
              </p>
            </aside>
          </div>
        )}
      </main>
      <SiteFooter />
    </div>
  );
}

function groupByVendor(items: any[]) {
  const g: Record<string, any[]> = {};
  for (const it of items) {
    const key = it.product?.vendor?.name ?? "Other";
    (g[key] ??= []).push(it);
  }
  return g;
}
