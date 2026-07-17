import { createAPIFileRoute } from "@tanstack/react-start/api";

export const APIRoute = createAPIFileRoute("/api/debug-env")({
  GET: async () => {
    const baseId = process.env.AIRTABLE_BASE_ID ?? "";
    const token = process.env.AIRTABLE_API_TOKEN ?? "";
    return new Response(
      JSON.stringify({
        baseIdLength: baseId.length,
        baseIdFirst3: baseId.slice(0, 3),
        baseIdLast3: baseId.slice(-3),
        baseIdHasQuote: baseId.includes('"'),
        baseIdHasWhitespace: /\s/.test(baseId),
        tokenLength: token.length,
        tokenFirst10: token.slice(0, 10),
        tokenLast4: token.slice(-4),
        tokenHasQuote: token.includes('"'),
        tokenHasWhitespace: /\s/.test(token),
      }),
      { status: 200, headers: { "Content-Type": "application/json" } }
    );
  },
});
