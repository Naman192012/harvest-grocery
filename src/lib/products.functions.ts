import { createServerFn } from "@tanstack/react-start";
import {
  getCategories as getCategoriesData,
  getAllVendors as getAllVendorsData,
  getFeaturedProducts as getFeaturedProductsData,
  getProductsByCategory as getProductsByCategoryData,
  searchProducts as searchProductsData,
  getProductBySlug as getProductBySlugData,
  getProductsByVendor as getProductsByVendorData,
  getRelatedProducts as getRelatedProductsData,
} from "./products.server";

export const getCategories = createServerFn({ method: "GET" }).handler(async () => {
  return getCategoriesData();
});

export const getAllVendors = createServerFn({ method: "GET" }).handler(async () => {
  return getAllVendorsData();
});

export const getFeaturedProducts = createServerFn({ method: "GET" }).handler(async () => {
  return getFeaturedProductsData();
});

export const getProductsByCategory = createServerFn({ method: "GET" })
  .inputValidator((d: any) => d as { slug: string })
  .handler(async ({ data }) => {
    return getProductsByCategoryData(data.slug);
  });

export const searchProducts = createServerFn({ method: "GET" })
  .inputValidator((d: any) => d as { query: string })
  .handler(async ({ data }) => {
    return searchProductsData(data.query);
  });

export const getProductBySlug = createServerFn({ method: "GET" })
  .inputValidator((d: any) => d as { slug: string })
  .handler(async ({ data }) => {
    return getProductBySlugData(data.slug);
  });

export const getProductsByVendor = createServerFn({ method: "GET" })
  .inputValidator((d: any) => d as { slug: string })
  .handler(async ({ data }) => {
    return getProductsByVendorData(data.slug);
  });

export const getRelatedProducts = createServerFn({ method: "GET" })
  .inputValidator((d: any) => d as { categorySlug: string; excludeSlug: string })
  .handler(async ({ data }) => {
    return getRelatedProductsData(data.categorySlug, data.excludeSlug);
  });
