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

const userSchema = yup.object().shape({
  firstName: yup.string().required("First name is required"),
  lastName: yup.string().required("Last name is required"),
  age: yup
    .number()
    .typeError("Age must be a number")
    .positive("Age must be positive")
    .integer("Age must be an integer")
    .required("Age is required"),
  email: yup.string().email("Invalid email").required("Email is required"),
});
type UserFormData = yup.InferType<typeof userSchema>;

export default function UsersPage() {
  const router = useRouter();
  const pathname = usePathname();
  const searchParams = useSearchParams();
  const queryClient = useQueryClient();

  const query = searchParams.get("query") || "";
  const page = parseInt(searchParams.get("page") || "1", 10);
  const sortBy = searchParams.get("sortBy") || "firstName";
  const order = searchParams.get("order") || "asc";
  const genderFilter = searchParams.get("gender") || "";

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

  const fetchUsers = async (): Promise<UsersResponse> => {
    let url = "";
    if (genderFilter) {
      url = `/users/filter?key=gender&value=${genderFilter}&limit=${limit}&skip=${skip}&sortBy=${sortBy}&order=${order}`;
    } else if (query) {
      url = `/users/search?q=${query}&limit=${limit}&skip=${skip}`;
    } else {
      url = `/users?limit=${limit}&skip=${skip}&sortBy=${sortBy}&order=${order}`;
    }
    const { data } = await axiosInstance.get(url);
    return data;
  };

  const { data, isLoading, isError, error } = useQuery({
    queryKey: ["users", query, page, sortBy, order, genderFilter],
    queryFn: fetchUsers,
  });

  const {
    register,
    handleSubmit,
    reset,
    formState: { errors },
  } = useForm<UserFormData>({
    resolver: yupResolver(userSchema),
  });

  const addMutation = useMutation({
    mutationFn: async (newData: UserFormData) => {
      const { data } = await axiosInstance.post("/users/add", newData);
      return data;
    },
    onSuccess: () => {
      toast.success("User created successfully!");
      setIsAddOpen(false);
      reset();
      queryClient.invalidateQueries({ queryKey: ["users"] });
    },
    onError: () => toast.error("Failed to create user"),
  });

  const deleteMutation = useMutation({
    mutationFn: async (id: number) => {
      const { data } = await axiosInstance.delete(`/users/${id}`);
      return data;
    },
    onSuccess: () => {
      toast.success("User deleted successfully!");
      setDeleteId(null);
      queryClient.invalidateQueries({ queryKey: ["users"] });
    },
    onError: () => toast.error("Failed to delete user"),
  });

  const handleSearch = (e: React.FormEvent) => {
    e.preventDefault();
    const params = new URLSearchParams(searchParams.toString());
    if (searchInput) params.set("query", searchInput);
    else params.delete("query");
    params.delete("gender");
    params.set("page", "1");
    router.push(`${pathname}?${params.toString()}`);
  };

  const handleGenderChange = (e: React.ChangeEvent<HTMLSelectElement>) => {
    const val = e.target.value;
    const params = new URLSearchParams(searchParams.toString());
    if (val) params.set("gender", val);
    else params.delete("gender");
    params.delete("query");
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
        <h3 className="text-xl font-semibold mb-2">Failed to load users</h3>
        <p className="mb-4 text-sm opacity-90">{error instanceof Error ? error.message : "An error occurred."}</p>
        <Button variant="outline" onClick={() => window.location.reload()}>Try Again</Button>
      </div>
    );
  }

  const users = data?.users || [];
  const total = data?.total || 0;
  const isNextDisabled = page * limit >= total;

  return (
    <div className="flex flex-col gap-6 p-4 md:p-8 mx-auto w-full max-w-7xl">
      <div className="flex justify-between items-center">
        <h1 className="text-3xl font-bold tracking-tight">Users</h1>
        <Button className="bg-primary text-primary-foreground" onClick={() => setIsAddOpen(true)}>Add User</Button>
      </div>

      <div className="flex flex-col sm:flex-row justify-between items-center gap-4 bg-card text-card-foreground p-4 rounded-md border shadow-sm">
        <form onSubmit={handleSearch} className="flex items-center gap-2 w-full max-w-md">
          <Input
            type="text"
            placeholder="Search users..."
            value={searchInput}
            onChange={(e) => setSearchInput(e.target.value)}
          />
          <Button type="submit" variant="secondary">Search</Button>
        </form>

        <div className="flex items-center gap-4 w-full sm:w-auto overflow-x-auto">
          <div className="flex items-center gap-2">
            <span className="text-sm font-medium text-muted-foreground whitespace-nowrap">Filter:</span>
            <select
              value={genderFilter}
              onChange={handleGenderChange}
              className="flex h-9 items-center justify-between whitespace-nowrap rounded-md border border-input bg-transparent px-3 py-2 text-sm shadow-sm ring-offset-background placeholder:text-muted-foreground focus:outline-none focus:ring-1 focus:ring-ring disabled:cursor-not-allowed disabled:opacity-50 [&>span]:line-clamp-1 w-[120px]"
            >
              <option value="">All Genders</option>
              <option value="male">Male</option>
              <option value="female">Female</option>
            </select>
          </div>
          <div className="flex items-center gap-2">
            <span className="text-sm font-medium text-muted-foreground whitespace-nowrap">Sort by:</span>
            <Button variant={sortBy === "firstName" ? "default" : "outline"} size="sm" onClick={() => toggleSort("firstName")}>
              Name {sortBy === "firstName" && (order === "asc" ? "↑" : "↓")}
            </Button>
            <Button variant={sortBy === "age" ? "default" : "outline"} size="sm" onClick={() => toggleSort("age")}>
              Age {sortBy === "age" && (order === "asc" ? "↑" : "↓")}
            </Button>
          </div>
        </div>
      </div>

      <div className="rounded-md border bg-card text-card-foreground shadow-sm overflow-hidden">
        <Table>
          <TableHeader>
            <TableRow>
              <TableHead className="w-[80px]">ID</TableHead>
              <TableHead>Full Name</TableHead>
              <TableHead>Age</TableHead>
              <TableHead>Email</TableHead>
              <TableHead className="text-right">Phone</TableHead>
              <TableHead className="text-right w-[100px]">Actions</TableHead>
            </TableRow>
          </TableHeader>
          <TableBody>
            {isLoading ? (
              Array.from({ length: 5 }).map((_, i) => (
                <TableRow key={i}>
                  <TableCell><Skeleton className="h-5 w-12" /></TableCell>
                  <TableCell><Skeleton className="h-5 w-32" /></TableCell>
                  <TableCell><Skeleton className="h-5 w-8" /></TableCell>
                  <TableCell><Skeleton className="h-5 w-40" /></TableCell>
                  <TableCell className="text-right"><Skeleton className="h-5 w-24 ml-auto" /></TableCell>
                  <TableCell className="text-right"><Skeleton className="h-8 w-10 ml-auto" /></TableCell>
                </TableRow>
              ))
            ) : users.length === 0 ? (
              <TableRow>
                <TableCell colSpan={6} className="h-32 text-center text-muted-foreground">No users found.</TableCell>
              </TableRow>
            ) : (
              users.map((user) => (
                <TableRow key={user.id}>
                  <TableCell className="font-medium">{user.id}</TableCell>
                  <TableCell>{user.firstName} {user.lastName}</TableCell>
                  <TableCell>{user.age}</TableCell>
                  <TableCell>{user.email}</TableCell>
                  <TableCell className="text-right">{user.phone}</TableCell>
                  <TableCell className="text-right">
                    <Button variant="destructive" size="sm" onClick={() => setDeleteId(user.id)}>
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
          Showing {total === 0 ? 0 : skip + 1} to {Math.min(skip + limit, total)} of {total} users
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

      {/* Add User Dialog */}
      <Dialog open={isAddOpen} onOpenChange={setIsAddOpen}>
        <DialogContent className="bg-background">
          <DialogHeader>
            <DialogTitle>Add New User</DialogTitle>
          </DialogHeader>
          <form onSubmit={handleSubmit((d) => addMutation.mutate(d))} className="flex flex-col gap-4 mt-4">
            <div className="grid grid-cols-2 gap-4">
              <div className="space-y-2">
                <label className="text-sm font-medium">First Name</label>
                <Input {...register("firstName")} className={errors.firstName ? "border-red-500" : ""} />
                {errors.firstName && <p className="text-red-500 text-sm">{errors.firstName.message}</p>}
              </div>
              <div className="space-y-2">
                <label className="text-sm font-medium">Last Name</label>
                <Input {...register("lastName")} className={errors.lastName ? "border-red-500" : ""} />
                {errors.lastName && <p className="text-red-500 text-sm">{errors.lastName.message}</p>}
              </div>
            </div>
            <div className="space-y-2">
              <label className="text-sm font-medium">Age</label>
              <Input type="number" {...register("age")} className={errors.age ? "border-red-500" : ""} />
              {errors.age && <p className="text-red-500 text-sm">{errors.age.message}</p>}
            </div>
            <div className="space-y-2">
              <label className="text-sm font-medium">Email</label>
              <Input type="email" {...register("email")} className={errors.email ? "border-red-500" : ""} />
              {errors.email && <p className="text-red-500 text-sm">{errors.email.message}</p>}
            </div>
            <DialogFooter className="mt-4">
              <Button type="button" variant="outline" onClick={() => setIsAddOpen(false)}>Cancel</Button>
              <Button type="submit" disabled={addMutation.isPending}>{addMutation.isPending ? "Adding..." : "Add User"}</Button>
            </DialogFooter>
          </form>
        </DialogContent>
      </Dialog>

      {/* Delete Confirmation Dialog */}
      <Dialog open={deleteId !== null} onOpenChange={(open) => !open && setDeleteId(null)}>
        <DialogContent className="bg-background">
          <DialogHeader>
            <DialogTitle>Delete User</DialogTitle>
          </DialogHeader>
          <p className="py-4 text-muted-foreground">Are you sure you want to delete this user? This action cannot be undone.</p>
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
