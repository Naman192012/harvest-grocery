import { AirtableRecord, AirtableProductFields, AirtableVendorFields, AirtableCategoryFields } from '@/integrations/airtable/types';
import { getImageUrl } from './product-images';

export interface TransformedProduct {
  id: string;
  slug: string;
  name: string;
  description?: string;
  price_cents: number;
  unit_label?: string;
  image_url?: string;
  featured?: boolean;
  category?: { slug: string; name: string };
  vendor?: { slug: string; name: string };
  dietary_tags?: string[];
}

export interface TransformedVendor {
  id: string;
  slug: string;
  name: string;
  tagline?: string;
  description?: string;
  location?: string;
  image_url?: string;
  hero_color?: string;
}

export interface TransformedCategory {
  id: string;
  slug: string;
  name: string;
  description?: string;
  icon?: string;
  emoji?: string;
  sort_order?: number;
}

// Maps of linked record IDs to their slugs (populated during transform)
let vendorIdMap: Record<string, { slug: string; name: string }> = {};
let categoryIdMap: Record<string, { slug: string; name: string }> = {};

export function setVendorMap(vendors: TransformedVendor[]) {
  vendorIdMap = {};
  vendors.forEach((v) => {
    vendorIdMap[v.id] = { slug: v.slug, name: v.name };
  });
}

export function setCategoryMap(categories: TransformedCategory[]) {
  categoryIdMap = {};
  categories.forEach((c) => {
    categoryIdMap[c.id] = { slug: c.slug, name: c.name };
  });
}

export function transformAirtableVendor(
  record: AirtableRecord<AirtableVendorFields>
): TransformedVendor | null {
  try {
    const fields = record.fields;

    if (!fields.name) {
      console.warn('[Airtable] Vendor record missing name:', record.id);
      return null;
    }

    return {
      id: record.id,
      slug: fields.slug || slugify(fields.name),
      name: fields.name,
      tagline: fields.tagline,
      description: fields.tagline, // Use tagline as description
      location: fields.location,
      image_url: fields.image_url ? validateImageUrl(fields.image_url) : undefined,
      hero_color: fields.hero_color || '#6B7280', // Default gray
    };
  } catch (err) {
    console.error('[Airtable] Error transforming vendor:', err);
    return null;
  }
}

export function transformAirtableCategory(
  record: AirtableRecord<AirtableCategoryFields>
): TransformedCategory | null {
  try {
    const fields = record.fields;

    if (!fields.name) {
      console.warn('[Airtable] Category record missing name:', record.id);
      return null;
    }

    return {
      id: record.id,
      slug: fields.slug || slugify(fields.name),
      name: fields.name,
      description: fields.description,
      icon: fields.icon,
      emoji: fields.icon, // Use icon field as emoji
      sort_order: 0,
    };
  } catch (err) {
    console.error('[Airtable] Error transforming category:', err);
    return null;
  }
}

export function transformAirtableProduct(
  record: AirtableRecord<AirtableProductFields>
): TransformedProduct | null {
  try {
    const fields = record.fields;

    if (!fields.name || fields.price_cents === undefined) {
      console.warn('[Airtable] Product record missing name or price:', record.id);
      return null;
    }

    // Resolve vendor reference
    let vendor: { slug: string; name: string } | undefined;
    if (fields.vendor && fields.vendor.length > 0) {
      vendor = vendorIdMap[fields.vendor[0]];
      if (!vendor) {
        console.warn(`[Airtable] Vendor ${fields.vendor[0]} not found in map`);
      }
    }

    // Resolve category reference
    let category: { slug: string; name: string } | undefined;
    if (fields.category && fields.category.length > 0) {
      category = categoryIdMap[fields.category[0]];
      if (!category) {
        console.warn(`[Airtable] Category ${fields.category[0]} not found in map`);
      }
    }

    const slug = fields.slug || slugify(fields.name);
    const imageUrl = fields.image_url ? validateImageUrl(fields.image_url) : getImageUrl(slug);

    return {
      id: slug,
      slug,
      name: fields.name,
      description: fields.description,
      price_cents: Math.round(fields.price_cents),
      unit_label: fields.unit_label,
      image_url: imageUrl,
      featured: fields.featured || false,
      category,
      vendor,
      dietary_tags: fields.dietary_tags || [],
    };
  } catch (err) {
    console.error('[Airtable] Error transforming product:', err);
    return null;
  }
}

function slugify(text: string): string {
  return text
    .toLowerCase()
    .trim()
    .replace(/[^\w\s-]/g, '')
    .replace(/\s+/g, '-')
    .replace(/-+/g, '-');
}

function validateImageUrl(url: string): string | undefined {
  try {
    const parsed = new URL(url);
    if (!parsed.protocol.startsWith('http')) {
      return undefined;
    }
    return url;
  } catch {
    return undefined;
  }
}
