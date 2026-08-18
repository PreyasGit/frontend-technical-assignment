import type { ListQueryParams } from "@/types/api.types";

export interface Recipe {
  id: number;
  name: string;
  ingredients: string[];
  instructions: string[];
  prepTimeMinutes: number;
  cookTimeMinutes: number;
  servings: number;
  difficulty: RecipeDifficulty;
  cuisine: string;
  caloriesPerServing: number;
  tags: string[];
  userId: number;
  image: string;
  rating: number;
  reviewCount: number;
  mealType: string[];
}

export type RecipeDifficulty = "Easy" | "Medium" | "Hard";

export interface RecipeListParams extends ListQueryParams {
  tag?: string;
}
