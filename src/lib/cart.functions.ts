import { createServerFn } from "@tanstack/react-start";
import { z } from "zod";
import { requireSupabaseAuth } from "@/integrations/supabase/auth-middleware";
import { queryAll, queryOne, query } from "@/lib/db";

export const getCart = createServerFn({ method: "GET" })
  .middleware([requireSupabaseAuth])
  .handler(async ({ context }) => {
    const { userId } = context;
    const items = await queryAll(
      `SELECT
        ci.id, ci.quantity,
        p.id as product_id, p.slug, p.name, p.price_cents, p.unit_label, p.image_url,
        v.id as vendor_id, v.slug as vendor_slug, v.name as vendor_name
      FROM public.cart_items ci
      JOIN public.products p ON ci.product_id = p.id
      JOIN public.vendors v ON p.vendor_id = v.id
      WHERE ci.user_id = $1
      ORDER BY ci.created_at ASC`,
      [userId]
    );
    return items;
  });

export const addToCart = createServerFn({ method: "POST" })
  .middleware([requireSupabaseAuth])
  .inputValidator((d) =>
    z.object({ productId: z.string(), quantity: z.number().int().min(1).max(99) }).parse(d)
  )
  .handler(async ({ data, context }) => {
    const { userId } = context;
    const existing = await queryOne(
      "SELECT id, quantity FROM public.cart_items WHERE user_id = $1 AND product_id = $2",
      [userId, data.productId]
    );

    if (existing) {
      const newQuantity = Math.min(99, existing.quantity + data.quantity);
      await query(
        "UPDATE public.cart_items SET quantity = $1 WHERE id = $2",
        [newQuantity, existing.id]
      );
    } else {
      await query(
        "INSERT INTO public.cart_items (user_id, product_id, quantity) VALUES ($1, $2, $3)",
        [userId, data.productId, data.quantity]
      );
    }
    return { ok: true };
  });

export const updateCartItem = createServerFn({ method: "POST" })
  .middleware([requireSupabaseAuth])
  .inputValidator((d) =>
    z.object({ itemId: z.string().uuid(), quantity: z.number().int().min(0).max(99) }).parse(d)
  )
  .handler(async ({ data, context }) => {
    const { userId } = context;
    if (data.quantity === 0) {
      await query(
        "DELETE FROM public.cart_items WHERE id = $1 AND user_id = $2",
        [data.itemId, userId]
      );
    } else {
      await query(
        "UPDATE public.cart_items SET quantity = $1 WHERE id = $2 AND user_id = $3",
        [data.quantity, data.itemId, userId]
      );
    }
    return { ok: true };
  });

export const placeOrder = createServerFn({ method: "POST" })
  .middleware([requireSupabaseAuth])
  .inputValidator((d) =>
    z
      .object({
        deliveryAddress: z.string().min(5).max(500),
        deliverySlot: z.string().min(1).max(100),
      })
      .parse(d)
  )
  .handler(async ({ data, context }) => {
    const { userId } = context;

    const items = await queryAll(
      `SELECT
        ci.quantity,
        p.id as product_id, p.name as product_name, p.price_cents,
        v.id as vendor_id, v.name as vendor_name
      FROM public.cart_items ci
      JOIN public.products p ON ci.product_id = p.id
      JOIN public.vendors v ON p.vendor_id = v.id
      WHERE ci.user_id = $1`,
      [userId]
    );

    if (!items || items.length === 0) throw new Error("Cart is empty");

    const total = items.reduce((sum, it) => sum + it.quantity * it.price_cents, 0);
    const deliveryFee = 599;
    const grandTotal = total + deliveryFee;

    const orderResult = await queryOne(
      `INSERT INTO public.orders (user_id, total_cents, delivery_address, delivery_slot, status)
       VALUES ($1, $2, $3, $4, 'confirmed')
       RETURNING id`,
      [userId, grandTotal, data.deliveryAddress, data.deliverySlot]
    );

    if (!orderResult) throw new Error("Failed to create order");

    const orderItems = items.map((it) => [
      orderResult.id,
      it.product_id,
      it.vendor_id,
      it.product_name,
      it.vendor_name,
      it.price_cents,
      it.quantity,
    ]);

    for (const item of orderItems) {
      await query(
        `INSERT INTO public.order_items (order_id, product_id, vendor_id, product_name, vendor_name, price_cents, quantity)
         VALUES ($1, $2, $3, $4, $5, $6, $7)`,
        item
      );
    }

    await query("DELETE FROM public.cart_items WHERE user_id = $1", [userId]);

    return { orderId: orderResult.id };
  });
