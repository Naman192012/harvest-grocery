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
    console.error('[Airtable] PostgreSQL fallback failed, using hardcoded data:', err);
    // Return hardcoded products as last resort
    return getHardcodedProducts();
  }
}

function getHardcodedProducts() {
  return [
    { id: '1', slug: 'heirloom-tomatoes', name: 'Heirloom Tomatoes', description: 'A rainbow mix of Brandywine, Cherokee Purple, and Green Zebra. Picked at peak ripeness.', price_cents: 650, unit_label: '500g', category: { slug: 'produce', name: 'Produce' }, vendor: { slug: 'green-acre-farm', name: 'Green Acre Farm' }, featured: true },
    { id: '2', slug: 'strawberries', name: 'Strawberries', description: 'Small, intensely sweet berries. Grown without pesticides.', price_cents: 599, unit_label: '1 pint', category: { slug: 'produce', name: 'Produce' }, vendor: { slug: 'green-acre-farm', name: 'Green Acre Farm' }, featured: true },
    { id: '3', slug: 'sourdough-loaf', name: 'Country Sourdough', description: 'A classic 800g boule with a crackling crust and open crumb. Made with our 50-year-old starter.', price_cents: 750, unit_label: '800g loaf', category: { slug: 'bakery', name: 'Bakery' }, vendor: { slug: 'rossis-bakery', name: "Rossi's Bakery" }, featured: true },
    { id: '4', slug: 'focaccia', name: 'Rosemary Focaccia', description: 'Olive-oil soaked focaccia with fresh rosemary and flaky salt.', price_cents: 850, unit_label: '400g', category: { slug: 'bakery', name: 'Bakery' }, vendor: { slug: 'rossis-bakery', name: "Rossi's Bakery" }, featured: true },
    { id: '5', slug: 'king-salmon', name: 'Wild King Salmon', description: 'Line-caught Pacific king salmon fillet. Rich, buttery, and sustainable.', price_cents: 2450, unit_label: '400g', category: { slug: 'meat', name: 'Meat & Seafood' }, vendor: { slug: 'blue-sea-fisheries', name: 'Blue Sea Fisheries' }, featured: true },
    { id: '6', slug: 'whole-milk', name: 'Organic Whole Milk', description: 'Non-homogenized cream-top whole milk in a returnable glass bottle.', price_cents: 675, unit_label: '1L', category: { slug: 'dairy', name: 'Dairy & Eggs' }, vendor: { slug: 'meadow-dairy-co', name: 'Meadow Dairy Co.' }, featured: true },
    { id: '7', slug: 'cultured-butter', name: 'Cultured Butter', description: 'Slow-cultured European-style butter with sea salt flakes.', price_cents: 899, unit_label: '250g', category: { slug: 'dairy', name: 'Dairy & Eggs' }, vendor: { slug: 'meadow-dairy-co', name: 'Meadow Dairy Co.' }, featured: true },
    { id: '8', slug: 'fresh-eggs', name: 'Pasture-Raised Eggs', description: 'Golden yolks from hens roaming open pasture.', price_cents: 799, unit_label: '1 dozen', category: { slug: 'dairy', name: 'Dairy & Eggs' }, vendor: { slug: 'meadow-dairy-co', name: 'Meadow Dairy Co.' }, featured: true },
  ];
}

async function fallbackGetVendors() {
  try {
    console.log('[Airtable] Using PostgreSQL fallback for vendors');
    const rows = await queryAll('SELECT * FROM vendors ORDER BY name');
    return rows || [];
  } catch (err) {
    console.error('[Airtable] PostgreSQL fallback failed, using hardcoded data:', err);
    return getHardcodedVendors();
  }
}

function getHardcodedVendors() {
  return [
    { id: '1', slug: 'green-acre-farm', name: 'Green Acre Farm', tagline: 'Organic produce, picked yesterday', location: 'Sonoma County, CA' },
    { id: '2', slug: 'rossis-bakery', name: "Rossi's Bakery", tagline: 'Sourdough since 1974', location: 'North Beach, SF' },
    { id: '3', slug: 'blue-sea-fisheries', name: 'Blue Sea Fisheries', tagline: 'Wild-caught, day-boat fresh', location: 'Half Moon Bay, CA' },
    { id: '4', slug: 'meadow-dairy-co', name: 'Meadow Dairy Co.', tagline: 'Milk from happy cows', location: 'Nevada City, CA' },
    { id: '5', slug: 'valle-verde-pantry', name: 'Valle Verde Pantry', tagline: 'Slow-cooked, small-batch', location: 'Berkeley, CA' },
    { id: '6', slug: 'kettle-and-cane', name: 'Kettle & Cane', tagline: 'Craft snacks & drinks', location: 'Oakland, CA' },
    { id: '7', slug: 'frost-and-field', name: 'Frost & Field', tagline: 'Freshly frozen at the peak', location: 'Portland, OR' },
  ];
}

async function fallbackGetCategories() {
  try {
    console.log('[Airtable] Using PostgreSQL fallback for categories');
    const rows = await queryAll('SELECT * FROM categories ORDER BY name');
    return rows || [];
  } catch (err) {
    console.error('[Airtable] PostgreSQL fallback failed, using hardcoded data:', err);
    return getHardcodedCategories();
  }
}

function getHardcodedCategories() {
  return [
    { id: '1', slug: 'produce', name: 'Produce', emoji: '🥦' },
    { id: '2', slug: 'dairy', name: 'Dairy & Eggs', emoji: '🥛' },
    { id: '3', slug: 'bakery', name: 'Bakery', emoji: '🍞' },
    { id: '4', slug: 'meat', name: 'Meat & Seafood', emoji: '🥩' },
    { id: '5', slug: 'pantry', name: 'Pantry', emoji: '🥫' },
    { id: '6', slug: 'beverages', name: 'Beverages', emoji: '🥤' },
    { id: '7', slug: 'snacks', name: 'Snacks', emoji: '🍫' },
    { id: '8', slug: 'frozen', name: 'Frozen', emoji: '🧊' },
  ];
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

export async function getAirtableProductsByVendor(vendorSlug: string) {
  try {
    const products = await getAirtableProducts();
    return products.filter((p) => p.vendor?.slug === vendorSlug);
  } catch (err) {
    console.warn('[Airtable] Failed to filter products by vendor:', err);

    if (process.env.AIRTABLE_FALLBACK_ENABLED === 'true') {
      try {
        const rows = await queryAll(
          'SELECT * FROM products WHERE vendor_slug = ? ORDER BY name',
          [vendorSlug]
        );
        return rows || [];
      } catch (fallbackErr) {
        console.error('[Airtable] Fallback vendor filter failed:', fallbackErr);
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
