import { createFileRoute, Link, useRouter } from "@tanstack/react-router";
import { useEffect, useState } from "react";
import { useQuery } from "@tanstack/react-query";
import { useServerFn } from "@tanstack/react-start";
import { getCart, placeOrder } from "@/lib/cart.functions";
import { SiteHeader } from "@/components/site-header";
import { SiteFooter } from "@/components/site-footer";
import { formatPrice, itemPrice, feePrice } from "@/lib/format";
import { toast } from "sonner";

export const Route = createFileRoute("/checkout")({
  head: () => ({ meta: [{ title: "Checkout — Harvest" }] }),
  component: CheckoutPage,
});

const DELIVERY_FEE = 599;

function CheckoutPage() {
  const router = useRouter();
  const [signedIn, setSignedIn] = useState<boolean | null>(null);
  const cartFn = useServerFn(getCart);
  const placeFn = useServerFn(placeOrder);
  const [address, setAddress] = useState("");
  const [slot, setSlot] = useState("Sat, Nov 8 · 10am–12pm");
  const [busy, setBusy] = useState(false);

  useEffect(() => {
    const userId = localStorage.getItem("userId");
    setSignedIn(!!userId);
    if (!userId) router.navigate({ to: "/auth", search: { next: "/checkout" } });
  }, [router]);

  const { data: items } = useQuery({
    queryKey: ["cart", true],
    queryFn: () => cartFn(),
    enabled: !!signedIn,
  });

  const subtotal = (items ?? []).reduce(
    (s: number, it: any) => s + it.quantity * itemPrice(it.product?.price_cents ?? 0),
    0
  );
  const total = subtotal + (items && items.length > 0 ? feePrice(DELIVERY_FEE) : 0);

  const onPlace = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!address.trim()) {
      toast.error("Please enter a delivery address");
      return;
    }
    setBusy(true);
    try {
      const res = await placeFn({
        data: { deliveryAddress: address.trim(), deliverySlot: slot },
      });
      router.navigate({ to: "/orders/$id", params: { id: res.orderId } });
    } catch (err: any) {
      toast.error(err?.message ?? "Could not place order");
      setBusy(false);
    }
  };

  if (signedIn === null) {
    return (
      <div className="flex min-h-screen flex-col">
        <SiteHeader />
        <div className="flex flex-1 items-center justify-center text-muted-foreground">
          Loading…
        </div>
      </div>
    );
  }

  return (
    <div className="flex min-h-screen flex-col">
      <SiteHeader />
      <main className="mx-auto w-full max-w-6xl flex-1 px-4 py-10 md:px-6">
        <h1 className="font-display text-4xl md:text-5xl">Checkout</h1>

        {items && items.length === 0 && (
          <div className="mt-10 rounded-2xl border border-border/60 bg-card p-10 text-center">
            <p className="text-muted-foreground">Your cart is empty.</p>
            <Link
              to="/"
              className="mt-4 inline-flex rounded-full bg-primary px-6 py-3 text-sm font-semibold text-primary-foreground"
            >
              Back to shop
            </Link>
          </div>
        )}

        {items && items.length > 0 && (
          <form onSubmit={onPlace} className="mt-8 grid gap-8 lg:grid-cols-[1fr_360px]">
            <div className="space-y-6">
              <section className="rounded-2xl border border-border/60 bg-card p-6">
                <h2 className="font-display text-xl">Delivery address</h2>
                <textarea
                  value={address}
                  onChange={(e) => setAddress(e.target.value)}
                  placeholder="Street, city, state, zip"
                  required
                  rows={3}
                  className="mt-3 w-full rounded-xl border border-input bg-background p-3 text-sm outline-none focus:ring-2 focus:ring-ring/60"
                />
              </section>

              <section className="rounded-2xl border border-border/60 bg-card p-6">
                <h2 className="font-display text-xl">Delivery slot</h2>
                <div className="mt-3 grid gap-2 sm:grid-cols-3">
                  {[
                    "Sat, Nov 8 · 10am–12pm",
                    "Sat, Nov 8 · 2pm–4pm",
                    "Sun, Nov 9 · 10am–12pm",
                  ].map((s) => (
                    <label
                      key={s}
                      className={`flex cursor-pointer flex-col rounded-xl border p-3 text-sm ${
                        slot === s
                          ? "border-primary bg-primary/5"
                          : "border-input hover:bg-muted"
                      }`}
                    >
                      <input
                        type="radio"
                        name="slot"
                        value={s}
                        checked={slot === s}
                        onChange={() => setSlot(s)}
                        className="sr-only"
                      />
                      <span className="font-medium">{s.split(" · ")[0]}</span>
                      <span className="text-muted-foreground">{s.split(" · ")[1]}</span>
                    </label>
                  ))}
                </div>
              </section>

              <section className="rounded-2xl border border-border/60 bg-card p-6">
                <h2 className="font-display text-xl">Payment</h2>
                <p className="mt-2 text-sm text-muted-foreground">
                  Payment isn't wired to a live processor in this demo — placing the order confirms it
                  immediately. Stripe Connect for per-vendor payouts is v2 in the blueprint.
                </p>
              </section>
            </div>

            <aside className="h-fit rounded-2xl border border-border/60 bg-card p-6 lg:sticky lg:top-24">
              <h2 className="font-display text-xl">Order summary</h2>
              <ul className="mt-4 space-y-2 text-sm">
                {items.map((it: any) => (
                  <li key={it.id} className="flex justify-between gap-2">
                    <span className="text-muted-foreground">
                      {it.quantity} × {it.product.name}
                    </span>
                    <span>{formatPrice(it.quantity * itemPrice(it.product.price_cents))}</span>
                  </li>
                ))}
              </ul>
              <dl className="mt-4 space-y-2 border-t border-border/60 pt-4 text-sm">
                <div className="flex justify-between">
                  <dt className="text-muted-foreground">Subtotal</dt>
                  <dd>{formatPrice(subtotal)}</dd>
                </div>
                <div className="flex justify-between">
                  <dt className="text-muted-foreground">Delivery</dt>
                  <dd>{formatPrice(feePrice(DELIVERY_FEE))}</dd>
                </div>
              </dl>
              <div className="mt-4 flex items-baseline justify-between border-t border-border/60 pt-4">
                <span className="font-semibold">Total</span>
                <span className="font-display text-2xl font-semibold">{formatPrice(total)}</span>
              </div>
              <button
                type="submit"
                disabled={busy}
                className="mt-6 inline-flex h-12 w-full items-center justify-center rounded-full bg-primary text-sm font-semibold text-primary-foreground hover:bg-primary/90 disabled:opacity-60"
              >
                {busy ? "Placing…" : `Place order · ${formatPrice(total)}`}
              </button>
            </aside>
          </form>
        )}
      </main>
      <SiteFooter />
    </div>
  );
}
