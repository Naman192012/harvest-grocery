import { createFileRoute } from "@tanstack/react-router";
import { useQuery } from "@tanstack/react-query";
import { SiteHeader } from "@/components/site-header";
import { SiteFooter } from "@/components/site-footer";
import { ProductCard } from "@/components/product-card";
import { z } from "zod";

const searchSchema = z.object({ q: z.string().optional() });

export const Route = createFileRoute("/search")({
  validateSearch: searchSchema,
  head: () => ({
    meta: [{ title: "Search — Harvest" }],
  }),
  component: SearchPage,
});

function SearchPage() {
  const { q } = Route.useSearch();
  const query = q?.trim() ?? "";

  const { data: results, isLoading } = useQuery({
    queryKey: ["search", query],
    queryFn: async () => {
      if (!query) return [];
      const { searchProducts } = await import("@/lib/products.server");
      return searchProducts(query);
    },
    enabled: query.length > 0,
  });

  return (
    <div className="flex min-h-screen flex-col">
      <SiteHeader />
      <main className="mx-auto w-full max-w-7xl flex-1 px-4 py-10 md:px-6">
        <h1 className="font-display text-3xl md:text-4xl">
          {query ? (
            <>
              Results for <span className="italic text-accent">"{query}"</span>
            </>
          ) : (
            "Search"
          )}
        </h1>
        {!query && (
          <p className="mt-3 text-muted-foreground">Type in the search bar above to find products.</p>
        )}
        {query && isLoading && <p className="mt-6 text-muted-foreground">Searching…</p>}
        {query && results && results.length === 0 && !isLoading && (
          <p className="mt-6 text-muted-foreground">
            Nothing matched "{query}". Try another word.
          </p>
        )}
        {results && results.length > 0 && (
          <div className="mt-8 grid grid-cols-2 gap-4 sm:grid-cols-3 lg:grid-cols-4">
            {results.map((p) => <ProductCard key={p.id} product={p as any} />)}
          </div>
        )}
      </main>
      <SiteFooter />
    </div>
  );
}
