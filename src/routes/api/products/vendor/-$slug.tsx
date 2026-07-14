import { createAPIFileRoute } from "@tanstack/react-start/api";
import { getVendorBySlug, getProductsByVendor } from "@/lib/products.server";

export const APIRoute = createAPIFileRoute("/api/products/vendor/$slug")({
  GET: async ({ params }) => {
    try {
      const vendor = await getVendorBySlug(params.slug);

      if (!vendor) {
        return new Response(JSON.stringify({ error: "Vendor not found" }), {
          status: 404,
          headers: { "Content-Type": "application/json" },
        });
      }

      const products = await getProductsByVendor(params.slug);

      return new Response(JSON.stringify(products), {
        status: 200,
        headers: {
          "Content-Type": "application/json",
          "X-Data-Source": "airtable",
        },
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
