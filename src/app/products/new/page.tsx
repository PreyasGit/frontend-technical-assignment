import type { Metadata } from "next";
import { Suspense } from "react";

import { PageLoader } from "@/components/common/loader";
import { ProductCreateView } from "@/modules/products/components/product-create-view";

export const metadata: Metadata = {
  title: "Add Product",
  description: "Create a new product in the catalogue.",
};

export default function AddProductPage() {
  return (
    <Suspense fallback={<PageLoader label="Preparing form…" />}>
      <ProductCreateView />
    </Suspense>
  );
}
