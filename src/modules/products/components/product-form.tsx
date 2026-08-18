"use client";

import { useEffect } from "react";
import { useRouter } from "next/navigation";
import { useForm } from "react-hook-form";
import { yupResolver } from "@hookform/resolvers/yup";

import { FormField } from "@/components/common/form-field";
import { Button } from "@/components/ui/button";
import { Card, CardContent } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Select } from "@/components/ui/select";
import { Textarea } from "@/components/ui/textarea";

import { useProductCategories } from "../hooks/use-products";
import {
  productFormDefaults,
  productSchema,
  type ProductFormValues,
} from "../schemas/product.schema";
import type { Product } from "../types/product.types";

export interface ProductFormProps {
  /** Present in edit mode, absent in create mode. */
  product?: Product;
  isSubmitting: boolean;
  submitLabel: string;
  onSubmit: (values: ProductFormValues) => void;
  /** Where Cancel navigates back to (preserves listing state). */
  cancelHref: string;
}

/** Shared Add/Edit product form built on React Hook Form + Yup. */
export function ProductForm({
  product,
  isSubmitting,
  submitLabel,
  onSubmit,
  cancelHref,
}: ProductFormProps) {
  const router = useRouter();
  const { data: categories, isLoading: isLoadingCategories } = useProductCategories();

  const {
    register,
    handleSubmit,
    reset,
    formState: { errors, isDirty },
  } = useForm<ProductFormValues>({
    resolver: yupResolver(productSchema),
    defaultValues: productFormDefaults,
    mode: "onBlur",
  });

  // Populate the form once the product has been fetched (edit mode).
  useEffect(() => {
    if (!product) return;
    reset({
      title: product.title,
      description: product.description,
      category: product.category,
      price: product.price,
      stock: product.stock,
      brand: product.brand ?? "",
    });
  }, [product, reset]);

  return (
    <Card>
      <CardContent className="pt-6">
        <form
          noValidate
          onSubmit={handleSubmit(onSubmit)}
          className="flex flex-col gap-5"
        >
          <FormField name="title" label="Title" required error={errors.title?.message}>
            <Input
              id="title"
              placeholder="e.g. Essence Mascara Lash Princess"
              aria-invalid={Boolean(errors.title)}
              aria-describedby={errors.title ? "title-error" : undefined}
              {...register("title")}
            />
          </FormField>

          <FormField
            name="description"
            label="Description"
            required
            error={errors.description?.message}
          >
            <Textarea
              id="description"
              rows={4}
              placeholder="Describe the product in a sentence or two."
              aria-invalid={Boolean(errors.description)}
              aria-describedby={errors.description ? "description-error" : undefined}
              {...register("description")}
            />
          </FormField>

          <div className="grid gap-5 sm:grid-cols-2">
            <FormField
              name="category"
              label="Category"
              required
              error={errors.category?.message}
            >
              <Select
                id="category"
                disabled={isLoadingCategories}
                aria-invalid={Boolean(errors.category)}
                {...register("category")}
              >
                <option value="">
                  {isLoadingCategories ? "Loading categories…" : "Select a category"}
                </option>
                {categories?.map((category) => (
                  <option key={category.slug} value={category.slug}>
                    {category.name}
                  </option>
                ))}
              </Select>
            </FormField>

            <FormField name="brand" label="Brand" error={errors.brand?.message}>
              <Input
                id="brand"
                placeholder="Optional"
                aria-invalid={Boolean(errors.brand)}
                {...register("brand")}
              />
            </FormField>
          </div>

          <div className="grid gap-5 sm:grid-cols-2">
            <FormField
              name="price"
              label="Price (USD)"
              required
              error={errors.price?.message}
            >
              <Input
                id="price"
                type="number"
                step="0.01"
                min="0"
                placeholder="0.00"
                aria-invalid={Boolean(errors.price)}
                {...register("price")}
              />
            </FormField>

            <FormField
              name="stock"
              label="Stock"
              required
              error={errors.stock?.message}
            >
              <Input
                id="stock"
                type="number"
                step="1"
                min="0"
                placeholder="0"
                aria-invalid={Boolean(errors.stock)}
                {...register("stock")}
              />
            </FormField>
          </div>

          <div className="flex flex-col-reverse gap-2 border-t border-border pt-5 sm:flex-row sm:justify-end">
            <Button
              type="button"
              variant="outline"
              disabled={isSubmitting}
              onClick={() => router.push(cancelHref)}
            >
              Cancel
            </Button>
            <Button type="submit" disabled={isSubmitting || (Boolean(product) && !isDirty)}>
              {isSubmitting ? "Saving…" : submitLabel}
            </Button>
          </div>
        </form>
      </CardContent>
    </Card>
  );
}
