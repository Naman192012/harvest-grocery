import { createAPIFileRoute } from "@tanstack/react-start/api";
import { getCategories } from "@/lib/products.server";

export const APIRoute = createAPIFileRoute("/api/categories")({
  GET: async () => {
    try {
      const categories = await getCategories();
      return new Response(JSON.stringify(categories), {
        status: 200,
        headers: {
          "Content-Type": "application/json",
          "X-Data-Source": "airtable",
        },
      });
    } catch (error) {
      console.error("Error fetching categories:", error);
      return new Response(JSON.stringify({ error: "Failed to fetch categories" }), {
        status: 500,
        headers: { "Content-Type": "application/json" },
      });
    }
  },
});
