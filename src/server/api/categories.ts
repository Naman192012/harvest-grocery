import { queryAll } from '@/lib/db';

export default defineEventHandler(async () => {
  try {
    const categories = await queryAll(
      "SELECT * FROM public.categories ORDER BY sort_order"
    );
    return categories;
  } catch (error) {
    console.error('Error fetching categories:', error);
    throw createError({
      statusCode: 500,
      statusMessage: 'Failed to fetch categories',
    });
  }
});
