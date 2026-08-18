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

interface User {
  id: number;
  firstName: string;
  lastName: string;
  age: number;
  email: string;
  phone: string;
}

interface UsersResponse {
  users: User[];
  total: number;
  skip: number;
  limit: number;
}

export default function UsersPage() {
  const router = useRouter();
  const pathname = usePathname();
  const searchParams = useSearchParams();

  const query = searchParams.get("query") || "";
  const page = parseInt(searchParams.get("page") || "1", 10);
  const sortBy = searchParams.get("sortBy") || "firstName";
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

  const fetchUsers = async (): Promise<UsersResponse> => {
    let url = "";
    if (query) {
      url = `/users/search?q=${query}&limit=${limit}&skip=${skip}`;
    } else {
      url = `/users?limit=${limit}&skip=${skip}&sortBy=${sortBy}&order=${order}`;
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
    queryKey: ["users", query, page, sortBy, order],
    queryFn: fetchUsers,
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
        <h3 className="text-xl font-bold mb-2">Failed to load users</h3>
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

  const users = data?.users || [];
  const total = data?.total || 0;
  const isNextDisabled = page * limit >= total;

  return (
    <div className="flex flex-col gap-6 w-full">
      <div className="flex items-center justify-between">
        <h1 className="text-3xl font-bold tracking-tight text-foreground">Users</h1>
        <Button className="font-semibold">Add User</Button>
      </div>

      {/* Controls UI */}
      <div className="flex flex-col sm:flex-row gap-4 items-center justify-between bg-white p-4 rounded-lg border shadow-sm">
        <form onSubmit={handleSearch} className="flex items-center gap-2 w-full sm:w-auto">
          <Input
            type="text"
            placeholder="Search users..."
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
              <TableHead className="font-semibold">Full Name</TableHead>
              <TableHead className="font-semibold">Age</TableHead>
              <TableHead className="font-semibold">Email</TableHead>
              <TableHead className="font-semibold text-right">Phone</TableHead>
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
                    <Skeleton className="h-5 w-40" />
                  </TableCell>
                  <TableCell>
                    <Skeleton className="h-5 w-8" />
                  </TableCell>
                  <TableCell>
                    <Skeleton className="h-5 w-48" />
                  </TableCell>
                  <TableCell className="text-right">
                    <Skeleton className="h-5 w-32 ml-auto" />
                  </TableCell>
                </TableRow>
              ))
            ) : users.length === 0 ? (
              <TableRow>
                <TableCell colSpan={5} className="h-32 text-center text-secondary font-medium">
                  No users found.
                </TableCell>
              </TableRow>
            ) : (
              users.map((user) => (
                <TableRow key={user.id}>
                  <TableCell className="font-medium text-secondary">{user.id}</TableCell>
                  <TableCell className="font-medium text-foreground">
                    {user.firstName} {user.lastName}
                  </TableCell>
                  <TableCell>{user.age}</TableCell>
                  <TableCell>{user.email}</TableCell>
                  <TableCell className="text-right text-secondary">{user.phone}</TableCell>
                </TableRow>
              ))
            )}
          </TableBody>
        </Table>
      </div>

      {/* Pagination UI */}
      <div className="flex items-center justify-between">
        <div className="text-sm font-medium text-secondary">
          Showing {total === 0 ? 0 : skip + 1} to {Math.min(skip + limit, total)} of {total} users
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
