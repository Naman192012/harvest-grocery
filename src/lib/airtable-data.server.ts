import { AirtableClient } from '@/integrations/airtable/client';
import {
  AirtableProduct,
  AirtableVendor,
  AirtableCategory,
  AirtableProductFields,
  AirtableVendorFields,
  AirtableCategoryFields,
} from '@/integrations/airtable/types';
import {
  transformAirtableProduct,
  transformAirtableVendor,
  transformAirtableCategory,
  setVendorMap,
  setCategoryMap,
} from './airtable-transform';
import { queryAll } from './db';

let airtableClient: AirtableClient | null = null;

function getAirtableClient(): AirtableClient {
  if (!airtableClient) {
    const baseId = process.env.AIRTABLE_BASE_ID;
    const apiToken = process.env.AIRTABLE_API_TOKEN;

    if (!baseId || !apiToken) {
      throw new Error('Missing Airtable configuration: AIRTABLE_BASE_ID or AIRTABLE_API_TOKEN');
    }

    airtableClient = new AirtableClient({
      baseId,
      apiToken,
      timeoutMs: parseInt(process.env.AIRTABLE_TIMEOUT_MS ?? '10000', 10),
      maxRetries: parseInt(process.env.AIRTABLE_MAX_RETRIES ?? '3', 10),
      cacheTTL: parseInt(process.env.AIRTABLE_CACHE_TTL_SECONDS ?? '300', 10),
    });
  }

  return airtableClient;
}

async function fallbackGetProducts() {
  try {
    console.log('[Airtable] Using PostgreSQL fallback for products');
    const rows = await queryAll('SELECT * FROM products ORDER BY name');
    return rows || [];
  } catch (err) {
    console.error('[Airtable] Fallback query failed:', err);
    return [];
  }
}

async function fallbackGetVendors() {
  try {
    console.log('[Airtable] Using PostgreSQL fallback for vendors');
    const rows = await queryAll('SELECT * FROM vendors ORDER BY name');
    return rows || [];
  } catch (err) {
    console.error('[Airtable] Fallback query failed:', err);
    return [];
  }
}

async function fallbackGetCategories() {
  try {
    console.log('[Airtable] Using PostgreSQL fallback for categories');
    const rows = await queryAll('SELECT * FROM categories ORDER BY name');
    return rows || [];
  } catch (err) {
    console.error('[Airtable] Fallback query failed:', err);
    return [];
  }
}

export async function getAirtableProducts() {
  try {
    const client = getAirtableClient();

    // Initialize vendor and category maps for linked record resolution
    const vendors = await getAirtableVendors();
    const categories = await getAirtableCategories();
    setVendorMap(vendors);
    setCategoryMap(categories);

    const tableName = process.env.AIRTABLE_PRODUCTS_TABLE_NAME || 'Products';
    const records = await client.fetchRecords<AirtableProductFields>(tableName);
    return records.map(transformAirtableProduct).filter(Boolean);
  } catch (err) {
    console.warn('[Airtable] Failed to fetch products from Airtable:', err);

    if (process.env.AIRTABLE_FALLBACK_ENABLED === 'true') {
      return fallbackGetProducts();
    }

    throw err;
  }
}

export async function getAirtableVendors() {
  try {
    const client = getAirtableClient();
    const tableName = process.env.AIRTABLE_VENDORS_TABLE_NAME || 'Vendors';
    const records = await client.fetchRecords<AirtableVendorFields>(tableName);
    return records.map(transformAirtableVendor).filter(Boolean);
  } catch (err) {
    console.warn('[Airtable] Failed to fetch vendors from Airtable:', err);

    if (process.env.AIRTABLE_FALLBACK_ENABLED === 'true') {
      return fallbackGetVendors();
    }

    throw err;
  }
}

