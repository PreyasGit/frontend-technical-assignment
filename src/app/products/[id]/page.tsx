"use client";

import { use, useEffect, useState } from "react";
import Link from "next/link";
import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import { useForm } from "react-hook-form";
import { yupResolver } from "@hookform/resolvers/yup";
import * as yup from "yup";
import axiosInstance from "@/lib/axios";

import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Skeleton } from "@/components/ui/skeleton";

interface Product {
  id: number;
  title: string;
  category: string;
  price: number;
  description: string;
  thumbnail: string;
}

const schema = yup.object().shape({
  title: yup.string().required("Title is required"),
  price: yup
    .number()
    .typeError("Price must be a valid number")
    .positive("Price must be a positive number")
    .required("Price is required"),
  description: yup.string().required("Description is required"),
});

type FormData = yup.InferType<typeof schema>;

export default function ProductEditPage({ params }: { params: Promise<{ id: string }> }) {
  const { id } = use(params);
  const queryClient = useQueryClient();
  const [successMsg, setSuccessMsg] = useState("");

  const { data: product, isLoading, isError } = useQuery({
    queryKey: ["products", id],
    queryFn: async (): Promise<Product> => {
      const { data } = await axiosInstance.get(`/products/${id}`);
      return data;
    },
  });

  const {
    register,
    handleSubmit,
    reset,
    formState: { errors },
  } = useForm<FormData>({
    resolver: yupResolver(schema),
  });

  useEffect(() => {
    if (product) {
      reset({
        title: product.title,
        price: product.price,
        description: product.description,
      });
    }
  }, [product, reset]);

  const updateMutation = useMutation({
    mutationFn: async (updatedData: FormData) => {
      const { data } = await axiosInstance.put(`/products/${id}`, updatedData);
      return data;
    },
    onSuccess: () => {
      setSuccessMsg("Product updated successfully!");
      queryClient.invalidateQueries({ queryKey: ["products", id] });
      // Clear the message after a few seconds
      setTimeout(() => setSuccessMsg(""), 3000);
    },
    onError: (error) => {
      alert(`Error updating product: ${error.message}`);
    },
  });

  const onSubmit = (data: FormData) => {
    updateMutation.mutate(data);
  };

  if (isLoading) {
    return (
      <div className="max-w-2xl mx-auto flex flex-col gap-6 w-full">
        <Skeleton className="h-6 w-32" />
        <div className="flex flex-col md:flex-row gap-6 items-start bg-white p-6 rounded-lg border">
          <Skeleton className="h-48 w-full md:w-48 rounded-md" />
          <div className="flex-1 space-y-4 w-full">
            <Skeleton className="h-10 w-3/4" />
            <Skeleton className="h-6 w-1/4 rounded-full" />
          </div>
        </div>
        <div className="bg-white p-6 rounded-lg border space-y-6">
          <Skeleton className="h-6 w-1/4" />
          <div className="space-y-4">
            <Skeleton className="h-10 w-full" />
            <Skeleton className="h-10 w-full" />
            <Skeleton className="h-32 w-full" />
            <Skeleton className="h-10 w-32" />
          </div>
        </div>
      </div>
    );
  }

  if (isError || !product) {
    return (
      <div className="max-w-2xl mx-auto p-6 bg-red-50 text-red-700 border border-red-200 rounded-lg shadow-sm">
        <h2 className="text-xl font-bold mb-2">Error</h2>
        <p>Could not load the product details. Please try again.</p>
        <Link href="/products" className="text-primary hover:underline mt-4 inline-flex font-medium">
          &larr; Back to Products
        </Link>
      </div>
    );
  }

  return (
    <div className="max-w-2xl mx-auto flex flex-col gap-6 w-full">
      <Link href="/products" className="text-primary hover:underline self-start font-medium transition-colors hover:text-blue-700">
        &larr; Back to Products
      </Link>

      <div className="flex flex-col md:flex-row gap-6 items-start bg-white p-6 rounded-lg border shadow-sm">
        {product.thumbnail && (
          <img
            src={product.thumbnail}
            alt={product.title}
            className="w-full md:w-48 h-auto aspect-square object-contain bg-gray-50 rounded-md border"
          />
        )}
        <div className="flex flex-col gap-3 w-full">
          <h1 className="text-3xl font-bold text-foreground leading-tight">{product.title}</h1>
          <span className="inline-flex px-3 py-1 bg-secondary/10 text-secondary rounded-full text-sm font-medium w-fit capitalize">
            {product.category}
          </span>
        </div>
      </div>

      <div className="bg-white p-6 rounded-lg border shadow-sm">
        <h2 className="text-xl font-bold mb-6 text-foreground">Edit Product details</h2>
        
        {successMsg && (
          <div className="mb-6 p-4 bg-green-50 text-green-700 border border-green-200 rounded-md font-medium text-sm flex items-center gap-2">
            <svg xmlns="http://www.w3.org/2000/svg" className="h-5 w-5" viewBox="0 0 20 20" fill="currentColor">
              <path fillRule="evenodd" d="M10 18a8 8 0 100-16 8 8 0 000 16zm3.707-9.293a1 1 0 00-1.414-1.414L9 10.586 7.707 9.293a1 1 0 00-1.414 1.414l2 2a1 1 0 001.414 0l4-4z" clipRule="evenodd" />
            </svg>
            {successMsg}
          </div>
        )}

        <form onSubmit={handleSubmit(onSubmit)} className="flex flex-col gap-5">
          <div className="space-y-2">
            <label htmlFor="title" className="text-sm font-semibold text-foreground">
              Title
            </label>
            <Input 
              id="title" 
              {...register("title")} 
              className={errors.title ? "border-red-500 focus-visible:ring-red-500" : ""}
            />
            {errors.title && (
              <p className="text-red-500 text-sm font-medium mt-1">{errors.title.message}</p>
            )}
          </div>

          <div className="space-y-2">
            <label htmlFor="price" className="text-sm font-semibold text-foreground">
              Price ($)
            </label>
            <Input 
              id="price" 
              type="number" 
              step="0.01" 
              {...register("price")} 
              className={errors.price ? "border-red-500 focus-visible:ring-red-500" : ""}
            />
            {errors.price && (
              <p className="text-red-500 text-sm font-medium mt-1">{errors.price.message}</p>
            )}
          </div>

          <div className="space-y-2">
            <label htmlFor="description" className="text-sm font-semibold text-foreground">
              Description
            </label>
            <textarea
              id="description"
              {...register("description")}
              className={`flex min-h-[120px] w-full rounded-md border bg-background px-3 py-2 text-sm ring-offset-background placeholder:text-muted-foreground focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring focus-visible:ring-offset-2 disabled:cursor-not-allowed disabled:opacity-50 resize-y ${
                errors.description ? "border-red-500 focus-visible:ring-red-500" : "border-input"
              }`}
            />
            {errors.description && (
              <p className="text-red-500 text-sm font-medium mt-1">{errors.description.message}</p>
            )}
          </div>

          <div className="pt-2">
            <Button type="submit" disabled={updateMutation.isPending} className="w-full sm:w-auto font-semibold">
              {updateMutation.isPending ? "Saving Changes..." : "Save Changes"}
            </Button>
          </div>
        </form>
      </div>
    </div>
  );
}
