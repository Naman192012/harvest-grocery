import { createServerFn } from "@tanstack/react-start";
import {
  getAirtableCategories,
  getAirtableVendors,
  getAirtableFeaturedProducts,
  getAirtableProductsByCategory,
  searchAirtableProducts,
  getAirtableProductBySlug,
  getAirtableProductsByVendor,
} from "./airtable-data.server";

async function getRelatedProductsImpl(categorySlug: string, excludeSlug: string) {
  const products = await getAirtableProductsByCategory(categorySlug);
  return products
    .filter((p) => p.slug !== excludeSlug)
    .slice(0, 4);
}

export const getCategories = createServerFn({ method: "GET" }).handler(async () => {
  return getAirtableCategories();
});

export const getAllVendors = createServerFn({ method: "GET" }).handler(async () => {
  return getAirtableVendors();
});

export const getFeaturedProducts = createServerFn({ method: "GET" }).handler(async () => {
  return getAirtableFeaturedProducts();
});

export const getProductsByCategory = createServerFn({ method: "GET" })
  .inputValidator((d: any) => d as { slug: string })
  .handler(async ({ data }) => {
    return getAirtableProductsByCategory(data.slug);
  });

export const searchProducts = createServerFn({ method: "GET" })
  .inputValidator((d: any) => d as { query: string })
  .handler(async ({ data }) => {
    return searchAirtableProducts(data.query);
  });

export const getProductBySlug = createServerFn({ method: "GET" })
  .inputValidator((d: any) => d as { slug: string })
  .handler(async ({ data }) => {
    return getAirtableProductBySlug(data.slug);
  });

export const getProductsByVendor = createServerFn({ method: "GET" })
  .inputValidator((d: any) => d as { slug: string })
  .handler(async ({ data }) => {
    return getAirtableProductsByVendor(data.slug);
  });

export const getRelatedProducts = createServerFn({ method: "GET" })
  .inputValidator((d: any) => d as { categorySlug: string; excludeSlug: string })
  .handler(async ({ data }) => {
    return getRelatedProductsImpl(data.categorySlug, data.excludeSlug);
  });
