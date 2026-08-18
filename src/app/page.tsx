import Link from "next/link";
import { Package, Users, Utensils } from "lucide-react";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";

export default function Home() {
  return (
    <div className="flex flex-col gap-8 max-w-6xl mx-auto py-10 w-full">
      <div className="flex flex-col gap-3">
        <h1 className="text-4xl font-bold tracking-tight text-foreground">Welcome to Infiniqe Dashboard</h1>
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
            <Button asChild className="w-full font-semibold">
              <Link href="/products">Go to Products</Link>
            </Button>
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
            <Button asChild className="w-full font-semibold">
              <Link href="/users">Go to Users</Link>
            </Button>
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
            <Button asChild className="w-full font-semibold">
              <Link href="/recipes">Go to Recipes</Link>
            </Button>
          </CardContent>
        </Card>
      </div>
    </div>
  );
}
