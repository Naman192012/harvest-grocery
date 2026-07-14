import { queryAll } from '@/lib/db';

export default defineEventHandler(async () => {
  try {
    const vendors = await queryAll("SELECT * FROM public.vendors");
    return vendors;
  } catch (error) {
    console.error('Error fetching vendors:', error);
    throw createError({
      statusCode: 500,
      statusMessage: 'Failed to fetch vendors',
    });
  }
});
