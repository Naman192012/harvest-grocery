// Shared low-level Airtable REST helper for transactional (non-catalog)
// data — cart, orders, and accounts. Deliberately uncached, unlike the
// read-heavy catalog client in src/integrations/airtable/client.ts.
//
// Env vars are read PER-REQUEST inside airtableFetch, never at module load.
// This app is served on Cloudflare Workers (Lovable's default Nitro target),
// where module initialization runs before any request context exists and
// process.env is still empty — a top-level read captures "" forever and every
// call 404s against https://api.airtable.com/v0//<table>.

function airtableConfig() {
  const baseId = process.env.AIRTABLE_BASE_ID ?? "";
  const apiToken = process.env.AIRTABLE_API_TOKEN ?? "";
  if (!baseId || !apiToken) {
    throw new Error(
      "Airtable is not configured: AIRTABLE_BASE_ID or AIRTABLE_API_TOKEN is missing at runtime.",
    );
  }
  return { baseId, apiToken };
}

export async function airtableFetch(path: string, options: RequestInit = {}) {
  const { baseId, apiToken } = airtableConfig();
  const res = await fetch(`https://api.airtable.com/v0/${baseId}/${path}`, {
    ...options,
    headers: {
      Authorization: `Bearer ${apiToken}`,
      "Content-Type": "application/json",
      ...(options.headers ?? {}),
    },
  });
  if (!res.ok) {
    const body = await res.text();
    throw new Error(`Airtable API error ${res.status}: ${body}`);
  }
  return res.json();
}

export function escapeFormulaString(value: string) {
  return value.replace(/'/g, "\\'");
}

export type AirtableRecord = { id: string; fields: Record<string, any> };
