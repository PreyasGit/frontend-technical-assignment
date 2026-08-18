import Image from "next/image";
import { Clock, Flame, Star, Timer, Users, UtensilsCrossed } from "lucide-react";

import { PageHeader } from "@/components/common/page-header";
import { Badge } from "@/components/ui/badge";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { formatMinutes } from "@/lib/utils";

import type { Recipe } from "../types/recipe.types";

export interface RecipeDetailProps {
  recipe: Recipe;
}

/**
 * Server-rendered recipe details.
 *
 * This component is intentionally free of client hooks: the data arrives from a
 * server-side API call in the page, so nothing needs to hydrate on the client.
 */
export function RecipeDetail({ recipe }: RecipeDetailProps) {
  const stats = [
    { icon: Timer, label: "Prep time", value: formatMinutes(recipe.prepTimeMinutes) },
    { icon: Clock, label: "Cook time", value: formatMinutes(recipe.cookTimeMinutes) },
    { icon: Users, label: "Servings", value: `${recipe.servings}` },
    {
      icon: Flame,
      label: "Calories",
      value: `${recipe.caloriesPerServing} kcal`,
    },
  ];

  return (
    <div className="flex flex-col gap-6">
      <PageHeader
        title={recipe.name}
        description={`${recipe.cuisine} · ${recipe.difficulty}`}
        backHref="/recipes"
        backLabel="Back to recipes"
      />

      <div className="grid gap-6 lg:grid-cols-[minmax(0,1fr)_minmax(0,1.1fr)]">
        <div className="flex flex-col gap-6">
          <div className="relative aspect-4/3 w-full overflow-hidden rounded-lg border border-border bg-muted">
            <Image
              src={recipe.image}
              alt={recipe.name}
              fill
              priority
              sizes="(max-width: 1024px) 100vw, 45vw"
              className="object-cover"
            />
          </div>

          <div className="grid grid-cols-2 gap-3 sm:grid-cols-4">
            {stats.map((stat) => (
              <div
                key={stat.label}
                className="flex flex-col items-center gap-1 rounded-lg border border-border bg-card p-4 text-center shadow-sm"
              >
                <stat.icon className="size-5 text-primary" />
                <p className="text-sm font-semibold text-foreground">{stat.value}</p>
                <p className="text-xs text-muted-foreground">{stat.label}</p>
              </div>
            ))}
          </div>

          <div className="flex flex-wrap items-center gap-2">
            <Badge variant="default">
              <Star className="fill-current" />
              {recipe.rating.toFixed(1)} ({recipe.reviewCount} reviews)
            </Badge>
            {recipe.mealType?.map((meal) => (
              <Badge key={meal} variant="secondary">
                {meal}
              </Badge>
            ))}
            {recipe.tags?.map((tag) => (
              <Badge key={tag} variant="outline">
                {tag}
              </Badge>
            ))}
          </div>
        </div>

        <div className="flex flex-col gap-6">
          <Card>
            <CardHeader>
              <CardTitle className="flex items-center gap-2">
                <UtensilsCrossed className="size-5 text-primary" />
                Ingredients
              </CardTitle>
            </CardHeader>
            <CardContent>
              <ul className="flex flex-col gap-2">
                {recipe.ingredients.map((ingredient) => (
                  <li
                    key={ingredient}
                    className="flex items-start gap-2.5 text-sm text-foreground"
                  >
                    <span
                      aria-hidden
                      className="mt-1.5 size-1.5 shrink-0 rounded-full bg-accent"
                    />
                    {ingredient}
                  </li>
                ))}
              </ul>
            </CardContent>
          </Card>

          <Card>
            <CardHeader>
              <CardTitle>Instructions</CardTitle>
            </CardHeader>
            <CardContent>
              <ol className="flex flex-col gap-4">
                {recipe.instructions.map((instruction, index) => (
                  <li key={instruction} className="flex items-start gap-3">
                    <span className="flex size-6 shrink-0 items-center justify-center rounded-full bg-primary/10 text-xs font-semibold text-primary">
                      {index + 1}
                    </span>
                    <p className="text-sm leading-relaxed text-foreground">
                      {instruction}
                    </p>
                  </li>
                ))}
              </ol>
            </CardContent>
          </Card>
        </div>
      </div>
    </div>
  );
}
