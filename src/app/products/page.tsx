"use client";

import { useQuery } from "@tanstack/react-query";
import axiosInstance from "@/lib/axios";
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

interface Product {
  id: number;
  title: string;
  category: string;
  price: number;
}

export default function ProductsPage() {
  const fetchProducts = async (): Promise<Product[]> => {
    const { data } = await axiosInstance.get("/products");
    return data.products;
  };

  const {
    data: products,
    isLoading,
    isError,
    error,
  } = useQuery({
    queryKey: ["products"],
    queryFn: fetchProducts,
  });

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

  return (
    <div className="flex flex-col gap-6">
      <div className="flex items-center justify-between">
        <h1 className="text-3xl font-bold tracking-tight text-foreground">Products</h1>
        <Button>Add Product</Button>
      </div>

      <div className="rounded-md border bg-white">
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
            ) : products?.length === 0 ? (
              <TableRow>
                <TableCell colSpan={5} className="h-32 text-center text-secondary">
                  No products found.
                </TableCell>
              </TableRow>
            ) : (
              products?.map((product) => (
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
    </div>
  );
}
