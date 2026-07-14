import { createFileRoute, Link } from "@tanstack/react-router";
import { useQuery } from "@tanstack/react-query";
import { supabase } from "@/integrations/supabase/client";
import { SiteHeader } from "@/components/site-header";
import { SiteFooter } from "@/components/site-footer";

export const Route = createFileRoute("/vendors")({
  head: () => ({
    meta: [
      { title: "Vendors — Harvest" },
      {
        name: "description",
        content:
          "Meet the small farms, bakeries, and makers behind Harvest. Independent food brands, one delivery.",
      },
    ],
  }),
  component: VendorsPage,
});

function VendorsPage() {
  const { data: vendors } = useQuery({
    queryKey: ["all-vendors"],
    queryFn: async () => {
      const { data, error } = await supabase
        .from("vendors")
        .select("*")
        .order("name");
      if (error) throw error;
      return data;
    },
  });

  return (
    <div className="flex min-h-screen flex-col">
      <SiteHeader />
      <main className="mx-auto w-full max-w-7xl flex-1 px-4 py-10 md:px-6">
        <header className="mb-10 max-w-2xl">
          <p className="text-sm font-medium uppercase tracking-widest text-vendor">
            The makers behind Harvest
          </p>
          <h1 className="mt-2 font-display text-4xl md:text-5xl">Meet the vendors</h1>
          <p className="mt-3 text-muted-foreground">
            Each vendor runs their own storefront on Harvest. You buy directly from them; we handle
            checkout and delivery.
          </p>
        </header>
        <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-3">
          {vendors?.map((v) => (
            <Link
              key={v.id}
              to="/v/$slug"
              params={{ slug: v.slug }}
              className="group flex flex-col rounded-2xl border border-border/60 bg-card p-6 transition-shadow hover:shadow-sm"
            >
              <div
                className="mb-4 h-2 w-12 rounded-full"
                style={{ backgroundColor: v.hero_color ?? undefined }}
              />
              <h2 className="font-display text-2xl">{v.name}</h2>
              <p className="mt-1 text-sm text-muted-foreground">{v.tagline}</p>
              <p className="mt-4 line-clamp-3 text-sm text-foreground/80">{v.description}</p>
              <p className="mt-4 text-xs uppercase tracking-wider text-vendor">{v.location}</p>
            </Link>
          ))}
        </div>
      </main>
      <SiteFooter />
    </div>
  );
}
