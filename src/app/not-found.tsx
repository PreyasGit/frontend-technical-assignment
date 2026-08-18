import type { Metadata } from "next";
import Link from "next/link";
import { Compass, Home } from "lucide-react";

import { Button } from "@/components/ui/button";
import { navItems } from "@/config/site";

export const metadata: Metadata = {
  title: "Page not found",
  description: "The page you are looking for does not exist.",
};

/** Custom 404 screen shown for any unmatched route. */
export default function NotFound() {
  return (
    <div className="flex min-h-[60vh] flex-col items-center justify-center gap-6 text-center">
      <span className="flex size-16 items-center justify-center rounded-full bg-primary/10">
        <Compass className="size-8 text-primary" />
      </span>

      <div className="space-y-2">
        <p className="text-sm font-semibold tracking-widest text-primary uppercase">
          Error 404
        </p>
        <h1 className="text-3xl font-bold tracking-tight text-foreground sm:text-4xl">
          This page could not be found
        </h1>
        <p className="mx-auto max-w-md text-muted-foreground">
          The page you are looking for may have been moved, renamed, or never
          existed. Try one of the modules below instead.
        </p>
      </div>

      <Button render={<Link href="/" />}>
        <Home />
        Back to dashboard
      </Button>

      <nav aria-label="Suggested pages" className="flex flex-wrap justify-center gap-2">
        {navItems
          .filter((item) => item.href !== "/")
          .map((item) => (
            <Link
              key={item.href}
              href={item.href}
              className="inline-flex items-center gap-2 rounded-md border border-border px-3 py-2 text-sm font-medium text-muted-foreground transition-colors hover:border-primary/40 hover:text-primary"
            >
              <item.icon className="size-4" />
              {item.label}
            </Link>
          ))}
      </nav>
    </div>
  );
}
