import { createAPIFileRoute } from "@tanstack/react-start/api";
import { queryAll } from "@/lib/db";

export const APIRoute = createAPIFileRoute("/api/products/featured")({
  GET: async () => {
    try {
      const products = await queryAll(
        `SELECT
          p.id, p.slug, p.name, p.price_cents, p.unit_label, p.image_url,
          v.id as vendor_id, v.slug as vendor_slug, v.name as vendor_name
        FROM public.products p
        JOIN public.vendors v ON p.vendor_id = v.id
        WHERE p.featured = true
        ORDER BY p.created_at DESC
        LIMIT 8`
      );
      return new Response(JSON.stringify(products), {
        status: 200,
        headers: { "Content-Type": "application/json" },
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
