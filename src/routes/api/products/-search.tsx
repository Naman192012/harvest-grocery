import { createAPIFileRoute } from "@tanstack/react-start/api";
import { searchProducts } from "@/lib/products.server";

export const APIRoute = createAPIFileRoute("/api/products/search")({
  GET: async ({ request }) => {
    try {
      const url = new URL(request.url);
      const query = url.searchParams.get("q")?.trim() ?? "";

      if (!query) {
        return new Response(JSON.stringify([]), {
          status: 200,
          headers: { "Content-Type": "application/json" },
        });
      }

      const products = await searchProducts(query);

      return new Response(JSON.stringify(products), {
        status: 200,
        headers: {
          "Content-Type": "application/json",
          "X-Data-Source": "airtable",
        },
      });
    } catch (error) {
      console.error("Error searching products:", error);
      return new Response(JSON.stringify({ error: "Failed to search products" }), {
        status: 500,
        headers: { "Content-Type": "application/json" },
      });
    }
  },
});
