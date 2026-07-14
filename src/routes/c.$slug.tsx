import { createFileRoute, Link, notFound } from "@tanstack/react-router";
import { useQuery } from "@tanstack/react-query";
import { SiteHeader } from "@/components/site-header";
import { SiteFooter } from "@/components/site-footer";
import { ProductCard } from "@/components/product-card";

export const Route = createFileRoute("/c/$slug")({
  head: ({ params }) => ({
    meta: [
      { title: `${cap(params.slug)} — Harvest` },
      {
        name: "description",
        content: `Shop ${params.slug} from local vendors on Harvest. Fresh, seasonal, and delivered in one order.`,
      },
    ],
  }),
  component: CategoryPage,
  notFoundComponent: () => (
    <div className="flex min-h-screen flex-col">
      <SiteHeader />
      <div className="flex flex-1 items-center justify-center">
        <p>Category not found.</p>
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

function cap(s: string) {
  return s.charAt(0).toUpperCase() + s.slice(1);
}

function CategoryPage() {
  const { slug } = Route.useParams();
  const { data: category } = useQuery({
    queryKey: ["category", slug],
    queryFn: async () => {
      const { getCategoryBySlug } = await import("@/lib/products.server");
      const cat = getCategoryBySlug(slug);
      if (!cat) throw notFound();
      return cat;
    },
  });
  const { data: products } = useQuery({
    queryKey: ["products-by-category", slug],
    queryFn: async () => {
      const { getProductsByCategory } = await import("@/lib/products.server");
      return getProductsByCategory(slug);
    },
  });

  return (
    <div className="flex min-h-screen flex-col">
      <SiteHeader />
      <main className="mx-auto w-full max-w-7xl flex-1 px-4 py-10 md:px-6">
        <nav className="mb-4 text-sm text-muted-foreground">
          <Link to="/" className="hover:text-foreground">
            Home
          </Link>
          <span className="mx-2">/</span>
          <span className="text-foreground">{category?.name ?? cap(slug)}</span>
        </nav>
        <header className="mb-8 flex items-center gap-3">
          <span className="text-4xl">{category?.emoji}</span>
          <h1 className="font-display text-4xl md:text-5xl">{category?.name ?? cap(slug)}</h1>
        </header>

        {products && products.length === 0 && (
          <p className="text-muted-foreground">No products in this category yet.</p>
        )}
        <div className="grid grid-cols-2 gap-4 sm:grid-cols-3 lg:grid-cols-4">
          {products?.map((p) => <ProductCard key={p.id} product={p as any} />)}
        </div>
      </main>
      <SiteFooter />
    </div>
  );
}
