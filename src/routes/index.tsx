import { createFileRoute, Link } from "@tanstack/react-router";
import { useQuery } from "@tanstack/react-query";
import { SiteHeader } from "@/components/site-header";
import { SiteFooter } from "@/components/site-footer";
import { ProductCard } from "@/components/product-card";
import { ArrowRight } from "lucide-react";

export const Route = createFileRoute("/")({
  head: () => ({
    meta: [
      { title: "Harvest — a grocery market from many local vendors" },
      {
        name: "description",
        content:
          "Fresh produce, sourdough bread, wild seafood, and pantry staples from local vendors. Shop many vendors in one cart with a single delivery.",
      },
    ],
  }),
  component: HomePage,
});

function HomePage() {
  const { data: categories } = useQuery({
    queryKey: ["categories"],
    queryFn: async () => {
      const { getCategories } = await import("@/lib/products.server");
      return getCategories();
    },
  });
  const { data: vendors } = useQuery({
    queryKey: ["vendors-home"],
    queryFn: async () => {
      const { getAllVendors } = await import("@/lib/products.server");
      return getAllVendors();
    },
  });
  const { data: featured } = useQuery({
    queryKey: ["featured-products"],
    queryFn: async () => {
      const { getFeaturedProducts } = await import("@/lib/products.server");
      return getFeaturedProducts();
    },
  });

  return (
    <div className="flex min-h-screen flex-col">
      <SiteHeader />
      <main className="flex-1">
        {/* Hero */}
        <section className="mx-auto max-w-7xl px-4 pt-10 md:px-6 md:pt-16">
          <div className="grid gap-8 rounded-3xl bg-gradient-to-br from-primary/95 to-primary p-8 text-primary-foreground md:grid-cols-2 md:gap-12 md:p-14">
            <div className="flex flex-col justify-center">
              <p className="text-sm font-medium uppercase tracking-widest text-primary-foreground/70">
                This week at Harvest
              </p>
              <h1 className="mt-3 font-display text-4xl leading-[1.05] md:text-6xl">
                A market of local vendors,
                <br />
                <span className="italic text-accent">one</span> beautiful cart.
              </h1>
              <p className="mt-5 max-w-md text-primary-foreground/80">
                Shop sourdough from Rossi's, tomatoes from Green Acre, and salmon from Blue Sea —
                all in one delivery.
              </p>
              <div className="mt-8 flex flex-wrap gap-3">
                <Link
                  to="/c/$slug"
                  params={{ slug: "produce" }}
                  className="inline-flex items-center gap-2 rounded-full bg-background px-6 py-3 text-sm font-semibold text-foreground transition-transform hover:scale-[1.02]"
                >
                  Start shopping
                  <ArrowRight className="h-4 w-4" />
                </Link>
                <Link
                  to="/vendors"
                  className="inline-flex items-center rounded-full border border-primary-foreground/30 px-6 py-3 text-sm font-semibold hover:bg-primary-foreground/10"
                >
                  Meet the vendors
                </Link>
              </div>
            </div>
            <div className="relative hidden aspect-[4/3] overflow-hidden rounded-2xl md:block">
              <img
                src="https://images.unsplash.com/photo-1542838132-92c53300491e?w=1200"
                alt="Fresh produce market display"
                className="h-full w-full object-cover"
              />
            </div>
          </div>
        </section>

        {/* Categories */}
        <section className="mx-auto max-w-7xl px-4 py-16 md:px-6">
          <div className="mb-6 flex items-end justify-between">
            <h2 className="font-display text-3xl md:text-4xl">Shop by category</h2>
          </div>
          <div className="grid grid-cols-2 gap-3 sm:grid-cols-4 lg:grid-cols-8">
            {categories?.map((cat) => (
              <Link
                key={cat.id}
                to="/c/$slug"
                params={{ slug: cat.slug }}
                className="flex flex-col items-center gap-2 rounded-2xl border border-border/60 bg-card px-3 py-6 text-center transition-all hover:-translate-y-0.5 hover:shadow-sm"
              >
                <span className="text-3xl">{cat.emoji}</span>
                <span className="text-sm font-medium">{cat.name}</span>
              </Link>
            ))}
          </div>
        </section>

        {/* Vendors */}
        <section className="mx-auto max-w-7xl px-4 pb-16 md:px-6">
          <div className="mb-6 flex items-end justify-between">
            <div>
              <p className="text-sm font-medium uppercase tracking-widest text-vendor">
                Small brands, big flavor
              </p>
              <h2 className="mt-1 font-display text-3xl md:text-4xl">Featured vendors</h2>
            </div>
            <Link to="/vendors" className="text-sm font-medium text-primary hover:underline">
              See all →
            </Link>
          </div>
          <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-3">
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
                <h3 className="font-display text-xl">{v.name}</h3>
                <p className="mt-1 text-sm text-muted-foreground">{v.tagline}</p>
                <p className="mt-4 text-xs uppercase tracking-wider text-vendor">{v.location}</p>
              </Link>
            ))}
          </div>
        </section>

        {/* Featured products */}
        <section className="mx-auto max-w-7xl px-4 pb-24 md:px-6">
          <div className="mb-6 flex items-end justify-between">
            <h2 className="font-display text-3xl md:text-4xl">Trending this week</h2>
          </div>
          <div className="grid grid-cols-2 gap-4 sm:grid-cols-3 lg:grid-cols-4">
            {featured?.map((p) => <ProductCard key={p.id} product={p as any} />)}
          </div>
        </section>
      </main>
      <SiteFooter />
    </div>
  );
}
