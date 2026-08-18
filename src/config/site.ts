import type { LucideIcon } from "lucide-react";
import { LayoutDashboard, Package, Users, UtensilsCrossed } from "lucide-react";

export interface NavItem {
  label: string;
  href: string;
  icon: LucideIcon;
  description: string;
}

export const siteConfig = {
  name: "Infiniqe Console",
  shortName: "Infiniqe",
  description:
    "A Next.js App Router CRUD console for managing products, users and recipes with server-side search, sorting and pagination.",
  url: "https://infiniqe-console.local",
} as const;

export const navItems: NavItem[] = [
  {
    label: "Dashboard",
    href: "/",
    icon: LayoutDashboard,
    description: "Overview of every module in the console.",
  },
  {
    label: "Products",
    href: "/products",
    icon: Package,
    description:
      "Browse the catalogue with server-side search, sorting and pagination.",
  },
  {
    label: "Users",
    href: "/users",
    icon: Users,
    description:
      "Full user CRUD on a single page using a modal and a details drawer.",
  },
  {
    label: "Recipes",
    href: "/recipes",
    icon: UtensilsCrossed,
    description: "Responsive recipe cards with search and pagination.",
  },
];

/** Number of records requested per page across every listing screen. */
export const DEFAULT_PAGE_SIZE = 10;
