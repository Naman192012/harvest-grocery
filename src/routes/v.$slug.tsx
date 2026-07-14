import { createFileRoute, Link, notFound } from "@tanstack/react-router";
import { useQuery } from "@tanstack/react-query";
import { SiteHeader } from "@/components/site-header";
import { SiteFooter } from "@/components/site-footer";
import { ProductCard } from "@/components/product-card";
import { MapPin } from "lucide-react";

export const Route = createFileRoute("/v/$slug")({
  head: ({ params }) => ({
    meta: [{ title: `${params.slug} — Harvest vendor` }],
  }),
  component: VendorPage,
  notFoundComponent: () => (
    <div className="flex min-h-screen flex-col">
      <SiteHeader />
      <div className="flex flex-1 items-center justify-center">
        <p>Vendor not found.</p>
      </div>
      <SiteFooter />
    </div>
  ),
  errorComponent: ({ error }) => (
    <div className="p-8">Failed to load: {error.message}</div>
  ),
});

function VendorPage() {
  const { slug } = Route.useParams();
  const { data: vendor } = useQuery({
    queryKey: ["vendor", slug],
    queryFn: async () => {
      const { getVendorBySlug } = await import("@/lib/products.server");
      const v = getVendorBySlug(slug);
      if (!v) throw notFound();
      return v;
    },
  });
  const { data: products } = useQuery({
    queryKey: ["products-by-vendor", slug],
    queryFn: async () => {
      const { getProductsByVendor } = await import("@/lib/products.server");
      return getProductsByVendor(slug);
    },
  });

  return (
    <div className="flex min-h-screen flex-col">
      <SiteHeader />
      <main className="flex-1">
        {vendor && (
          <>
            <section
              className="border-b border-border/60"
              style={{
                background: `linear-gradient(135deg, ${vendor.hero_color ?? "#1F5F3F"}, ${
                  vendor.hero_color ?? "#1F5F3F"
                }dd)`,
              }}
            >
              <div className="mx-auto max-w-7xl px-4 py-16 text-primary-foreground md:px-6 md:py-24">
                <Link to="/vendors" className="text-sm text-primary-foreground/70 hover:underline">
                  ← All vendors
                </Link>
                <h1 className="mt-4 font-display text-5xl md:text-6xl">{vendor.name}</h1>
                <p className="mt-3 max-w-xl text-lg text-primary-foreground/90">{vendor.tagline}</p>
                <p className="mt-6 max-w-xl text-primary-foreground/80">{vendor.description}</p>
                <p className="mt-6 inline-flex items-center gap-1 text-sm text-primary-foreground/80">
                  <MapPin className="h-4 w-4" />
                  {vendor.location}
                </p>
              </div>
            </section>

            <section className="mx-auto max-w-7xl px-4 py-12 md:px-6">
              <h2 className="mb-6 font-display text-3xl">From {vendor.name}</h2>
              <div className="grid grid-cols-2 gap-4 sm:grid-cols-3 lg:grid-cols-4">
                {products?.map((p) => <ProductCard key={p.id} product={p as any} />)}
              </div>
            </section>
          </>
        )}
      </main>
      <SiteFooter />
    </div>
  );
}
