import { cache } from "react";
import type { Metadata } from "next";
import { notFound } from "next/navigation";

import { RecipeDetail } from "@/modules/recipes/components/recipe-detail";
import type { Recipe } from "@/modules/recipes/types/recipe.types";
import { getRecipe } from "@/server/recipes/recipe.repository";

interface RecipeDetailsPageProps {
  params: Promise<{ id: string }>;
}

/**
 * Server-side fetch, deduplicated across `generateMetadata` and the page render
 * so a single request serves both.
 *
 * This calls the server repository directly rather than going back out through
 * the application's own HTTP API — same data, one less network hop.
 */
const loadRecipe = cache(async (id: string): Promise<Recipe | null> => {
  try {
    return await getRecipe(id);
  } catch {
    return null;
  }
});

export async function generateMetadata({
  params,
}: RecipeDetailsPageProps): Promise<Metadata> {
  const { id } = await params;
  const recipe = await loadRecipe(id);

  if (!recipe) {
    return { title: "Recipe not found" };
  }

  return {
    title: recipe.name,
    description: `${recipe.cuisine} recipe · ${recipe.difficulty} · ready in ${
      recipe.prepTimeMinutes + recipe.cookTimeMinutes
    } minutes.`,
  };
}

export default async function RecipeDetailsPage({ params }: RecipeDetailsPageProps) {
  const { id } = await params;
  const recipe = await loadRecipe(id);

  // A missing recipe renders the custom 404 page.
  if (!recipe) notFound();

  return <RecipeDetail recipe={recipe} />;
}
