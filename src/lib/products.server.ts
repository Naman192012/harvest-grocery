import {
  getAirtableProducts,
  getAirtableVendors,
  getAirtableCategories,
  getAirtableProductsByCategory,
  getAirtableProductBySlug,
  getAirtableVendorBySlug,
  searchAirtableProducts,
  getAirtableFeaturedProducts,
} from './airtable-data.server';
import { setVendorMap, setCategoryMap } from './airtable-transform';

export async function getCategories() {
  return getAirtableCategories();
}

export async function getCategoryBySlug(slug: string) {
  const categories = await getAirtableCategories();
  return categories.find((c) => c.slug === slug) ?? null;
}

export async function getFeaturedProducts() {
  const products = await getAirtableFeaturedProducts();
  return products.slice(0, 8);
}

export async function getProductsByCategory(slug: string) {
  const products = await getAirtableProductsByCategory(slug);
  return products.sort(
    (a, b) => Number(b.featured) - Number(a.featured) || a.name.localeCompare(b.name)
  );
}

export async function searchProducts(q: string) {
  const term = q.trim().toLowerCase();
  if (!term) return [];
  return searchAirtableProducts(q);
}

export async function getAllVendors() {
  return getAirtableVendors();
}

export async function getVendorBySlug(slug: string) {
  return getAirtableVendorBySlug(slug);
}

export async function getProductsByVendor(slug: string) {
  const products = await getAirtableProducts();
  return products.filter((p) => p.vendor?.slug === slug);
}

export async function getProductBySlug(slug: string) {
  const product = await getAirtableProductBySlug(slug);
  if (!product) return null;

  return {
    id: product.id,
    slug: product.slug,
    name: product.name,
    description: product.description,
    price_cents: product.price_cents,
    unit_label: product.unit_label,
    image_url: product.image_url,
    category_id: product.category?.slug,
    dietary_tags: product.dietary_tags || [],
    vendor: {
      id: product.vendor?.slug || 'unknown',
      slug: product.vendor?.slug || 'unknown',
      name: product.vendor?.name || 'Unknown Vendor',
      tagline: product.vendor?.name || '',
      location: '',
    },
    category: product.category
      ? { slug: product.category.slug, name: product.category.name }
      : { slug: 'uncategorized', name: 'Uncategorized' },
  };
}

export async function getRelatedProducts(categorySlug: string, excludeSlug: string) {
  const products = await getAirtableProductsByCategory(categorySlug);
  return products
    .filter((p) => p.slug !== excludeSlug)
    .slice(0, 4);
}
