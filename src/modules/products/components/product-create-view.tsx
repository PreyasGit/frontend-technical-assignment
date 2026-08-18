"use client";

import { useRouter, useSearchParams } from "next/navigation";

import { PageHeader } from "@/components/common/page-header";
import { RETURN_PARAM_KEY, resolveReturnHref } from "@/hooks/use-list-params";

import { useCreateProduct } from "../hooks/use-product-mutations";
import type { ProductFormValues } from "../schemas/product.schema";
import { ProductForm } from "./product-form";

/** Add Product screen. */
export function ProductCreateView() {
  const router = useRouter();
  const searchParams = useSearchParams();

  // Returns to the listing exactly as it was left, if we arrived from there.
  const backHref = resolveReturnHref("/products", searchParams.get(RETURN_PARAM_KEY));

  const createMutation = useCreateProduct(() => router.push(backHref));

  const handleSubmit = (values: ProductFormValues) => {
    createMutation.mutate({
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
        title="Add product"
        description="Create a new catalogue entry. All fields marked with an asterisk are required."
        backHref={backHref}
        backLabel="Back to products"
      />

      <ProductForm
        isSubmitting={createMutation.isPending}
        submitLabel="Create product"
        onSubmit={handleSubmit}
        cancelHref={backHref}
      />
    </div>
  );
}
