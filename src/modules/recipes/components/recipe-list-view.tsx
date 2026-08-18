"use client";

import { ChefHat } from "lucide-react";

import { EmptyState } from "@/components/common/empty-state";
import { ErrorState } from "@/components/common/error-state";
import { PageHeader } from "@/components/common/page-header";
import { Pagination } from "@/components/common/pagination";
import { SearchInput } from "@/components/common/search-input";
import { Button } from "@/components/ui/button";
import { Select } from "@/components/ui/select";
import { useListParams } from "@/hooks/use-list-params";
import { toTitleCase } from "@/lib/utils";

import { useRecipeTags, useRecipes } from "../hooks/use-recipes";
import { RecipeCard, RecipeCardSkeleton } from "./recipe-card";

/** Recipes listing rendered as a responsive card grid with search + pagination. */
export function RecipeListView() {
  const listParams = useListParams();
  const tag = listParams.getFilter("tag");

  const { data, isLoading, isFetching, isError, error, refetch } = useRecipes({
    page: listParams.page,
    limit: listParams.limit,
    search: listParams.search,
    tag,
  });

  const { data: tags } = useRecipeTags();

  const recipes = data?.items ?? [];
  const total = data?.total ?? 0;
  const hasFilters = Boolean(listParams.search || tag);

  return (
    <div className="flex flex-col gap-6">
      <PageHeader
        title="Recipes"
        description="Browse the collection as responsive cards, with search and pagination handled by the API."
      />

      <div className="flex flex-col gap-3 rounded-lg border border-border bg-card p-4 shadow-sm sm:flex-row sm:items-center">
        <SearchInput
          value={listParams.search}
          placeholder="Search recipes by name, cuisine or ingredient…"
          label="Search recipes"
          onChange={(value) => listParams.setParams({ search: value })}
          className="sm:max-w-sm"
        />

        <div className="flex items-center gap-3 sm:ml-auto">
          <span className="hidden text-sm font-medium whitespace-nowrap text-muted-foreground sm:inline">
            Tag
          </span>
          <Select
            aria-label="Filter by tag"
            value={tag}
            onChange={(event) =>
              listParams.setParams({ tag: event.target.value || undefined })
            }
            className="sm:w-52"
          >
            <option value="">All tags</option>
            {tags?.map((item) => (
              <option key={item} value={item}>
                {toTitleCase(item)}
              </option>
            ))}
          </Select>

          {hasFilters ? (
            <Button variant="ghost" size="sm" onClick={listParams.reset}>
              Clear
            </Button>
          ) : null}
        </div>
      </div>

      {isError ? (
        <ErrorState
          title="Failed to load recipes"
          error={error}
          onRetry={() => refetch()}
        />
      ) : isLoading ? (
        <div className="grid grid-cols-1 gap-5 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4">
          {Array.from({ length: listParams.limit }).map((_, index) => (
            <RecipeCardSkeleton key={index} />
          ))}
        </div>
      ) : recipes.length === 0 ? (
        <div className="rounded-lg border border-border bg-card shadow-sm">
          <EmptyState
            icon={ChefHat}
            title="No recipes found"
            description={
              hasFilters
                ? "No recipes match the current search or tag filter."
                : "There are no recipes to display yet."
            }
            action={
              hasFilters ? (
                <Button variant="outline" size="sm" onClick={listParams.reset}>
                  Clear filters
                </Button>
              ) : null
            }
          />
        </div>
      ) : (
        <div className="grid grid-cols-1 gap-5 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4">
          {recipes.map((recipe) => (
            <RecipeCard key={recipe.id} recipe={recipe} />
          ))}
        </div>
      )}

      {!isError ? (
        <Pagination
          page={listParams.page}
          limit={listParams.limit}
          total={total}
          itemLabel="recipes"
          isLoading={isFetching}
          onPageChange={(page) => listParams.setParams({ page })}
        />
      ) : null}
    </div>
  );
}
