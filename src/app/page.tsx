import Link from "next/link";
import { Package, Users, Utensils } from "lucide-react";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { buttonVariants } from "@/components/ui/button";
import { cn } from "@/lib/utils";

export default function Home() {
  return (
    <div className="flex flex-col gap-8 max-w-6xl mx-auto py-10 w-full px-4">
      <div className="flex flex-col gap-3">
        <h1 className="text-4xl font-bold tracking-tight text-foreground">Welcome to infiniqeCRUDapp Dashboard</h1>
        <p className="text-lg text-secondary max-w-2xl">
          Manage your application's data, users, and content from one centralized location.
        </p>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
        {/* Products Card */}
        <Card className="flex flex-col h-full hover:shadow-md transition-shadow">
          <CardHeader>
            <CardTitle className="flex items-center gap-3">
              <Package className="h-7 w-7 text-primary" />
              Manage Products
            </CardTitle>
          </CardHeader>
          <CardContent className="flex flex-col flex-1 gap-6">
            <p className="text-secondary flex-1 leading-relaxed">
              View, search, edit, and manage the entire product catalog and inventory list.
            </p>
            <Link 
              href="/products" 
              className={cn(buttonVariants({ variant: "default" }), "w-full font-semibold")}
            >
              Go to Products
            </Link>
          </CardContent>
        </Card>

        {/* Users Card */}
        <Card className="flex flex-col h-full hover:shadow-md transition-shadow">
          <CardHeader>
            <CardTitle className="flex items-center gap-3">
              <Users className="h-7 w-7 text-primary" />
              View Users
            </CardTitle>
          </CardHeader>
          <CardContent className="flex flex-col flex-1 gap-6">
            <p className="text-secondary flex-1 leading-relaxed">
              Browse and search through all registered application users and customer data.
            </p>
            <Link 
              href="/users" 
              className={cn(buttonVariants({ variant: "default" }), "w-full font-semibold")}
            >
              Go to Users
            </Link>
          </CardContent>
        </Card>

        {/* Recipes Card */}
        <Card className="flex flex-col h-full hover:shadow-md transition-shadow">
          <CardHeader>
            <CardTitle className="flex items-center gap-3">
              <Utensils className="h-7 w-7 text-primary" />
              Browse Recipes
            </CardTitle>
          </CardHeader>
          <CardContent className="flex flex-col flex-1 gap-6">
            <p className="text-secondary flex-1 leading-relaxed">
              Explore the culinary collection, complete with difficulty levels and prep times.
            </p>
            <Link 
              href="/recipes" 
              className={cn(buttonVariants({ variant: "default" }), "w-full font-semibold")}
            >
              Go to Recipes
            </Link>
          </CardContent>
        </Card>
      </div>
    </div>
  );
}