import type { Metadata } from "next";
import { Suspense } from "react";

import { PageLoader } from "@/components/common/loader";
import { RecipeListView } from "@/modules/recipes/components/recipe-list-view";

export const metadata: Metadata = {
  title: "Recipes",
  description: "Browse recipes in a responsive card layout with search and pagination.",
};

export default function RecipesPage() {
  return (
    <Suspense fallback={<PageLoader label="Loading recipes…" />}>
      <RecipeListView />
    </Suspense>
  );
}
