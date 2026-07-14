import { queryAll, queryOne } from '@/lib/db';

export default defineEventHandler(async (event) => {
  const { slug } = getRouterParams(event);

  try {
    const vendor = await queryOne(
      "SELECT id FROM public.vendors WHERE slug = $1",
      [slug]
    );

    if (!vendor) {
      throw createError({
        statusCode: 404,
        statusMessage: 'Vendor not found',
      });
    }

    const products = await queryAll(
      `SELECT
        p.id, p.slug, p.name, p.price_cents, p.unit_label, p.image_url,
        v.id as vendor_id, v.slug as vendor_slug, v.name as vendor_name
      FROM public.products p
      JOIN public.vendors v ON p.vendor_id = v.id
      WHERE p.vendor_id = $1
      ORDER BY p.featured DESC, p.name ASC`,
      [vendor.id]
    );

    return products;
  } catch (error) {
    console.error('Error fetching products by vendor:', error);
    throw createError({
      statusCode: 500,
      statusMessage: 'Failed to fetch products',
    });
  }
});
