// Shared low-level Airtable REST helper for transactional (non-catalog)
// data — cart, orders, and accounts. Deliberately uncached, unlike the
// read-heavy catalog client in src/integrations/airtable/client.ts.

const BASE_ID = process.env.AIRTABLE_BASE_ID ?? "";
const API_TOKEN = process.env.AIRTABLE_API_TOKEN ?? "";
const API_ROOT = `https://api.airtable.com/v0/${BASE_ID}`;

function safeDiag() {
  const envKeys = Object.keys(process.env).filter((k) => k.toUpperCase().includes("AIRTABLE"));
  return `MARKER-7f3a91 baseIdRaw=${JSON.stringify(process.env.AIRTABLE_BASE_ID)} tokenPrefix=${JSON.stringify(process.env.AIRTABLE_API_TOKEN?.slice(0, 10))} matchingEnvKeys=${JSON.stringify(envKeys)} totalEnvKeyCount=${Object.keys(process.env).length}`;
}

export async function airtableFetch(path: string, options: RequestInit = {}) {
  const res = await fetch(`${API_ROOT}/${path}`, {
    ...options,
    headers: {
      Authorization: `Bearer ${API_TOKEN}`,
      "Content-Type": "application/json",
      ...(options.headers ?? {}),
    },
  });
  if (!res.ok) {
    const body = await res.text();
    throw new Error(`Airtable API error ${res.status}: ${body} | DIAG: ${safeDiag()}`);
  }
  return res.json();
}

export function escapeFormulaString(value: string) {
  return value.replace(/'/g, "\\'");
}

export type AirtableRecord = { id: string; fields: Record<string, any> };
