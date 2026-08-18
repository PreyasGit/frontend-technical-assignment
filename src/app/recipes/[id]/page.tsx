import { cache } from "react";
import type { Metadata } from "next";
import { notFound } from "next/navigation";

import { RecipeDetail } from "@/modules/recipes/components/recipe-detail";
import { getRecipeById } from "@/modules/recipes/services/recipe.service";
import type { Recipe } from "@/modules/recipes/types/recipe.types";

interface RecipeDetailsPageProps {
  params: Promise<{ id: string }>;
}

/**
 * Server-side fetch, deduplicated across `generateMetadata` and the page render
 * so a single request serves both.
 */
const loadRecipe = cache(async (id: string): Promise<Recipe | null> => {
  try {
    return await getRecipeById(id);
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