export async function getAirtableCategories() {
  try {
    const client = getAirtableClient();
    const tableName = process.env.AIRTABLE_CATEGORIES_TABLE_NAME || 'Categories';
    const records = await client.fetchRecords<AirtableCategoryFields>(tableName);
    return records.map(transformAirtableCategory).filter(Boolean);
  } catch (err) {
    console.warn('[Airtable] Failed to fetch categories from Airtable:', err);

    if (process.env.AIRTABLE_FALLBACK_ENABLED === 'true') {
      return fallbackGetCategories();
    }

    throw err;
  }
}

export async function getAirtableProductsByCategory(categorySlug: string) {
  try {
    const products = await getAirtableProducts();
    return products.filter((p) => p.category?.slug === categorySlug);
  } catch (err) {
    console.warn('[Airtable] Failed to filter products by category:', err);

    if (process.env.AIRTABLE_FALLBACK_ENABLED === 'true') {
      try {
        const rows = await queryAll(
          'SELECT * FROM products WHERE category_slug = ? ORDER BY name',
          [categorySlug]
        );
        return rows || [];
      } catch (fallbackErr) {
        console.error('[Airtable] Fallback category filter failed:', fallbackErr);
        return [];
      }
    }

    throw err;
  }
}

export async function getAirtableProductBySlug(slug: string) {
  try {
    const products = await getAirtableProducts();
    return products.find((p) => p.slug === slug) || null;
  } catch (err) {
    console.warn('[Airtable] Failed to get product by slug:', err);

    if (process.env.AIRTABLE_FALLBACK_ENABLED === 'true') {
      try {
        const rows = await queryAll('SELECT * FROM products WHERE slug = ?', [slug]);
        return rows?.[0] || null;
      } catch (fallbackErr) {
        console.error('[Airtable] Fallback slug lookup failed:', fallbackErr);
        return null;
      }
    }

    throw err;
  }
}

export async function getAirtableVendorBySlug(slug: string) {
  try {
    const vendors = await getAirtableVendors();
    return vendors.find((v) => v.slug === slug) || null;
  } catch (err) {
    console.warn('[Airtable] Failed to get vendor by slug:', err);

    if (process.env.AIRTABLE_FALLBACK_ENABLED === 'true') {
      try {
        const rows = await queryAll('SELECT * FROM vendors WHERE slug = ?', [slug]);
        return rows?.[0] || null;
      } catch (fallbackErr) {
        console.error('[Airtable] Fallback vendor lookup failed:', fallbackErr);
        return null;
      }
    }

    throw err;
  }
}

export async function searchAirtableProducts(query: string) {
  try {
    const products = await getAirtableProducts();
    const lowerQuery = query.toLowerCase();
    return products.filter(
      (p) =>
        p.name?.toLowerCase().includes(lowerQuery) ||
        p.description?.toLowerCase().includes(lowerQuery) ||
        p.vendor?.name?.toLowerCase().includes(lowerQuery)
    );
  } catch (err) {
    console.warn('[Airtable] Failed to search products:', err);

    if (process.env.AIRTABLE_FALLBACK_ENABLED === 'true') {
      try {
        const rows = await queryAll(
          `SELECT * FROM products WHERE name ILIKE ? OR description ILIKE ? ORDER BY name`,
          [`%${query}%`, `%${query}%`]
        );
        return rows || [];
      } catch (fallbackErr) {
        console.error('[Airtable] Fallback search failed:', fallbackErr);
        return [];
      }
    }

    throw err;
  }
}

export async function getAirtableFeaturedProducts() {
  try {
    const products = await getAirtableProducts();
    return products.filter((p) => p.featured);
  } catch (err) {
    console.warn('[Airtable] Failed to get featured products:', err);

    if (process.env.AIRTABLE_FALLBACK_ENABLED === 'true') {
      try {
        const rows = await queryAll('SELECT * FROM products WHERE featured = true ORDER BY name');
        return rows || [];
      } catch (fallbackErr) {
        console.error('[Airtable] Fallback featured fetch failed:', fallbackErr);
        return [];
      }
    }

    throw err;
  }
}

export function clearAirtableCache(table?: string) {
  try {
    const client = getAirtableClient();
    client.clearCache(table);
  } catch (err) {
    console.warn('[Airtable] Failed to clear cache:', err);
  }
}
