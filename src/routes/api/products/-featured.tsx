import { createAPIFileRoute } from "@tanstack/react-start/api";
import { getFeaturedProducts } from "@/lib/products.server";

export const APIRoute = createAPIFileRoute("/api/products/featured")({
  GET: async () => {
    try {
      const products = await getFeaturedProducts();
      return new Response(JSON.stringify(products), {
        status: 200,
        headers: {
          "Content-Type": "application/json",
          "X-Data-Source": "airtable",
        },
      });
    } catch (error) {
      console.error("Error fetching featured products:", error);
      return new Response(JSON.stringify({ error: "Failed to fetch products" }), {
        status: 500,
        headers: { "Content-Type": "application/json" },
      });
    }
  },
});
