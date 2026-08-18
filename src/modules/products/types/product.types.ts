import type { ListQueryParams } from "@/types/api.types";

export interface ProductDimensions {
  width: number;
  height: number;
  depth: number;
}

export interface ProductReview {
  rating: number;
  comment: string;
  date: string;
  reviewerName: string;
  reviewerEmail: string;
}

export interface Product {
  id: number;
  title: string;
  description: string;
  category: string;
  price: number;
  discountPercentage: number;
  rating: number;
  stock: number;
  tags: string[];
  brand?: string;
  sku: string;
  weight: number;
  dimensions: ProductDimensions;
  warrantyInformation: string;
  shippingInformation: string;
  availabilityStatus: string;
  returnPolicy: string;
  minimumOrderQuantity: number;
  reviews: ProductReview[];
  images: string[];
  thumbnail: string;
}

export interface ProductCategory {
  slug: string;
  name: string;
  url: string;
}

/** Fields the application is allowed to create or update. */
export interface ProductPayload {
  title: string;
  description: string;
  category: string;
  price: number;
  stock: number;
  brand?: string;
}

export interface ProductListParams extends ListQueryParams {
  category?: string;
}

/** Columns the Products API can sort by. */
export const PRODUCT_SORT_FIELDS = ["title", "price", "rating", "stock"] as const;
export type ProductSortField = (typeof PRODUCT_SORT_FIELDS)[number];
