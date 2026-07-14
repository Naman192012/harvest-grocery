import { createFileRoute, Link, useRouter } from "@tanstack/react-router";
import { useEffect, useState } from "react";
import { useQuery } from "@tanstack/react-query";
import { supabase } from "@/integrations/supabase/client";
import { SiteHeader } from "@/components/site-header";
import { SiteFooter } from "@/components/site-footer";
import { formatPrice } from "@/lib/format";

export const Route = createFileRoute("/account/orders")({
  head: () => ({ meta: [{ title: "Your orders — Harvest" }] }),
  component: OrdersPage,
});

function OrdersPage() {
  const router = useRouter();
  const [ready, setReady] = useState(false);
  useEffect(() => {
    supabase.auth.getUser().then(({ data }) => {
      if (!data.user) {
        router.navigate({ to: "/auth", search: { next: "/account/orders" } });
        return;
      }
      setReady(true);
    });
  }, [router]);

  const { data: orders } = useQuery({
    queryKey: ["my-orders"],
    queryFn: async () => {
      const { data, error } = await supabase
        .from("orders")
        .select("*, items:order_items(*)")
        .order("created_at", { ascending: false });
      if (error) throw error;
      return data;
    },
    enabled: ready,
  });

  return (
    <div className="flex min-h-screen flex-col">
      <SiteHeader />
      <main className="mx-auto w-full max-w-4xl flex-1 px-4 py-12 md:px-6">
        <h1 className="font-display text-4xl md:text-5xl">Your orders</h1>
        {orders && orders.length === 0 && (
          <p className="mt-6 text-muted-foreground">You haven't placed any orders yet.</p>
        )}
        <div className="mt-8 space-y-4">
          {orders?.map((o) => (
            <Link
              key={o.id}
              to="/orders/$id"
              params={{ id: o.id }}
              className="flex items-center justify-between rounded-2xl border border-border/60 bg-card p-5 hover:shadow-sm"
            >
              <div>
                <p className="font-medium">Order #{o.id.slice(0, 8).toUpperCase()}</p>
                <p className="text-sm text-muted-foreground">
                  {new Date(o.created_at).toLocaleDateString()} · {(o.items?.length ?? 0)} items
                </p>
              </div>
              <div className="text-right">
                <p className="font-display text-xl font-semibold">{formatPrice(o.total_cents)}</p>
                <p className="text-xs capitalize text-muted-foreground">{o.status}</p>
              </div>
            </Link>
          ))}
        </div>
      </main>
      <SiteFooter />
    </div>
  );
}
