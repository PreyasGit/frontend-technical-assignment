"use client";

import { useState, useCallback } from "react";
import { useQuery } from "@tanstack/react-query";
import axiosInstance from "@/lib/axios";
import { useSearchParams, useRouter, usePathname } from "next/navigation";
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table";
import { Button } from "@/components/ui/button";
import { Skeleton } from "@/components/ui/skeleton";
import { Input } from "@/components/ui/input";

interface Recipe {
  id: number;
  name: string;
  cuisine: string;
  difficulty: string;
  prepTimeMinutes: number;
  image: string;
}

interface RecipesResponse {
  recipes: Recipe[];
  total: number;
  skip: number;
  limit: number;
}

export default function RecipesPage() {
  const router = useRouter();
  const pathname = usePathname();
  const searchParams = useSearchParams();

  const query = searchParams.get("query") || "";
  const page = parseInt(searchParams.get("page") || "1", 10);

  const [searchInput, setSearchInput] = useState(query);

  const limit = 10;
  const skip = (page - 1) * limit;

  const createQueryString = useCallback(
    (name: string, value: string) => {
      const params = new URLSearchParams(searchParams.toString());
      if (value) {
        params.set(name, value);
      } else {
        params.delete(name);
      }
      return params.toString();
    },
    [searchParams]
  );

  const fetchRecipes = async (): Promise<RecipesResponse> => {
    let url = "";
    if (query) {
      url = `/recipes/search?q=${query}&limit=${limit}&skip=${skip}`;
    } else {
      url = `/recipes?limit=${limit}&skip=${skip}`;
    }
    const { data } = await axiosInstance.get(url);
    return data;
  };

  const {
    data,
    isLoading,
    isError,
    error,
  } = useQuery({
    queryKey: ["recipes", query, page],
    queryFn: fetchRecipes,
  });

  const handleSearch = (e: React.FormEvent) => {
    e.preventDefault();
    const params = new URLSearchParams(searchParams.toString());
    if (searchInput) {
      params.set("query", searchInput);
    } else {
      params.delete("query");
    }
    params.set("page", "1"); // Reset to page 1 on new search
    router.push(`${pathname}?${params.toString()}`);
  };

  if (isError) {
    return (
      <div className="flex flex-col items-center justify-center p-8 mt-12 border border-red-200 bg-red-50 text-red-700 rounded-lg max-w-lg mx-auto text-center shadow-sm">
        <h3 className="text-xl font-bold mb-2">Failed to load recipes</h3>
        <p className="mb-4 text-sm font-medium opacity-90">
          {error instanceof Error ? error.message : "An unknown error occurred. Please try again later."}
        </p>
        <Button
          variant="outline"
          className="bg-white border-red-200 text-red-700 hover:bg-red-50 font-semibold"
          onClick={() => window.location.reload()}
        >
          Try Again
        </Button>
      </div>
    );
  }

  const recipes = data?.recipes || [];
  const total = data?.total || 0;
  const isNextDisabled = page * limit >= total;

  return (
    <div className="flex flex-col gap-6 w-full">
      <div className="flex items-center justify-between">
        <h1 className="text-3xl font-bold tracking-tight text-foreground">Recipes</h1>
        <Button className="font-semibold">Add Recipe</Button>
      </div>

      {/* Controls UI */}
      <div className="flex flex-col sm:flex-row gap-4 items-center justify-between bg-white p-4 rounded-lg border shadow-sm">
        <form onSubmit={handleSearch} className="flex items-center gap-2 w-full sm:w-auto">
          <Input
            type="text"
            placeholder="Search recipes..."
            value={searchInput}
            onChange={(e) => setSearchInput(e.target.value)}
            className="w-full sm:w-[320px]"
          />
          <Button type="submit" variant="secondary" className="font-semibold">Search</Button>
        </form>
      </div>

      <div className="rounded-lg border bg-white overflow-x-auto shadow-sm">
        <Table>
          <TableHeader>
            <TableRow className="bg-gray-50/50">
              <TableHead className="w-[80px] font-semibold">ID</TableHead>
              <TableHead className="w-[80px] font-semibold">Image</TableHead>
              <TableHead className="font-semibold">Name</TableHead>
              <TableHead className="font-semibold">Cuisine</TableHead>
              <TableHead className="font-semibold">Difficulty</TableHead>
              <TableHead className="font-semibold text-right">Prep Time</TableHead>
            </TableRow>
          </TableHeader>
          <TableBody>
            {isLoading ? (
              Array.from({ length: 5 }).map((_, i) => (
                <TableRow key={i}>
                  <TableCell>
                    <Skeleton className="h-5 w-8" />
                  </TableCell>
                  <TableCell>
                    <Skeleton className="h-12 w-12 rounded-md" />
                  </TableCell>
                  <TableCell>
                    <Skeleton className="h-5 w-40" />
                  </TableCell>
                  <TableCell>
                    <Skeleton className="h-5 w-24" />
                  </TableCell>
                  <TableCell>
                    <Skeleton className="h-5 w-24" />
                  </TableCell>
                  <TableCell className="text-right">
                    <Skeleton className="h-5 w-20 ml-auto" />
                  </TableCell>
                </TableRow>
              ))
            ) : recipes.length === 0 ? (
              <TableRow>
                <TableCell colSpan={6} className="h-32 text-center text-secondary font-medium">
                  No recipes found.
                </TableCell>
              </TableRow>
            ) : (
              recipes.map((recipe) => (
                <TableRow key={recipe.id}>
                  <TableCell className="font-medium text-secondary">{recipe.id}</TableCell>
                  <TableCell>
                    <img 
                      src={recipe.image} 
                      alt={recipe.name} 
                      className="w-12 h-12 object-cover rounded-md border bg-gray-50"
                    />
                  </TableCell>
                  <TableCell className="font-medium text-foreground">{recipe.name}</TableCell>
                  <TableCell>{recipe.cuisine}</TableCell>
                  <TableCell>
                    <span className={`px-2 py-1 rounded-full text-xs font-semibold ${
                      recipe.difficulty === "Easy" ? "bg-green-100 text-green-700" :
                      recipe.difficulty === "Medium" ? "bg-yellow-100 text-yellow-700" :
                      "bg-red-100 text-red-700"
                    }`}>
                      {recipe.difficulty}
                    </span>
                  </TableCell>
                  <TableCell className="text-right text-secondary">{recipe.prepTimeMinutes} mins</TableCell>
                </TableRow>
              ))
            )}
          </TableBody>
        </Table>
      </div>

      {/* Pagination UI */}
      <div className="flex items-center justify-between">
        <div className="text-sm font-medium text-secondary">
          Showing {total === 0 ? 0 : skip + 1} to {Math.min(skip + limit, total)} of {total} recipes
        </div>
        <div className="flex items-center gap-2">
          <Button
            variant="outline"
            size="sm"
            disabled={page <= 1}
            onClick={() => router.push(`${pathname}?${createQueryString("page", String(page - 1))}`)}
            className="font-semibold"
          >
            Previous
          </Button>
          <Button
            variant="outline"
            size="sm"
            disabled={isNextDisabled}
            onClick={() => router.push(`${pathname}?${createQueryString("page", String(page + 1))}`)}
            className="font-semibold"
          >
            Next
          </Button>
        </div>
      </div>
    </div>
  );
}
