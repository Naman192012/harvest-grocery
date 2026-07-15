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
    { id: '1', slug: 'heirloom-tomatoes', name: 'Heirloom Tomatoes', description: 'A rainbow mix of Brandywine, Cherokee Purple, and Green Zebra. Picked at peak ripeness.', price_cents: 650, unit_label: '500g', image_url: 'https://upload.wikimedia.org/wikipedia/commons/thumb/0/02/Heirloom_tomatoes.jpg/960px-Heirloom_tomatoes.jpg', category: { slug: 'produce', name: 'Produce' }, vendor: { slug: 'green-acre-farm', name: 'Green Acre Farm' }, featured: true },
    { id: '2', slug: 'strawberries', name: 'Strawberries', description: 'Small, intensely sweet berries. Grown without pesticides.', price_cents: 599, unit_label: '1 pint', image_url: 'https://upload.wikimedia.org/wikipedia/commons/thumb/e/e1/Strawberries.jpg/960px-Strawberries.jpg', category: { slug: 'produce', name: 'Produce' }, vendor: { slug: 'green-acre-farm', name: 'Green Acre Farm' }, featured: true },
    { id: '3', slug: 'sourdough-loaf', name: 'Country Sourdough', description: 'A classic 800g boule with a crackling crust and open crumb. Made with our 50-year-old starter.', price_cents: 750, unit_label: '800g loaf', image_url: 'https://upload.wikimedia.org/wikipedia/commons/thumb/3/3b/Home_made_sour_dough_bread.jpg/960px-Home_made_sour_dough_bread.jpg', category: { slug: 'bakery', name: 'Bakery' }, vendor: { slug: 'rossis-bakery', name: "Rossi's Bakery" }, featured: true },
    { id: '4', slug: 'focaccia', name: 'Rosemary Focaccia', description: 'Olive-oil soaked focaccia with fresh rosemary and flaky salt.', price_cents: 850, unit_label: '400g', image_url: 'https://upload.wikimedia.org/wikipedia/commons/thumb/b/bf/Focaccia_with_Crumb.jpg/960px-Focaccia_with_Crumb.jpg', category: { slug: 'bakery', name: 'Bakery' }, vendor: { slug: 'rossis-bakery', name: "Rossi's Bakery" }, featured: true },
    { id: '5', slug: 'croissants', name: 'Butter Croissants', description: 'Laminated 27 times with French butter. Impossibly flaky.', price_cents: 1200, unit_label: '4 pack', image_url: 'https://upload.wikimedia.org/wikipedia/commons/thumb/2/2a/Croissant-Petr_Kratochvil.jpg/960px-Croissant-Petr_Kratochvil.jpg', category: { slug: 'bakery', name: 'Bakery' }, vendor: { slug: 'rossis-bakery', name: "Rossi's Bakery" }, featured: true },
    { id: '6', slug: 'king-salmon', name: 'Wild King Salmon', description: 'Line-caught Pacific king salmon fillet. Rich, buttery, and sustainable.', price_cents: 2450, unit_label: '400g', image_url: 'https://upload.wikimedia.org/wikipedia/commons/thumb/2/24/Raw_salmon_fillets.jpg/960px-Raw_salmon_fillets.jpg', category: { slug: 'meat', name: 'Meat & Seafood' }, vendor: { slug: 'blue-sea-fisheries', name: 'Blue Sea Fisheries' }, featured: true },
    { id: '7', slug: 'whole-milk', name: 'Organic Whole Milk', description: 'Non-homogenized cream-top whole milk in a returnable glass bottle.', price_cents: 675, unit_label: '1L', image_url: 'https://upload.wikimedia.org/wikipedia/commons/thumb/a/a5/Glass_of_Milk_%2833657535532%29.jpg/960px-Glass_of_Milk_%2833657535532%29.jpg', category: { slug: 'dairy', name: 'Dairy & Eggs' }, vendor: { slug: 'meadow-dairy-co', name: 'Meadow Dairy Co.' }, featured: true },
    { id: '8', slug: 'cultured-butter', name: 'Cultured Butter', description: 'Slow-cultured European-style butter with sea salt flakes.', price_cents: 899, unit_label: '250g', image_url: 'https://upload.wikimedia.org/wikipedia/commons/thumb/0/08/Homemade_butter.jpg/960px-Homemade_butter.jpg', category: { slug: 'dairy', name: 'Dairy & Eggs' }, vendor: { slug: 'meadow-dairy-co', name: 'Meadow Dairy Co.' }, featured: true },
    { id: '9', slug: 'fresh-eggs', name: 'Pasture-Raised Eggs', description: 'Golden yolks from hens roaming open pasture.', price_cents: 799, unit_label: '1 dozen', image_url: 'https://upload.wikimedia.org/wikipedia/commons/thumb/9/96/2020-05-05_19_27_12_An_open_carton_of_a_dozen_Large_Grade_A_Chicken_Eggs_from_Egg-land%27s_Best_in_the_Franklin_Farm_section_of_Oak_Hill%2C_Fairfax_County%2C_Virginia.jpg/960px-thumbnail.jpg', category: { slug: 'dairy', name: 'Dairy & Eggs' }, vendor: { slug: 'meadow-dairy-co', name: 'Meadow Dairy Co.' }, featured: true },
    { id: '10', slug: 'olive-oil', name: 'Extra Virgin Olive Oil', description: 'First cold-pressed Arbequina olives. Grassy and peppery.', price_cents: 1899, unit_label: '500ml', image_url: 'https://upload.wikimedia.org/wikipedia/commons/thumb/4/41/Olive_oil_bottle_Bertolli_Riserva_Premium.jpg/960px-Olive_oil_bottle_Bertolli_Riserva_Premium.jpg', category: { slug: 'pantry', name: 'Pantry' }, vendor: { slug: 'valle-verde-pantry', name: 'Valle Verde Pantry' }, featured: false },
    { id: '11', slug: 'kombucha', name: 'Ginger Kombucha', description: 'Small-batch fermented tea with fresh ginger.', price_cents: 450, unit_label: '355ml', image_url: 'https://upload.wikimedia.org/wikipedia/commons/4/48/Kombucha_Mature.jpg', category: { slug: 'beverages', name: 'Beverages' }, vendor: { slug: 'kettle-and-cane', name: 'Kettle & Cane' }, featured: true },
    { id: '12', slug: 'cold-brew', name: 'Cold Brew Coffee', description: '18-hour cold-brewed single-origin Ethiopian coffee.', price_cents: 525, unit_label: '473ml', image_url: 'https://upload.wikimedia.org/wikipedia/commons/thumb/1/1e/Iced_Coffee_in_Glass_-_Sunshine_Coffee_-_Laramie_Cafe_%2853838344552%29.jpg/960px-Iced_Coffee_in_Glass_-_Sunshine_Coffee_-_Laramie_Cafe_%2853838344552%29.jpg', category: { slug: 'beverages', name: 'Beverages' }, vendor: { slug: 'kettle-and-cane', name: 'Kettle & Cane' }, featured: true },
    { id: '13', slug: 'dark-chocolate', name: 'Dark Chocolate 72%', description: 'Single-origin Peruvian cacao. Notes of cherry and cocoa.', price_cents: 725, unit_label: '80g bar', image_url: 'https://upload.wikimedia.org/wikipedia/commons/thumb/c/cd/Green_and_Black%27s_dark_chocolate_bar_2.jpg/960px-Green_and_Black%27s_dark_chocolate_bar_2.jpg', category: { slug: 'snacks', name: 'Snacks' }, vendor: { slug: 'kettle-and-cane', name: 'Kettle & Cane' }, featured: true },
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
