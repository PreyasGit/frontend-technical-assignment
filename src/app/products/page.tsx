import type { Metadata } from "next";
import { Suspense } from "react";

import { PageLoader } from "@/components/common/loader";
import { ProductListView } from "@/modules/products/components/product-list-view";

export const metadata: Metadata = {
  title: "Products",
  description:
    "Browse the product catalogue with server-side search, sorting and pagination.",
};

export default function ProductsPage() {
  // `useSearchParams` inside the view requires a Suspense boundary.
  return (
    <Suspense fallback={<PageLoader label="Loading products…" />}>
      <ProductListView />
    </Suspense>
  );
}
