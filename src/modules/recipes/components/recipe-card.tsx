import Image from "next/image";
import Link from "next/link";
import { Clock, Flame, Star, Users } from "lucide-react";

import { Badge } from "@/components/ui/badge";
import { Card, CardContent } from "@/components/ui/card";
import { Skeleton } from "@/components/ui/skeleton";
import { cn, formatMinutes } from "@/lib/utils";

import type { Recipe, RecipeDifficulty } from "../types/recipe.types";

/** Difficulty chips use the brand palette only: accent, primary, secondary. */
const difficultyStyles: Record<RecipeDifficulty, string> = {
  Easy: "bg-accent text-accent-foreground",
  Medium: "bg-primary text-primary-foreground",
  Hard: "bg-secondary text-secondary-foreground",
};

export interface RecipeCardProps {
  recipe: Recipe;
}

/** Single recipe tile used in the responsive recipes grid. */
export function RecipeCard({ recipe }: RecipeCardProps) {
  const totalMinutes = recipe.prepTimeMinutes + recipe.cookTimeMinutes;

  return (
    <Card className="group relative flex h-full flex-col overflow-hidden transition-shadow hover:shadow-md focus-within:ring-3 focus-within:ring-ring/50">
      <div className="relative aspect-4/3 w-full overflow-hidden bg-muted">
        <Image
          src={recipe.image}
          alt=""
          fill
          sizes="(max-width: 640px) 100vw, (max-width: 1024px) 50vw, 25vw"
          className="object-cover transition-transform duration-300 group-hover:scale-105"
        />
        <span
          className={cn(
            "absolute top-3 left-3 rounded-full px-2.5 py-0.5 text-xs font-semibold backdrop-blur-sm",
            difficultyStyles[recipe.difficulty] ?? difficultyStyles.Medium
          )}
        >
          {recipe.difficulty}
        </span>
      </div>

      <CardContent className="flex flex-1 flex-col gap-3 p-4">
        <div className="space-y-1.5">
          <h2 className="line-clamp-2 leading-snug font-semibold text-foreground">
            {/* The stretched link makes the whole card clickable while staying accessible. */}
            <Link
              href={`/recipes/${recipe.id}`}
              className="outline-none after:absolute after:inset-0 hover:text-primary"
            >
              {recipe.name}
            </Link>
          </h2>
          <p className="text-sm text-muted-foreground">{recipe.cuisine} cuisine</p>
        </div>

        <div className="mt-auto flex flex-wrap items-center gap-x-4 gap-y-2 text-xs text-muted-foreground">
          <span className="inline-flex items-center gap-1">
            <Clock className="size-3.5" />
            {formatMinutes(totalMinutes)}
          </span>
          <span className="inline-flex items-center gap-1">
            <Users className="size-3.5" />
            {recipe.servings} servings
          </span>
          <span className="inline-flex items-center gap-1">
            <Flame className="size-3.5" />
            {recipe.caloriesPerServing} kcal
          </span>
          <span className="inline-flex items-center gap-1 font-medium text-foreground">
            <Star className="size-3.5 fill-accent text-accent" />
            {recipe.rating.toFixed(1)}
          </span>
        </div>

        {recipe.mealType?.length ? (
          <div className="flex flex-wrap gap-1.5 border-t border-border pt-3">
            {recipe.mealType.slice(0, 3).map((meal) => (
              <Badge key={meal} variant="outline">
                {meal}
              </Badge>
            ))}
          </div>
        ) : null}
      </CardContent>
    </Card>
  );
}

/** Loading placeholder matching the shape of {@link RecipeCard}. */
export function RecipeCardSkeleton() {
  return (
    <Card className="flex h-full flex-col overflow-hidden">
      <Skeleton className="aspect-4/3 w-full rounded-none" />
      <CardContent className="flex flex-col gap-3 p-4">
        <Skeleton className="h-5 w-4/5" />
        <Skeleton className="h-4 w-1/2" />
        <Skeleton className="h-4 w-full" />
      </CardContent>
    </Card>
  );
}
