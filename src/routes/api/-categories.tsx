import { createAPIFileRoute } from "@tanstack/react-start/api";
import { queryAll } from "@/lib/db";

export const APIRoute = createAPIFileRoute("/api/categories")({
  GET: async () => {
    try {
      const categories = await queryAll(
        "SELECT * FROM public.categories ORDER BY sort_order"
      );
      return new Response(JSON.stringify(categories), {
        status: 200,
        headers: { "Content-Type": "application/json" },
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
