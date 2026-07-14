import { createAPIFileRoute } from "@tanstack/react-start/api";
import { getAllVendors, getVendorBySlug } from "@/lib/products.server";

export const APIRoute = createAPIFileRoute("/api/vendors")({
  GET: async () => {
    try {
      const vendors = await getAllVendors();
      return new Response(JSON.stringify(vendors), {
        status: 200,
        headers: {
          "Content-Type": "application/json",
          "X-Data-Source": "airtable",
        },
      });
    } catch (error) {
      console.error("Error fetching vendors:", error);
      return new Response(JSON.stringify({ error: "Failed to fetch vendors" }), {
        status: 500,
        headers: { "Content-Type": "application/json" },
      });
    }
  },
});

export const APIRouteBySlug = createAPIFileRoute("/api/vendors/$slug")({
  GET: async ({ params }) => {
    try {
      const vendor = await getVendorBySlug(params.slug);
      if (!vendor) {
        return new Response(JSON.stringify({ error: "Vendor not found" }), {
          status: 404,
          headers: { "Content-Type": "application/json" },
        });
      }
      return new Response(JSON.stringify(vendor), {
        status: 200,
        headers: {
          "Content-Type": "application/json",
          "X-Data-Source": "airtable",
        },
      });
    } catch (error) {
      console.error("Error fetching vendor:", error);
      return new Response(JSON.stringify({ error: "Failed to fetch vendor" }), {
        status: 500,
        headers: { "Content-Type": "application/json" },
      });
    }
  },
});
