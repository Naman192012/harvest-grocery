import { createAPIFileRoute } from "@tanstack/react-start/api";
import { queryAll } from "@/lib/db";

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

      const searchTerm = `%${query}%`;
      const products = await queryAll(
        `SELECT
          p.id, p.slug, p.name, p.price_cents, p.unit_label, p.image_url, p.description,
          v.id as vendor_id, v.slug as vendor_slug, v.name as vendor_name
        FROM public.products p
        JOIN public.vendors v ON p.vendor_id = v.id
        WHERE p.name ILIKE $1 OR p.description ILIKE $1
        ORDER BY p.name ASC
        LIMIT 50`,
        [searchTerm]
      );

      return new Response(JSON.stringify(products), {
        status: 200,
        headers: { "Content-Type": "application/json" },
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
