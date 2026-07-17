// Airtable-backed cart/order storage. See airtable-rest.server.ts for the
// shared low-level fetch helper (also used by airtable-auth.server.ts).

import { airtableFetch, escapeFormulaString } from "@/lib/airtable-rest.server";

const CART_TABLE = "Cart Items";
const ORDERS_TABLE = "Orders";
const ORDER_ITEMS_TABLE = "Order Items";

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
