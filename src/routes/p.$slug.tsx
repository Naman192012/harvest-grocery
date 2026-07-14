import { createFileRoute, Link, notFound, useRouter } from "@tanstack/react-router";
import { useQuery, useQueryClient } from "@tanstack/react-query";
import { SiteHeader } from "@/components/site-header";
import { SiteFooter } from "@/components/site-footer";
import { ProductCard } from "@/components/product-card";
import { formatPrice, itemPrice } from "@/lib/format";
import { useServerFn } from "@tanstack/react-start";
import { addToCart } from "@/lib/cart.functions";
import { useState } from "react";
import { toast } from "sonner";
import { Minus, Plus, MapPin } from "lucide-react";

export const Route = createFileRoute("/p/$slug")({
  head: ({ params }) => ({
    meta: [
      { title: `${titleize(params.slug)} — Harvest` },
      {
        name: "description",
        content: `Buy ${titleize(params.slug)} from a local vendor on Harvest. Fresh, curated, delivered.`,
      },
    ],
  }),
  component: ProductPage,
  notFoundComponent: () => (
    <div className="flex min-h-screen flex-col">
      <SiteHeader />
      <div className="flex flex-1 items-center justify-center">
        <p>Product not found.</p>
      </div>
      <SiteFooter />
    </div>
  ),
  errorComponent: ({ error }) => (
    <div className="p-8">
      <p>Failed to load: {error.message}</p>
    </div>
  ),
});

function titleize(s: string) {
  return s.replace(/-/g, " ").replace(/\b\w/g, (m) => m.toUpperCase());
}

function ProductPage() {
  const { slug } = Route.useParams();
  const router = useRouter();
  const qc = useQueryClient();
  const add = useServerFn(addToCart);
  const [qty, setQty] = useState(1);
  const [busy, setBusy] = useState(false);

  const { data: product } = useQuery({
    queryKey: ["product", slug],
    queryFn: async () => {
      const { getProductBySlug } = await import("@/lib/products.server");
      const data = getProductBySlug(slug);
      if (!data) throw notFound();
      return data;
    },
  });

  const { data: related } = useQuery({
    queryKey: ["related", product?.category?.slug, product?.id],
    queryFn: async () => {
      if (!product) return [];
      const { getRelatedProducts } = await import("@/lib/products.server");
      return getRelatedProducts(product.category.slug, product.slug);
    },
    enabled: !!product,
  });

  const onAdd = async () => {
    if (!product) return;
    setBusy(true);
    try {
      if (!auth.currentUser) {
        router.navigate({ to: "/auth", search: { next: "/cart" } });
        return;
      }
      await add({ data: { productId: product.id, quantity: qty } });
      toast.success(`Added ${qty} × ${product.name} to cart`);
      qc.invalidateQueries({ queryKey: ["cart-count"] });
    } catch (err: any) {
      toast.error(err?.message ?? "Could not add to cart");
    } finally {
      setBusy(false);
    }
  };

  return (
    <div className="flex min-h-screen flex-col">
      <SiteHeader />
      <main className="mx-auto w-full max-w-7xl flex-1 px-4 py-10 md:px-6">
        {product && (
          <>
            <nav className="mb-6 text-sm text-muted-foreground">
              <Link to="/" className="hover:text-foreground">
                Home
              </Link>
              <span className="mx-2">/</span>
              <Link
                to="/c/$slug"
                params={{ slug: product.category.slug }}
                className="hover:text-foreground"
              >
                {product.category.name}
              </Link>
              <span className="mx-2">/</span>
              <span className="text-foreground">{product.name}</span>
            </nav>

            <div className="grid gap-10 md:grid-cols-2">
              <div className="overflow-hidden rounded-3xl bg-muted">
                {product.image_url && (
                  <img
                    src={product.image_url}
                    alt={product.name}
                    className="aspect-square w-full object-cover"
                  />
                )}
              </div>

              <div className="flex flex-col">
                <Link
                  to="/v/$slug"
                  params={{ slug: product.vendor.slug }}
                  className="group inline-flex items-center gap-2 text-sm font-medium uppercase tracking-wide text-vendor"
                >
                  <span className="h-2 w-2 rounded-full bg-vendor" />
                  {product.vendor.name}
                  <span className="text-vendor/60 group-hover:text-vendor">›</span>
                </Link>
                <h1 className="mt-3 font-display text-4xl md:text-5xl">{product.name}</h1>
                {product.unit_label && (
                  <p className="mt-2 text-sm text-muted-foreground">{product.unit_label}</p>
                )}

                <p className="mt-6 font-display text-4xl font-semibold">
                  {formatPrice(itemPrice(product.price_cents))}
                </p>

                {product.description && (
                  <p className="mt-6 max-w-prose leading-relaxed text-foreground/85">
                    {product.description}
                  </p>
                )}

                {product.dietary_tags?.length > 0 && (
                  <div className="mt-5 flex flex-wrap gap-2">
                    {product.dietary_tags.map((t: string) => (
                      <span
                        key={t}
                        className="rounded-full bg-secondary px-3 py-1 text-xs font-medium capitalize text-secondary-foreground"
                      >
                        {t}
                      </span>
                    ))}
                  </div>
                )}

                <div className="mt-8 flex flex-wrap items-center gap-3">
                  <div className="inline-flex items-center rounded-full border border-input bg-card">
                    <button
                      onClick={() => setQty(Math.max(1, qty - 1))}
                      aria-label="Decrease quantity"
                      className="inline-flex h-11 w-11 items-center justify-center rounded-l-full hover:bg-muted"
                    >
                      <Minus className="h-4 w-4" />
                    </button>
                    <span className="w-8 text-center font-medium">{qty}</span>
                    <button
                      onClick={() => setQty(Math.min(99, qty + 1))}
                      aria-label="Increase quantity"
                      className="inline-flex h-11 w-11 items-center justify-center rounded-r-full hover:bg-muted"
                    >
                      <Plus className="h-4 w-4" />
                    </button>
                  </div>
                  <button
                    onClick={onAdd}
                    disabled={busy}
                    className="inline-flex h-11 items-center justify-center rounded-full bg-primary px-8 text-sm font-semibold text-primary-foreground transition-transform hover:scale-[1.02] active:scale-[0.98] disabled:opacity-60"
                  >
                    {busy ? "Adding…" : "Add to cart"}
                  </button>
                </div>

                <div className="mt-10 rounded-2xl border border-border/60 bg-card p-5">
                  <p className="text-sm font-semibold">From {product.vendor.name}</p>
                  <p className="mt-1 text-sm text-muted-foreground">{product.vendor.tagline}</p>
                  <p className="mt-3 inline-flex items-center gap-1 text-xs text-muted-foreground">
                    <MapPin className="h-3.5 w-3.5" />
                    {product.vendor.location}
                  </p>
                </div>
              </div>
            </div>

            {related && related.length > 0 && (
              <section className="mt-20">
                <h2 className="mb-6 font-display text-2xl md:text-3xl">Goes well with</h2>
                <div className="grid grid-cols-2 gap-4 sm:grid-cols-3 lg:grid-cols-4">
                  {related.map((p) => <ProductCard key={p.id} product={p as any} />)}
                </div>
              </section>
            )}
          </>
        )}
      </main>
      <SiteFooter />
    </div>
  );
}
