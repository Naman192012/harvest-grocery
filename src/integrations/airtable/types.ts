export interface AirtableRecord<T> {
  id: string;
  createdTime: string;
  fields: T;
}

export interface AirtableProductFields {
  slug?: string;
  name: string;
  description?: string;
  price_cents: number;
  unit_label?: string;
  image_url?: string;
  featured?: boolean;
  vendor?: string[];
  category?: string[];
  dietary_tags?: string[];
}

export interface AirtableVendorFields {
  slug?: string;
  name: string;
  tagline?: string;
  location?: string;
  image_url?: string;
}

export interface AirtableCategoryFields {
  slug?: string;
  name: string;
  description?: string;
  icon?: string;
}

export interface AirtableProduct extends AirtableRecord<AirtableProductFields> {}
export interface AirtableVendor extends AirtableRecord<AirtableVendorFields> {}
export interface AirtableCategory extends AirtableRecord<AirtableCategoryFields> {}

export interface AirtableListResponse<T> {
  records: AirtableRecord<T>[];
  offset?: string;
}

export interface CacheEntry<T> {
  data: T;
  timestamp: number;
  ttl: number;
}
