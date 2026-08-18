"use client";

import { useRouter, useSearchParams } from "next/navigation";

import { ErrorState } from "@/components/common/error-state";
import { Loader } from "@/components/common/loader";
import { PageHeader } from "@/components/common/page-header";
import { Card, CardContent } from "@/components/ui/card";
import { RETURN_PARAM_KEY, resolveReturnHref } from "@/hooks/use-list-params";

import { useUpdateProduct } from "../hooks/use-product-mutations";
import { useProduct } from "../hooks/use-products";
import type { ProductFormValues } from "../schemas/product.schema";
import { ProductForm } from "./product-form";

export interface ProductEditViewProps {
  productId: string;
}

/** Edit Product screen. */
export function ProductEditView({ productId }: ProductEditViewProps) {
  const router = useRouter();
  const searchParams = useSearchParams();

  // Saving or cancelling returns to the listing in its original state.
  const backHref = resolveReturnHref("/products", searchParams.get(RETURN_PARAM_KEY));

  const { data: product, isLoading, isError, error, refetch } = useProduct(productId);
  const updateMutation = useUpdateProduct(productId, () => router.push(backHref));

  const handleSubmit = (values: ProductFormValues) => {
    updateMutation.mutate({
      title: values.title,
      description: values.description,
      category: values.category,
      price: values.price,
      stock: values.stock,
      brand: values.brand || undefined,
    });
  };

  return (
    <div className="mx-auto flex w-full max-w-3xl flex-col gap-6">
      <PageHeader
        title={product ? `Edit ${product.title}` : "Edit product"}
        description="Update the catalogue entry and save your changes."
        backHref={backHref}
        backLabel="Back to products"
      />

      {isLoading ? (
        <Card>
          <CardContent className="pt-6">
            <Loader label="Loading product…" />
          </CardContent>
        </Card>
      ) : isError || !product ? (
        <ErrorState
          title="Failed to load this product"
          error={error}
          onRetry={() => refetch()}
        />
      ) : (
        <ProductForm
          product={product}
          isSubmitting={updateMutation.isPending}
          submitLabel="Save changes"
          onSubmit={handleSubmit}
          cancelHref={backHref}
        />
      )}
    </div>
  );
}
