import { createFileRoute, Link, useRouter } from "@tanstack/react-router";
import { useEffect, useState } from "react";
import { useQuery } from "@tanstack/react-query";
import { useServerFn } from "@tanstack/react-start";
import { getOrderById } from "@/lib/cart.functions";
import { SiteHeader } from "@/components/site-header";
import { SiteFooter } from "@/components/site-footer";
import { formatPrice } from "@/lib/format";
import { CheckCircle2, ClipboardList, PackageSearch, Truck, PackageCheck, XCircle } from "lucide-react";

export const Route = createFileRoute("/orders/$id")({
  head: () => ({ meta: [{ title: "Order confirmed — Harvest" }] }),
  component: OrderPage,
});

function OrderPage() {
  const { id } = Route.useParams();
  const router = useRouter();
  const [ready, setReady] = useState(false);
  const getOrderFn = useServerFn(getOrderById);

  useEffect(() => {
    const userId = localStorage.getItem("userId");
    if (!userId) {
      router.navigate({ to: "/auth", search: { next: `/orders/${id}` } });
      return;
    }
    setReady(true);
  }, [router, id]);

  const { data: order } = useQuery({
    queryKey: ["order", id],
    queryFn: () => getOrderFn({ data: { orderId: id } }),
    enabled: ready,
  });

  const groups = groupByVendor(order?.items ?? []);

  return (
    <div className="flex min-h-screen flex-col">
      <SiteHeader />
      <main className="mx-auto w-full max-w-3xl flex-1 px-4 py-12 md:px-6">
        <div className="text-center">
          <CheckCircle2 className="mx-auto h-14 w-14 text-primary" strokeWidth={1.5} />
          <h1 className="mt-4 font-display text-4xl">Order confirmed</h1>
          <p className="mt-2 text-muted-foreground">
            {order ? `Order #${order.id.slice(0, 8).toUpperCase()}` : "Loading…"}
          </p>
        </div>

        {order && (
          <div className="mt-10 space-y-6">
            <section className="rounded-2xl border border-border/60 bg-card p-6">
              <h2 className="font-display text-lg">Track your order</h2>
              <div className="mt-4">
                <TrackingSteps status={order.status} />
              </div>
            </section>

            {order.shipping && (
              <section className="rounded-2xl border border-border/60 bg-card p-6">
                <h2 className="font-display text-lg">Shipping</h2>
                <dl className="mt-3 space-y-1.5 text-sm">
                  {order.shipping.carrier && (
                    <div className="flex justify-between">
                      <dt className="text-muted-foreground">Carrier</dt>
                      <dd>{order.shipping.carrier}</dd>
                    </div>
                  )}
                  {order.shipping.tracking_number && (
                    <div className="flex justify-between">
                      <dt className="text-muted-foreground">Tracking number</dt>
                      <dd className="font-mono">{order.shipping.tracking_number}</dd>
                    </div>
                  )}
                  {order.shipping.estimated_delivery && (
                    <div className="flex justify-between">
                      <dt className="text-muted-foreground">Estimated delivery</dt>
                      <dd>{new Date(order.shipping.estimated_delivery).toLocaleDateString()}</dd>
                    </div>
                  )}
                  {order.shipping.actual_delivery && (
                    <div className="flex justify-between">
                      <dt className="text-muted-foreground">Delivered on</dt>
                      <dd>{new Date(order.shipping.actual_delivery).toLocaleDateString()}</dd>
                    </div>
                  )}
                </dl>
                {order.shipping.notes && (
                  <p className="mt-3 text-xs text-muted-foreground">{order.shipping.notes}</p>
                )}
              </section>
            )}

            <section className="rounded-2xl border border-border/60 bg-card p-6">
              <h2 className="font-display text-lg">Delivery</h2>
              <p className="mt-2 text-sm">{order.delivery_address}</p>
              <p className="mt-1 text-sm text-muted-foreground">{order.delivery_slot}</p>
            </section>

            <section className="rounded-2xl border border-border/60 bg-card">
              <header className="border-b border-border/60 px-6 py-4">
                <h2 className="font-display text-lg">What you ordered</h2>
              </header>
              <div className="divide-y divide-border/60">
                {Object.entries(groups).map(([vendor, list]) => (
                  <div key={vendor} className="px-6 py-4">
                    <p className="text-xs font-semibold uppercase tracking-wide text-vendor">
                      {vendor}
                    </p>
                    <ul className="mt-2 space-y-1 text-sm">
                      {list.map((it: any) => (
                        <li key={it.id} className="flex justify-between">
                          <span>
                            {it.quantity} × {it.product_name}
                          </span>
                          <span>{formatPrice(it.quantity * it.price_cents)}</span>
                        </li>
                      ))}
                    </ul>
                  </div>
                ))}
              </div>
              <footer className="flex justify-between border-t border-border/60 px-6 py-4">
                <span className="font-semibold">Total paid</span>
                <span className="font-display text-xl font-semibold">
                  {formatPrice(order.total_cents)}
                </span>
              </footer>
            </section>

            <div className="flex flex-wrap justify-center gap-3">
              <Link
                to="/account/orders"
                className="inline-flex rounded-full border border-input px-6 py-3 text-sm font-semibold hover:bg-muted"
              >
                All orders
              </Link>
              <Link
                to="/"
                className="inline-flex rounded-full bg-primary px-6 py-3 text-sm font-semibold text-primary-foreground hover:bg-primary/90"
              >
                Keep shopping
              </Link>
            </div>
          </div>
        )}
      </main>
      <SiteFooter />
    </div>
  );
}

function groupByVendor(items: any[]) {
  const g: Record<string, any[]> = {};
  for (const it of items) (g[it.vendor_name] ??= []).push(it);
  return g;
}

const TRACKING_STEPS = [
  { key: "Placed", label: "Placed", icon: ClipboardList },
  { key: "Processing", label: "Processing", icon: PackageSearch },
  { key: "Shipped", label: "Shipped", icon: Truck },
  { key: "Delivered", label: "Delivered", icon: PackageCheck },
];

function TrackingSteps({ status }: { status: string }) {
  if (status === "Cancelled") {
    return (
      <div className="flex items-center gap-2 rounded-xl bg-destructive/10 px-4 py-3 text-sm font-medium text-destructive">
        <XCircle className="h-5 w-5" />
        This order was cancelled.
      </div>
    );
  }

  const currentIndex = TRACKING_STEPS.findIndex((s) => s.key === status);

  return (
    <div className="flex items-start">
      {TRACKING_STEPS.map((step, i) => {
        const Icon = step.icon;
        const done = i <= currentIndex;
        return (
          <div key={step.key} className="flex flex-1 items-center last:flex-none">
            <div className="flex flex-col items-center gap-1.5">
              <div
                className={`flex h-9 w-9 items-center justify-center rounded-full border-2 ${
                  done
                    ? "border-primary bg-primary text-primary-foreground"
                    : "border-border text-muted-foreground"
                }`}
              >
                <Icon className="h-4 w-4" />
              </div>
              <span
                className={`text-xs font-medium ${done ? "text-foreground" : "text-muted-foreground"}`}
              >
                {step.label}
              </span>
            </div>
            {i < TRACKING_STEPS.length - 1 && (
              <div
                className={`mx-2 mb-5 h-0.5 flex-1 ${i < currentIndex ? "bg-primary" : "bg-border"}`}
              />
            )}
          </div>
        );
      })}
    </div>
  );
}
