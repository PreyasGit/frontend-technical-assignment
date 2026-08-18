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

export default function ProductsPage() {
  const router = useRouter();
  const pathname = usePathname();
  const searchParams = useSearchParams();

  const query = searchParams.get("query") || "";
  const page = parseInt(searchParams.get("page") || "1", 10);
  const sortBy = searchParams.get("sortBy") || "title";
  const order = searchParams.get("order") || "asc";

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

  const fetchProducts = async (): Promise<ProductsResponse> => {
    let url = "";
    if (query) {
      url = `/products/search?q=${query}&limit=${limit}&skip=${skip}&sortBy=${sortBy}&order=${order}`;
    } else {
      url = `/products?limit=${limit}&skip=${skip}&sortBy=${sortBy}&order=${order}`;
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
    queryKey: ["products", query, page, sortBy, order],
    queryFn: fetchProducts,
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

  const toggleSort = (field: string) => {
    let newOrder = "asc";
    if (sortBy === field && order === "asc") {
      newOrder = "desc";
    }
    const params = new URLSearchParams(searchParams.toString());
    params.set("sortBy", field);
    params.set("order", newOrder);
    params.set("page", "1"); // Optional: Reset pagination on sort
    router.push(`${pathname}?${params.toString()}`);
  };

  if (isError) {
    return (
      <div className="flex flex-col items-center justify-center p-8 mt-12 border border-red-200 bg-red-50 text-red-700 rounded-lg max-w-lg mx-auto text-center">
        <h3 className="text-xl font-semibold mb-2">Failed to load products</h3>
        <p className="mb-4 text-sm opacity-90">
          {error instanceof Error ? error.message : "An unknown error occurred. Please try again later."}
        </p>
        <Button
          variant="outline"
          className="bg-white border-red-200 text-red-700 hover:bg-red-50"
          onClick={() => window.location.reload()}
        >
          Try Again
        </Button>
      </div>
    );
  }

  const products = data?.products || [];
  const total = data?.total || 0;
  const isNextDisabled = page * limit >= total;

  return (
    <div className="flex flex-col gap-6">
      <div className="flex items-center justify-between">
        <h1 className="text-3xl font-bold tracking-tight text-foreground">Products</h1>
        <Button>Add Product</Button>
      </div>

      {/* Controls UI */}
      <div className="flex flex-col sm:flex-row gap-4 items-center justify-between bg-white p-4 rounded-md border">
        <form onSubmit={handleSearch} className="flex items-center gap-2 w-full sm:w-auto">
          <Input
            type="text"
            placeholder="Search products..."
            value={searchInput}
            onChange={(e) => setSearchInput(e.target.value)}
            className="w-full sm:w-[300px]"
          />
          <Button type="submit" variant="secondary">Search</Button>
        </form>

        <div className="flex items-center gap-2 w-full sm:w-auto">
          <span className="text-sm font-medium text-secondary">Sort by:</span>
          <Button
            variant={sortBy === "title" ? "default" : "outline"}
            size="sm"
            onClick={() => toggleSort("title")}
          >
            Title {sortBy === "title" && (order === "asc" ? "↑" : "↓")}
          </Button>
          <Button
            variant={sortBy === "price" ? "default" : "outline"}
            size="sm"
            onClick={() => toggleSort("price")}
          >
            Price {sortBy === "price" && (order === "asc" ? "↑" : "↓")}
          </Button>
        </div>
      </div>

      <div className="rounded-md border bg-white overflow-x-auto">
        <Table>
          <TableHeader>
            <TableRow>
              <TableHead className="w-[100px]">ID</TableHead>
              <TableHead>Title</TableHead>
              <TableHead>Category</TableHead>
              <TableHead className="text-right">Price</TableHead>
              <TableHead className="text-right">Actions</TableHead>
            </TableRow>
          </TableHeader>
          <TableBody>
            {isLoading ? (
              Array.from({ length: 5 }).map((_, i) => (
                <TableRow key={i}>
                  <TableCell>
                    <Skeleton className="h-5 w-12" />
                  </TableCell>
                  <TableCell>
                    <Skeleton className="h-5 w-48" />
                  </TableCell>
                  <TableCell>
                    <Skeleton className="h-5 w-24" />
                  </TableCell>
                  <TableCell className="text-right">
                    <Skeleton className="h-5 w-16 ml-auto" />
                  </TableCell>
                  <TableCell className="text-right">
                    <div className="flex justify-end gap-2">
                      <Skeleton className="h-8 w-16" />
                      <Skeleton className="h-8 w-16" />
                    </div>
                  </TableCell>
                </TableRow>
              ))
            ) : products.length === 0 ? (
              <TableRow>
                <TableCell colSpan={5} className="h-32 text-center text-secondary">
                  No products found.
                </TableCell>
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
                      <Button variant="outline" size="sm">
                        View
                      </Button>
                      <Button variant="ghost" size="sm">
                        Edit
                      </Button>
                    </div>
                  </TableCell>
                </TableRow>
              ))
            )}
          </TableBody>
        </Table>
      </div>

      {/* Pagination UI */}
      <div className="flex items-center justify-between">
        <div className="text-sm text-secondary">
          Showing {total === 0 ? 0 : skip + 1} to {Math.min(skip + limit, total)} of {total} products
        </div>
        <div className="flex items-center gap-2">
          <Button
            variant="outline"
            size="sm"
            disabled={page <= 1}
            onClick={() => router.push(`${pathname}?${createQueryString("page", String(page - 1))}`)}
          >
            Previous
          </Button>
          <Button
            variant="outline"
            size="sm"
            disabled={isNextDisabled}
            onClick={() => router.push(`${pathname}?${createQueryString("page", String(page + 1))}`)}
          >
            Next
          </Button>
        </div>
      </div>
    </div>
  );
}
