import { queryAll } from '@/lib/db';

export default defineEventHandler(async () => {
  try {
    const products = await queryAll(
      `SELECT
        p.id, p.slug, p.name, p.price_cents, p.unit_label, p.image_url,
        v.id as vendor_id, v.slug as vendor_slug, v.name as vendor_name
      FROM public.products p
      JOIN public.vendors v ON p.vendor_id = v.id
      WHERE p.featured = true
      ORDER BY p.created_at DESC
      LIMIT 8`
    );
    return products;
  } catch (error) {
    console.error('Error fetching featured products:', error);
    throw createError({
      statusCode: 500,
      statusMessage: 'Failed to fetch products',
    });
  }
});
