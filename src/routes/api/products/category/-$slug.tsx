import { createAPIFileRoute } from "@tanstack/react-start/api";
import { getCategoryBySlug, getProductsByCategory } from "@/lib/products.server";

export const APIRoute = createAPIFileRoute("/api/products/category/$slug")({
  GET: async ({ params }) => {
    try {
      const category = await getCategoryBySlug(params.slug);

      if (!category) {
        return new Response(JSON.stringify({ error: "Category not found" }), {
          status: 404,
          headers: { "Content-Type": "application/json" },
        });
      }

      const products = await getProductsByCategory(params.slug);

      return new Response(JSON.stringify(products), {
        status: 200,
        headers: {
          "Content-Type": "application/json",
          "X-Data-Source": "airtable",
        },
      });
    } catch (error) {
      console.error("Error fetching products by category:", error);
      return new Response(JSON.stringify({ error: "Failed to fetch products" }), {
        status: 500,
        headers: { "Content-Type": "application/json" },
      });
    }
  },
});
