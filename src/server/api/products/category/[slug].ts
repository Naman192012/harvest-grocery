import { queryAll, queryOne } from '@/lib/db';

export default defineEventHandler(async (event) => {
  const { slug } = getRouterParams(event);

  try {
    const category = await queryOne(
      "SELECT id FROM public.categories WHERE slug = $1",
      [slug]
    );

    if (!category) {
      throw createError({
        statusCode: 404,
        statusMessage: 'Category not found',
      });
    }

    const products = await queryAll(
      `SELECT
        p.id, p.slug, p.name, p.price_cents, p.unit_label, p.image_url,
        v.id as vendor_id, v.slug as vendor_slug, v.name as vendor_name
      FROM public.products p
      JOIN public.vendors v ON p.vendor_id = v.id
      WHERE p.category_id = $1
      ORDER BY p.featured DESC, p.name ASC`,
      [category.id]
    );

    return products;
  } catch (error) {
    console.error('Error fetching products by category:', error);
    throw createError({
      statusCode: 500,
      statusMessage: 'Failed to fetch products',
    });
  }
});
