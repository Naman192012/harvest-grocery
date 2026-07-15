import { createAPIFileRoute } from "@tanstack/react-start/api";
import { getProductBySlug } from "@/lib/products.server";

export const APIRoute = createAPIFileRoute("/api/products/slug/$slug")({
  GET: async ({ params }) => {
    const product = getProductBySlug(params.slug);

    if (!product) {
      return new Response(JSON.stringify({ error: "Product not found" }), {
        status: 404,
        headers: { "Content-Type": "application/json" },
      });
    }

    return new Response(JSON.stringify(product), {
      status: 200,
      headers: { "Content-Type": "application/json" },
    });
  },
});
