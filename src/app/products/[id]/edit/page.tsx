import type { Metadata } from "next";
import { Suspense } from "react";

import { PageLoader } from "@/components/common/loader";
import { ProductEditView } from "@/modules/products/components/product-edit-view";

interface EditProductPageProps {
  params: Promise<{ id: string }>;
}

export async function generateMetadata({
  params,
}: EditProductPageProps): Promise<Metadata> {
  const { id } = await params;
  return {
    title: `Edit Product #${id}`,
    description: "Update an existing catalogue product.",
  };
}

export default async function EditProductPage({ params }: EditProductPageProps) {
  const { id } = await params;

  return (
    <Suspense fallback={<PageLoader label="Loading product…" />}>
      <ProductEditView productId={id} />
    </Suspense>
  );
}
