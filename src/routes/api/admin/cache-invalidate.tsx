import { createAPIFileRoute } from "@tanstack/react-start/api";
import { clearAirtableCache } from "@/lib/airtable-data.server";

export const APIRoute = createAPIFileRoute("/api/admin/cache-invalidate")({
  POST: async ({ request }) => {
    try {
      // In production, you'd add authentication here
      const url = new URL(request.url);
      const table = url.searchParams.get("table");

      if (table) {
        clearAirtableCache(table);
        return new Response(
          JSON.stringify({ message: `Cache cleared for ${table}` }),
          {
            status: 200,
            headers: { "Content-Type": "application/json" },
          }
        );
      }

      clearAirtableCache();
      return new Response(JSON.stringify({ message: "All cache cleared" }), {
        status: 200,
        headers: { "Content-Type": "application/json" },
      });
    } catch (error) {
      console.error("Error invalidating cache:", error);
      return new Response(
        JSON.stringify({ error: "Failed to invalidate cache" }),
        {
          status: 500,
          headers: { "Content-Type": "application/json" },
        }
      );
    }
  },
});
