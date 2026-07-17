import { createServerFn } from "@tanstack/react-start";
import { z } from "zod";
import { attachSupabaseAuth } from "@/integrations/supabase/auth-attacher";
import { requireSupabaseAuth } from "@/integrations/supabase/auth-middleware";
import { getProductById } from "@/lib/products.server";
import {
  listCartItems,
  findCartItem,
  createCartItem,
  updateCartItemFields,
  deleteCartItem,
  deleteCartItems,
  createOrder,
  createOrderItems,
  listOrders,
  getOrder,
  getOrderItemsByIds,
} from "@/lib/airtable-cart.server";

function shapeCartRecord(record: { id: string; fields: Record<string, any> }) {
  const f = record.fields;
  return {
    id: record.id,
    quantity: f["Quantity"],
    product: {
      id: f["Product ID"],
      slug: f["Product Slug"],
      name: f["Product Name"],
      price_cents: f["Price Cents"],
      unit_label: f["Unit Label"] ?? null,
      image_url: f["Image URL"] ?? null,
      vendor: { slug: f["Vendor Slug"], name: f["Vendor Name"] },
    },
  };
}

export const getCart = createServerFn({ method: "GET" })
  .middleware([attachSupabaseAuth, requireSupabaseAuth])
  .handler(async ({ context }) => {
    const records = await listCartItems(context.userId);
    return records.map(shapeCartRecord);
  });

export const addToCart = createServerFn({ method: "POST" })
  .middleware([attachSupabaseAuth, requireSupabaseAuth])
  .inputValidator((d) =>
    z.object({ productId: z.string(), quantity: z.number().int().min(1).max(99) }).parse(d)
  )
  .handler(async ({ data, context }) => {
    const product = getProductById(data.productId);
    if (!product) throw new Error("Product not found");

    const existing = await findCartItem(context.userId, data.productId);

    if (existing) {
      const newQuantity = Math.min(99, existing.fields["Quantity"] + data.quantity);
      await updateCartItemFields(existing.id, { Quantity: newQuantity });
    } else {
      await createCartItem({
        "User Email": context.userId,
        "Product ID": product.id,
        "Product Slug": product.slug,
        "Product Name": product.name,
        "Price Cents": product.price_cents,
        "Unit Label": product.unit_label ?? "",
        "Image URL": product.image_url ?? "",
        "Vendor Slug": product.vendor.slug,
        "Vendor Name": product.vendor.name,
        Quantity: data.quantity,
      });
    }
    return { ok: true };
  });

export const updateCartItem = createServerFn({ method: "POST" })
  .middleware([attachSupabaseAuth, requireSupabaseAuth])
  .inputValidator((d) =>
    z.object({ itemId: z.string(), quantity: z.number().int().min(0).max(99) }).parse(d)
  )
  .handler(async ({ data }) => {
    if (data.quantity === 0) {
      await deleteCartItem(data.itemId);
    } else {
      await updateCartItemFields(data.itemId, { Quantity: data.quantity });
    }
    return { ok: true };
  });

export const placeOrder = createServerFn({ method: "POST" })
  .middleware([attachSupabaseAuth, requireSupabaseAuth])
  .inputValidator((d) =>
    z
      .object({
        deliveryAddress: z.string().min(5).max(500),
        deliverySlot: z.string().min(1).max(100),
      })
      .parse(d)
  )
  .handler(async ({ data, context }) => {
    const cartRecords = await listCartItems(context.userId);
    if (!cartRecords || cartRecords.length === 0) throw new Error("Cart is empty");

    const items = cartRecords.map((r) => r.fields);
    const total = items.reduce((sum, it) => sum + it["Quantity"] * it["Price Cents"], 0);
    const deliveryFee = 599;
    const grandTotal = total + deliveryFee;

    const order = await createOrder({
      "Customer Email": context.userId,
      "Customer Name": context.userId,
      "Order Date": new Date().toISOString(),
      Status: "Placed",
      "Total Amount": grandTotal,
      "Delivery Address": data.deliveryAddress,
      "Delivery Slot": data.deliverySlot,
    });

    await createOrderItems(
      items.map((it) => ({
        fields: {
          "Product Name": it["Product Name"],
          Quantity: it["Quantity"],
          Price: it["Price Cents"],
          "Total Line Value": it["Quantity"] * it["Price Cents"],
          SKU: it["Product Slug"],
          "Vendor Name": it["Vendor Name"],
          Order: [order.id],
        },
      }))
    );

    await deleteCartItems(cartRecords.map((r) => r.id));

    return { orderId: order.id };
  });

export const getOrders = createServerFn({ method: "GET" })
  .middleware([attachSupabaseAuth, requireSupabaseAuth])
  .handler(async ({ context }) => {
    const records = await listOrders(context.userId);
    return records.map((r) => ({
      id: r.id,
      total_cents: r.fields["Total Amount"],
      status: r.fields["Status"],
      created_at: r.fields["Order Date"],
      item_count: Array.isArray(r.fields["Order Items"]) ? r.fields["Order Items"].length : 0,
    }));
  });

export const getOrderById = createServerFn({ method: "GET" })
  .middleware([attachSupabaseAuth, requireSupabaseAuth])
  .inputValidator((d) => z.object({ orderId: z.string() }).parse(d))
  .handler(async ({ data, context }) => {
    const order = await getOrder(data.orderId);
    if (!order || order.fields["Customer Email"] !== context.userId) return null;

    const itemIds: string[] = Array.isArray(order.fields["Order Items"])
      ? order.fields["Order Items"]
      : [];
    const itemRecords = await getOrderItemsByIds(itemIds);

    return {
      id: order.id,
      total_cents: order.fields["Total Amount"],
      delivery_address: order.fields["Delivery Address"],
      delivery_slot: order.fields["Delivery Slot"],
      status: order.fields["Status"],
      created_at: order.fields["Order Date"],
      items: itemRecords.map((r) => ({
        id: r.id,
        product_name: r.fields["Product Name"],
        vendor_name: r.fields["Vendor Name"] ?? "Other",
        price_cents: r.fields["Price"],
        quantity: r.fields["Quantity"],
      })),
    };
  });
