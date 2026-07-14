import { createAPIFileRoute } from "@tanstack/react-start/api";
import { queryAll, queryOne } from "@/lib/db";

export const APIRoute = createAPIFileRoute("/api/products/category/$slug")({
  GET: async ({ params }) => {
    try {
      // Get category ID from slug
      const category = await queryOne(
        "SELECT id FROM public.categories WHERE slug = $1",
        [params.slug]
      );

      if (!category) {
        return new Response(JSON.stringify({ error: "Category not found" }), {
          status: 404,
          headers: { "Content-Type": "application/json" },
        });
      }

      // Get products in this category
      const products = await queryAll(
        `SELECT
          p.id, p.slug, p.name, p.price_cents, p.unit_label, p.image_url,
          v.id as vendor_id, v.slug as vendor_slug, v.name as vendor_name
        FROM public.products p
        JOIN public.vendors v ON p.vendor_id = v.id
        WHERE p.category_id = $1
        ORDER BY p.featured DESC, p.name ASC`,
        [category.id]
      );

      return new Response(JSON.stringify(products), {
        status: 200,
        headers: { "Content-Type": "application/json" },
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
