import type { Metadata } from "next";
import { Suspense } from "react";

import { PageLoader } from "@/components/common/loader";
import { ProductDetailView } from "@/modules/products/components/product-detail-view";

interface ProductDetailsPageProps {
  params: Promise<{ id: string }>;
}

export async function generateMetadata({
  params,
}: ProductDetailsPageProps): Promise<Metadata> {
  const { id } = await params;
  return {
    title: `Product #${id}`,
    description: "Full details for a single catalogue product.",
  };
}

export default async function ProductDetailsPage({ params }: ProductDetailsPageProps) {
  const { id } = await params;

  return (
    <Suspense fallback={<PageLoader label="Loading product…" />}>
      <ProductDetailView productId={id} />
    </Suspense>
  );
}
