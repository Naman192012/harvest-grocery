// Direct Airtable REST calls for cart/order data (no caching — this is
// mutable, per-user, transactional data, unlike the read-heavy catalog
// client in src/integrations/airtable/client.ts).

const BASE_ID = process.env.AIRTABLE_BASE_ID!;
const API_TOKEN = process.env.AIRTABLE_API_TOKEN!;
const API_ROOT = `https://api.airtable.com/v0/${BASE_ID}`;

const CART_TABLE = "Cart Items";
const ORDERS_TABLE = "Orders";
const ORDER_ITEMS_TABLE = "Order Items";

async function airtableFetch(path: string, options: RequestInit = {}) {
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
    throw new Error(`Airtable API error ${res.status}: ${body}`);
  }
  return res.json();
}

function escapeFormulaString(value: string) {
  return value.replace(/'/g, "\\'");
}

// ---------------- Cart Items ----------------

export async function listCartItems(userEmail: string) {
  const formula = `{User Email} = '${escapeFormulaString(userEmail)}'`;
  const data = await airtableFetch(
    `${encodeURIComponent(CART_TABLE)}?filterByFormula=${encodeURIComponent(formula)}`
  );
  return data.records as { id: string; fields: Record<string, any> }[];
}

export async function findCartItem(userEmail: string, productId: string) {
  const formula = `AND({User Email} = '${escapeFormulaString(userEmail)}', {Product ID} = '${escapeFormulaString(productId)}')`;
  const data = await airtableFetch(
    `${encodeURIComponent(CART_TABLE)}?filterByFormula=${encodeURIComponent(formula)}`
  );
  return data.records[0] ?? null;
}

export async function createCartItem(fields: Record<string, any>) {
  return airtableFetch(encodeURIComponent(CART_TABLE), {
    method: "POST",
    body: JSON.stringify({ fields }),
  });
}

export async function updateCartItemFields(recordId: string, fields: Record<string, any>) {
  return airtableFetch(`${encodeURIComponent(CART_TABLE)}/${recordId}`, {
    method: "PATCH",
    body: JSON.stringify({ fields }),
  });
}

export async function deleteCartItem(recordId: string) {
  return airtableFetch(`${encodeURIComponent(CART_TABLE)}/${recordId}`, { method: "DELETE" });
}

export async function deleteCartItems(recordIds: string[]) {
  for (let i = 0; i < recordIds.length; i += 10) {
    const batch = recordIds.slice(i, i + 10);
    const qs = batch.map((id) => `records[]=${id}`).join("&");
    await airtableFetch(`${encodeURIComponent(CART_TABLE)}?${qs}`, { method: "DELETE" });
  }
}

// ---------------- Orders ----------------

export async function createOrder(fields: Record<string, any>) {
  return airtableFetch(encodeURIComponent(ORDERS_TABLE), {
    method: "POST",
    body: JSON.stringify({ fields }),
  });
}

export async function createOrderItems(items: { fields: Record<string, any> }[]) {
  const created: any[] = [];
  for (let i = 0; i < items.length; i += 10) {
    const batch = items.slice(i, i + 10);
    const data = await airtableFetch(encodeURIComponent(ORDER_ITEMS_TABLE), {
      method: "POST",
      body: JSON.stringify({ records: batch }),
    });
    created.push(...data.records);
  }
  return created;
}

export async function listOrders(userEmail: string) {
  const formula = `{Customer Email} = '${escapeFormulaString(userEmail)}'`;
  const data = await airtableFetch(
    `${encodeURIComponent(ORDERS_TABLE)}?filterByFormula=${encodeURIComponent(formula)}&sort%5B0%5D%5Bfield%5D=Order%20Date&sort%5B0%5D%5Bdirection%5D=desc`
  );
  return data.records as { id: string; fields: Record<string, any> }[];
}

export async function getOrder(recordId: string) {
  try {
    return await airtableFetch(`${encodeURIComponent(ORDERS_TABLE)}/${recordId}`);
  } catch {
    return null;
  }
}

export async function getOrderItemsByIds(recordIds: string[]) {
  if (recordIds.length === 0) return [];
  const formula = `OR(${recordIds.map((id) => `RECORD_ID()='${id}'`).join(",")})`;
  const data = await airtableFetch(
    `${encodeURIComponent(ORDER_ITEMS_TABLE)}?filterByFormula=${encodeURIComponent(formula)}`
  );
  return data.records as { id: string; fields: Record<string, any> }[];
}
