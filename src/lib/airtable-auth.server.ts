import { airtableFetch, escapeFormulaString, type AirtableRecord } from "@/lib/airtable-rest.server";

const USERS_TABLE = "Users";

export async function findUserByEmail(email: string): Promise<AirtableRecord | null> {
  const formula = `{Email} = '${escapeFormulaString(email)}'`;
  const data = await airtableFetch(
    `${encodeURIComponent(USERS_TABLE)}?filterByFormula=${encodeURIComponent(formula)}`
  );
  return data.records[0] ?? null;
}

export async function createUser(fields: Record<string, any>): Promise<AirtableRecord> {
  return airtableFetch(encodeURIComponent(USERS_TABLE), {
    method: "POST",
    body: JSON.stringify({ fields }),
  });
}

export async function updateUser(recordId: string, fields: Record<string, any>) {
  return airtableFetch(`${encodeURIComponent(USERS_TABLE)}/${recordId}`, {
    method: "PATCH",
    body: JSON.stringify({ fields }),
  });
}
