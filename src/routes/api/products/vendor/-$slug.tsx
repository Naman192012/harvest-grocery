import { createAPIFileRoute } from "@tanstack/react-start/api";
import { queryAll, queryOne } from "@/lib/db";

export const APIRoute = createAPIFileRoute("/api/products/vendor/$slug")({
  GET: async ({ params }) => {
    try {
      // Get vendor ID from slug
      const vendor = await queryOne(
        "SELECT id FROM public.vendors WHERE slug = $1",
        [params.slug]
      );

      if (!vendor) {
        return new Response(JSON.stringify({ error: "Vendor not found" }), {
          status: 404,
          headers: { "Content-Type": "application/json" },
        });
      }

      // Get products from this vendor
      const products = await queryAll(
        `SELECT
          p.id, p.slug, p.name, p.price_cents, p.unit_label, p.image_url,
          v.id as vendor_id, v.slug as vendor_slug, v.name as vendor_name
        FROM public.products p
        JOIN public.vendors v ON p.vendor_id = v.id
        WHERE p.vendor_id = $1
        ORDER BY p.featured DESC, p.name ASC`,
        [vendor.id]
      );

      return new Response(JSON.stringify(products), {
        status: 200,
        headers: { "Content-Type": "application/json" },
      });
    } catch (error) {
      console.error("Error fetching products by vendor:", error);
      return new Response(JSON.stringify({ error: "Failed to fetch products" }), {
        status: 500,
        headers: { "Content-Type": "application/json" },
      });
    }
  },
});
