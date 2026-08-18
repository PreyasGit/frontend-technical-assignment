"use client";

import { useState, useCallback } from "react";
import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import axiosInstance from "@/lib/axios";
import { useSearchParams, useRouter, usePathname } from "next/navigation";
import { useForm } from "react-hook-form";
import { yupResolver } from "@hookform/resolvers/yup";
import * as yup from "yup";
import { toast } from "sonner";
import { Trash2 } from "lucide-react";

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
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogFooter,
} from "@/components/ui/dialog";

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

const recipeSchema = yup.object().shape({
  name: yup.string().required("Name is required"),
  cuisine: yup.string().required("Cuisine is required"),
  difficulty: yup.string().required("Difficulty is required"),
  prepTimeMinutes: yup
    .number()
    .typeError("Prep time must be a number")
    .positive("Prep time must be positive")
    .required("Prep time is required"),
});
type RecipeFormData = yup.InferType<typeof recipeSchema>;

export default function RecipesPage() {
  const router = useRouter();
  const pathname = usePathname();
  const searchParams = useSearchParams();
  const queryClient = useQueryClient();

  const query = searchParams.get("query") || "";
  const page = parseInt(searchParams.get("page") || "1", 10);
  const tagFilter = searchParams.get("tag") || "";

  const [searchInput, setSearchInput] = useState(query);
  const [isAddOpen, setIsAddOpen] = useState(false);
  const [deleteId, setDeleteId] = useState<number | null>(null);

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
    if (tagFilter) {
      url = `/recipes/tag/${tagFilter}?limit=${limit}&skip=${skip}`;
    } else if (query) {
      url = `/recipes/search?q=${query}&limit=${limit}&skip=${skip}`;
    } else {
      url = `/recipes?limit=${limit}&skip=${skip}`;
    }
    const { data } = await axiosInstance.get(url);
    return data;
  };

  const { data, isLoading, isError, error } = useQuery({
    queryKey: ["recipes", query, page, tagFilter],
    queryFn: fetchRecipes,
  });

  const {
    register,
    handleSubmit,
    reset,
    formState: { errors },
  } = useForm<RecipeFormData>({
    resolver: yupResolver(recipeSchema),
  });

  const addMutation = useMutation({
    mutationFn: async (newData: RecipeFormData) => {
      const { data } = await axiosInstance.post("/recipes/add", newData);
      return data;
    },
    onSuccess: () => {
      toast.success("Recipe created successfully!");
      setIsAddOpen(false);
      reset();
      queryClient.invalidateQueries({ queryKey: ["recipes"] });
    },
    onError: () => toast.error("Failed to create recipe"),
  });

  const deleteMutation = useMutation({
    mutationFn: async (id: number) => {
      const { data } = await axiosInstance.delete(`/recipes/${id}`);
      return data;
    },
    onSuccess: () => {
      toast.success("Recipe deleted successfully!");
      setDeleteId(null);
      queryClient.invalidateQueries({ queryKey: ["recipes"] });
    },
    onError: () => toast.error("Failed to delete recipe"),
  });

  const handleSearch = (e: React.FormEvent) => {
    e.preventDefault();
    const params = new URLSearchParams(searchParams.toString());
    if (searchInput) params.set("query", searchInput);
    else params.delete("query");
    params.delete("tag");
    params.set("page", "1");
    router.push(`${pathname}?${params.toString()}`);
  };

  const handleTagChange = (e: React.ChangeEvent<HTMLSelectElement>) => {
    const val = e.target.value;
    const params = new URLSearchParams(searchParams.toString());
    if (val) params.set("tag", val);
    else params.delete("tag");
    params.delete("query");
    setSearchInput("");
    params.set("page", "1");
    router.push(`${pathname}?${params.toString()}`);
  };

  if (isError) {
    return (
      <div className="flex flex-col items-center justify-center p-8 mt-12 border border-red-200 bg-red-50 text-red-700 rounded-lg max-w-lg mx-auto text-center">
        <h3 className="text-xl font-semibold mb-2">Failed to load recipes</h3>
        <p className="mb-4 text-sm opacity-90">{error instanceof Error ? error.message : "An error occurred."}</p>
        <Button variant="outline" onClick={() => window.location.reload()}>Try Again</Button>
      </div>
    );
  }

  const recipes = data?.recipes || [];
  const total = data?.total || 0;
  const isNextDisabled = page * limit >= total;

  return (
    <div className="flex flex-col gap-6 p-4 md:p-8 mx-auto w-full max-w-7xl">
      <div className="flex justify-between items-center">
        <h1 className="text-3xl font-bold tracking-tight">Recipes</h1>
        <Button className="bg-primary text-primary-foreground" onClick={() => setIsAddOpen(true)}>Add Recipe</Button>
      </div>

      <div className="flex flex-col sm:flex-row justify-between items-center gap-4 bg-card text-card-foreground p-4 rounded-md border shadow-sm">
        <form onSubmit={handleSearch} className="flex items-center gap-2 w-full max-w-md">
          <Input
            type="text"
            placeholder="Search recipes..."
            value={searchInput}
            onChange={(e) => setSearchInput(e.target.value)}
          />
          <Button type="submit" variant="secondary">Search</Button>
        </form>

        <div className="flex items-center gap-4 w-full sm:w-auto overflow-x-auto">
          <div className="flex items-center gap-2">
            <span className="text-sm font-medium text-muted-foreground whitespace-nowrap">Filter:</span>
            <select
              value={tagFilter}
              onChange={handleTagChange}
              className="flex h-9 items-center justify-between whitespace-nowrap rounded-md border border-input bg-transparent px-3 py-2 text-sm shadow-sm ring-offset-background placeholder:text-muted-foreground focus:outline-none focus:ring-1 focus:ring-ring disabled:cursor-not-allowed disabled:opacity-50 [&>span]:line-clamp-1 w-[140px]"
            >
              <option value="">All Recipes</option>
              <option value="Italian">Italian (Cuisine)</option>
              <option value="Asian">Asian (Cuisine)</option>
              <option value="Mexican">Mexican (Cuisine)</option>
              <option value="Easy">Easy (Difficulty)</option>
            </select>
          </div>
        </div>
      </div>

      <div className="rounded-md border bg-card text-card-foreground shadow-sm overflow-hidden">
        <Table>
          <TableHeader>
            <TableRow>
              <TableHead className="w-[80px]">ID</TableHead>
              <TableHead className="w-[100px]">Image</TableHead>
              <TableHead>Name</TableHead>
              <TableHead>Cuisine</TableHead>
              <TableHead>Difficulty</TableHead>
              <TableHead className="text-right">Prep Time</TableHead>
              <TableHead className="text-right w-[100px]">Actions</TableHead>
            </TableRow>
          </TableHeader>
          <TableBody>
            {isLoading ? (
              Array.from({ length: 5 }).map((_, i) => (
                <TableRow key={i}>
                  <TableCell><Skeleton className="h-5 w-12" /></TableCell>
                  <TableCell><Skeleton className="h-12 w-12 rounded-md" /></TableCell>
                  <TableCell><Skeleton className="h-5 w-32" /></TableCell>
                  <TableCell><Skeleton className="h-5 w-24" /></TableCell>
                  <TableCell><Skeleton className="h-6 w-16 rounded-full" /></TableCell>
                  <TableCell className="text-right"><Skeleton className="h-5 w-16 ml-auto" /></TableCell>
                  <TableCell className="text-right"><Skeleton className="h-8 w-10 ml-auto" /></TableCell>
                </TableRow>
              ))
            ) : recipes.length === 0 ? (
              <TableRow>
                <TableCell colSpan={7} className="h-32 text-center text-muted-foreground">No recipes found.</TableCell>
              </TableRow>
            ) : (
              recipes.map((recipe) => (
                <TableRow key={recipe.id}>
                  <TableCell className="font-medium">{recipe.id}</TableCell>
                  <TableCell>
                    {recipe.image ? (
                      <img src={recipe.image} alt={recipe.name} className="w-12 h-12 object-cover rounded-md" />
                    ) : (
                      <div className="w-12 h-12 bg-muted rounded-md flex items-center justify-center text-xs text-muted-foreground">N/A</div>
                    )}
                  </TableCell>
                  <TableCell className="font-medium">{recipe.name}</TableCell>
                  <TableCell>{recipe.cuisine}</TableCell>
                  <TableCell>
                    <span className={`px-2 py-1 rounded-full text-xs font-medium ${
                      recipe.difficulty === 'Easy' ? 'bg-green-100 text-green-700 dark:bg-green-900 dark:text-green-300' :
                      recipe.difficulty === 'Medium' ? 'bg-yellow-100 text-yellow-700 dark:bg-yellow-900 dark:text-yellow-300' :
                      'bg-red-100 text-red-700 dark:bg-red-900 dark:text-red-300'
                    }`}>
                      {recipe.difficulty}
                    </span>
                  </TableCell>
                  <TableCell className="text-right">{recipe.prepTimeMinutes} mins</TableCell>
                  <TableCell className="text-right">
                    <Button variant="destructive" size="sm" onClick={() => setDeleteId(recipe.id)}>
                      <Trash2 className="h-4 w-4" />
                    </Button>
                  </TableCell>
                </TableRow>
              ))
            )}
          </TableBody>
        </Table>
      </div>

      <div className="flex justify-between items-center px-2 py-4">
        <div className="text-sm text-muted-foreground">
          Showing {total === 0 ? 0 : skip + 1} to {Math.min(skip + limit, total)} of {total} recipes
        </div>
        <div className="flex items-center gap-2">
          <Button variant="outline" size="sm" disabled={page <= 1} onClick={() => router.push(`${pathname}?${createQueryString("page", String(page - 1))}`)}>
            Previous
          </Button>
          <Button variant="outline" size="sm" disabled={isNextDisabled} onClick={() => router.push(`${pathname}?${createQueryString("page", String(page + 1))}`)}>
            Next
          </Button>
        </div>
      </div>

      {/* Add Recipe Dialog */}
      <Dialog open={isAddOpen} onOpenChange={setIsAddOpen}>
        <DialogContent className="bg-background">
          <DialogHeader>
            <DialogTitle>Add New Recipe</DialogTitle>
          </DialogHeader>
          <form onSubmit={handleSubmit((d) => addMutation.mutate(d))} className="flex flex-col gap-4 mt-4">
            <div className="space-y-2">
              <label className="text-sm font-medium">Recipe Name</label>
              <Input {...register("name")} className={errors.name ? "border-red-500" : ""} />
              {errors.name && <p className="text-red-500 text-sm">{errors.name.message}</p>}
            </div>
            <div className="grid grid-cols-2 gap-4">
              <div className="space-y-2">
                <label className="text-sm font-medium">Cuisine</label>
                <Input {...register("cuisine")} className={errors.cuisine ? "border-red-500" : ""} />
                {errors.cuisine && <p className="text-red-500 text-sm">{errors.cuisine.message}</p>}
              </div>
              <div className="space-y-2">
                <label className="text-sm font-medium">Difficulty</label>
                <Input {...register("difficulty")} placeholder="e.g. Easy, Medium" className={errors.difficulty ? "border-red-500" : ""} />
                {errors.difficulty && <p className="text-red-500 text-sm">{errors.difficulty.message}</p>}
              </div>
            </div>
            <div className="space-y-2">
              <label className="text-sm font-medium">Prep Time (mins)</label>
              <Input type="number" {...register("prepTimeMinutes")} className={errors.prepTimeMinutes ? "border-red-500" : ""} />
              {errors.prepTimeMinutes && <p className="text-red-500 text-sm">{errors.prepTimeMinutes.message}</p>}
            </div>
            <DialogFooter className="mt-4">
              <Button type="button" variant="outline" onClick={() => setIsAddOpen(false)}>Cancel</Button>
              <Button type="submit" disabled={addMutation.isPending}>{addMutation.isPending ? "Adding..." : "Add Recipe"}</Button>
            </DialogFooter>
          </form>
        </DialogContent>
      </Dialog>

      {/* Delete Confirmation Dialog */}
      <Dialog open={deleteId !== null} onOpenChange={(open) => !open && setDeleteId(null)}>
        <DialogContent className="bg-background">
          <DialogHeader>
            <DialogTitle>Delete Recipe</DialogTitle>
          </DialogHeader>
          <p className="py-4 text-muted-foreground">Are you sure you want to delete this recipe? This action cannot be undone.</p>
          <DialogFooter>
            <Button variant="outline" onClick={() => setDeleteId(null)}>Cancel</Button>
            <Button variant="destructive" onClick={() => deleteId !== null && deleteMutation.mutate(deleteId)} disabled={deleteMutation.isPending}>
              {deleteMutation.isPending ? "Deleting..." : "Delete"}
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>
    </div>
  );
}
