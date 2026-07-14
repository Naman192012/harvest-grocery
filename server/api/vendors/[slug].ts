import { queryOne } from '@/lib/db';

export default defineEventHandler(async (event) => {
  const { slug } = getRouterParams(event);

  try {
    const vendor = await queryOne(
      "SELECT * FROM public.vendors WHERE slug = $1",
      [slug]
    );

    if (!vendor) {
      throw createError({
        statusCode: 404,
        statusMessage: 'Vendor not found',
      });
    }

    return vendor;
  } catch (error) {
    console.error('Error fetching vendor:', error);
    if (error instanceof Error && error.message.includes('404')) {
      throw error;
    }
    throw createError({
      statusCode: 500,
      statusMessage: 'Failed to fetch vendor',
    });
  }
});
