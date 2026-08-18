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

interface Product {
  id: number;
  title: string;
  category: string;
  price: number;
}

interface ProductsResponse {
  products: Product[];
  total: number;
  skip: number;
  limit: number;
}

const productSchema = yup.object().shape({
  title: yup.string().required("Title is required"),
  price: yup
    .number()
    .typeError("Price must be a number")
    .positive("Price must be a positive number")
    .required("Price is required"),
  category: yup.string().required("Category is required"),
});
type ProductFormData = yup.InferType<typeof productSchema>;

export default function ProductsPage() {
  const router = useRouter();
  const pathname = usePathname();
  const searchParams = useSearchParams();
  const queryClient = useQueryClient();

  const query = searchParams.get("query") || "";
  const page = parseInt(searchParams.get("page") || "1", 10);
  const sortBy = searchParams.get("sortBy") || "title";
  const order = searchParams.get("order") || "asc";
  const categoryFilter = searchParams.get("category") || "";

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

  const fetchProducts = async (): Promise<ProductsResponse> => {
    let url = "";
    if (categoryFilter) {
      url = `/products/category/${categoryFilter}?limit=${limit}&skip=${skip}&sortBy=${sortBy}&order=${order}`;
    } else if (query) {
      url = `/products/search?q=${query}&limit=${limit}&skip=${skip}&sortBy=${sortBy}&order=${order}`;
    } else {
      url = `/products?limit=${limit}&skip=${skip}&sortBy=${sortBy}&order=${order}`;
    }
    const { data } = await axiosInstance.get(url);
    return data;
  };

  const { data, isLoading, isError, error } = useQuery({
    queryKey: ["products", query, page, sortBy, order, categoryFilter],
    queryFn: fetchProducts,
  });

  const {
    register,
    handleSubmit,
    reset,
    formState: { errors },
  } = useForm<ProductFormData>({
    resolver: yupResolver(productSchema),
  });

  const addMutation = useMutation({
    mutationFn: async (newData: ProductFormData) => {
      const { data } = await axiosInstance.post("/products/add", newData);
      return data;
    },
    onSuccess: () => {
      toast.success("Item created successfully!");
      setIsAddOpen(false);
      reset();
      queryClient.invalidateQueries({ queryKey: ["products"] });
    },
    onError: () => toast.error("Failed to create product"),
  });

  const deleteMutation = useMutation({
    mutationFn: async (id: number) => {
      const { data } = await axiosInstance.delete(`/products/${id}`);
      return data;
    },
    onSuccess: () => {
      toast.success("Item deleted successfully!");
      setDeleteId(null);
      queryClient.invalidateQueries({ queryKey: ["products"] });
    },
    onError: () => toast.error("Failed to delete product"),
  });

  const handleSearch = (e: React.FormEvent) => {
    e.preventDefault();
    const params = new URLSearchParams(searchParams.toString());
    if (searchInput) params.set("query", searchInput);
    else params.delete("query");
    params.delete("category"); // reset category when searching
    params.set("page", "1");
    router.push(`${pathname}?${params.toString()}`);
  };

  const handleCategoryChange = (e: React.ChangeEvent<HTMLSelectElement>) => {
    const val = e.target.value;
    const params = new URLSearchParams(searchParams.toString());
    if (val) params.set("category", val);
    else params.delete("category");
    params.delete("query"); // reset search when categorizing
    setSearchInput("");
    params.set("page", "1");
    router.push(`${pathname}?${params.toString()}`);
  };

  const toggleSort = (field: string) => {
    let newOrder = "asc";
    if (sortBy === field && order === "asc") newOrder = "desc";
    const params = new URLSearchParams(searchParams.toString());
    params.set("sortBy", field);
    params.set("order", newOrder);
    params.set("page", "1");
    router.push(`${pathname}?${params.toString()}`);
  };

  if (isError) {
    return (
      <div className="flex flex-col items-center justify-center p-8 mt-12 border border-red-200 bg-red-50 text-red-700 rounded-lg max-w-lg mx-auto text-center">
        <h3 className="text-xl font-semibold mb-2">Failed to load products</h3>
        <p className="mb-4 text-sm opacity-90">{error instanceof Error ? error.message : "An error occurred."}</p>
        <Button variant="outline" onClick={() => window.location.reload()}>Try Again</Button>
      </div>
    );
  }

  const products = data?.products || [];
  const total = data?.total || 0;
  const isNextDisabled = page * limit >= total;

  return (
    <div className="flex flex-col gap-6 p-4 md:p-8 mx-auto w-full max-w-7xl">
      <div className="flex justify-between items-center">
        <h1 className="text-3xl font-bold tracking-tight">Products</h1>
        <Button className="bg-primary text-primary-foreground" onClick={() => setIsAddOpen(true)}>Add Product</Button>
      </div>

      <div className="flex flex-col sm:flex-row justify-between items-center gap-4 bg-card text-card-foreground p-4 rounded-md border shadow-sm">
        <form onSubmit={handleSearch} className="flex items-center gap-2 w-full max-w-md">
          <Input
            type="text"
            placeholder="Search products..."
            value={searchInput}
            onChange={(e) => setSearchInput(e.target.value)}
          />
          <Button type="submit" variant="secondary">Search</Button>
        </form>

        <div className="flex items-center gap-4 w-full sm:w-auto overflow-x-auto">
          <div className="flex items-center gap-2">
            <span className="text-sm font-medium text-muted-foreground whitespace-nowrap">Filter:</span>
            <select
              value={categoryFilter}
              onChange={handleCategoryChange}
              className="flex h-9 items-center justify-between whitespace-nowrap rounded-md border border-input bg-transparent px-3 py-2 text-sm shadow-sm ring-offset-background placeholder:text-muted-foreground focus:outline-none focus:ring-1 focus:ring-ring disabled:cursor-not-allowed disabled:opacity-50 [&>span]:line-clamp-1 w-[140px]"
            >
              <option value="">All Categories</option>
              <option value="beauty">Beauty</option>
              <option value="fragrances">Fragrances</option>
              <option value="furniture">Furniture</option>
              <option value="groceries">Groceries</option>
            </select>
          </div>
          <div className="flex items-center gap-2">
            <span className="text-sm font-medium text-muted-foreground whitespace-nowrap">Sort by:</span>
            <Button variant={sortBy === "title" ? "default" : "outline"} size="sm" onClick={() => toggleSort("title")}>
              Title {sortBy === "title" && (order === "asc" ? "↑" : "↓")}
            </Button>
            <Button variant={sortBy === "price" ? "default" : "outline"} size="sm" onClick={() => toggleSort("price")}>
              Price {sortBy === "price" && (order === "asc" ? "↑" : "↓")}
            </Button>
          </div>
        </div>
      </div>

      <div className="rounded-md border bg-card text-card-foreground shadow-sm overflow-hidden">
        <Table>
          <TableHeader>
            <TableRow>
              <TableHead className="w-[80px]">ID</TableHead>
              <TableHead>Title</TableHead>
              <TableHead>Category</TableHead>
              <TableHead className="text-right">Price</TableHead>
              <TableHead className="text-right w-[150px]">Actions</TableHead>
            </TableRow>
          </TableHeader>
          <TableBody>
            {isLoading ? (
              Array.from({ length: 5 }).map((_, i) => (
                <TableRow key={i}>
                  <TableCell><Skeleton className="h-5 w-12" /></TableCell>
                  <TableCell><Skeleton className="h-5 w-48" /></TableCell>
                  <TableCell><Skeleton className="h-5 w-24" /></TableCell>
                  <TableCell className="text-right"><Skeleton className="h-5 w-16 ml-auto" /></TableCell>
                  <TableCell className="text-right">
                    <div className="flex justify-end gap-2">
                      <Skeleton className="h-8 w-16" />
                      <Skeleton className="h-8 w-10" />
                    </div>
                  </TableCell>
                </TableRow>
              ))
            ) : products.length === 0 ? (
              <TableRow>
                <TableCell colSpan={5} className="h-32 text-center text-muted-foreground">No products found.</TableCell>
              </TableRow>
            ) : (
              products.map((product) => (
                <TableRow key={product.id}>
                  <TableCell className="font-medium">{product.id}</TableCell>
                  <TableCell>{product.title}</TableCell>
                  <TableCell className="capitalize">{product.category}</TableCell>
                  <TableCell className="text-right">${product.price.toFixed(2)}</TableCell>
                  <TableCell className="text-right">
                    <div className="flex justify-end gap-2">
                      <Button variant="outline" size="sm" onClick={() => router.push(`/products/${product.id}`)}>
                        Edit
                      </Button>
                      <Button variant="destructive" size="sm" onClick={() => setDeleteId(product.id)}>
                        <Trash2 className="h-4 w-4" />
                      </Button>
                    </div>
                  </TableCell>
                </TableRow>
              ))
            )}
          </TableBody>
        </Table>
      </div>

      <div className="flex justify-between items-center px-2 py-4">
        <div className="text-sm text-muted-foreground">
          Showing {total === 0 ? 0 : skip + 1} to {Math.min(skip + limit, total)} of {total} products
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

      {/* Add Product Dialog */}
      <Dialog open={isAddOpen} onOpenChange={setIsAddOpen}>
        <DialogContent className="bg-background">
          <DialogHeader>
            <DialogTitle>Add New Product</DialogTitle>
          </DialogHeader>
          <form onSubmit={handleSubmit((d) => addMutation.mutate(d))} className="flex flex-col gap-4 mt-4">
            <div className="space-y-2">
              <label className="text-sm font-medium">Title</label>
              <Input {...register("title")} className={errors.title ? "border-red-500" : ""} />
              {errors.title && <p className="text-red-500 text-sm">{errors.title.message}</p>}
            </div>
            <div className="space-y-2">
              <label className="text-sm font-medium">Price ($)</label>
              <Input type="number" step="0.01" {...register("price")} className={errors.price ? "border-red-500" : ""} />
              {errors.price && <p className="text-red-500 text-sm">{errors.price.message}</p>}
            </div>
            <div className="space-y-2">
              <label className="text-sm font-medium">Category</label>
              <Input {...register("category")} className={errors.category ? "border-red-500" : ""} />
              {errors.category && <p className="text-red-500 text-sm">{errors.category.message}</p>}
            </div>
            <DialogFooter className="mt-4">
              <Button type="button" variant="outline" onClick={() => setIsAddOpen(false)}>Cancel</Button>
              <Button type="submit" disabled={addMutation.isPending}>{addMutation.isPending ? "Adding..." : "Add Product"}</Button>
            </DialogFooter>
          </form>
        </DialogContent>
      </Dialog>

      {/* Delete Confirmation Dialog */}
      <Dialog open={deleteId !== null} onOpenChange={(open) => !open && setDeleteId(null)}>
        <DialogContent className="bg-background">
          <DialogHeader>
            <DialogTitle>Delete Product</DialogTitle>
          </DialogHeader>
          <p className="py-4 text-muted-foreground">Are you sure you want to delete this product? This action cannot be undone.</p>
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
