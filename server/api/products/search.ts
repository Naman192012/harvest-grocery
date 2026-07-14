import { queryAll } from '@/lib/db';

export default defineEventHandler(async (event) => {
  const query = getQuery(event);
  const searchTerm = (query.q as string)?.trim() ?? '';

  if (!searchTerm) {
    return [];
  }

  try {
    const products = await queryAll(
      `SELECT
        p.id, p.slug, p.name, p.price_cents, p.unit_label, p.image_url, p.description,
        v.id as vendor_id, v.slug as vendor_slug, v.name as vendor_name
      FROM public.products p
      JOIN public.vendors v ON p.vendor_id = v.id
      WHERE p.name ILIKE $1 OR p.description ILIKE $1
      ORDER BY p.name ASC
      LIMIT 50`,
      [`%${searchTerm}%`]
    );

    return products;
  } catch (error) {
    console.error('Error searching products:', error);
    throw createError({
      statusCode: 500,
      statusMessage: 'Failed to search products',
    });
  }
});
