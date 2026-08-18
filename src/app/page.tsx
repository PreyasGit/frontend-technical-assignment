import { ArrowRight } from "lucide-react";

import { PageHeader } from "@/components/common/page-header";
import { ButtonLink } from "@/components/ui/button";
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";
import { navItems, siteConfig } from "@/config/site";

const moduleItems = navItems.filter((item) => item.href !== "/");

const highlights = [
  {
    label: "Products",
    detail: "Server-side search, sorting, pagination and full CRUD across pages.",
  },
  {
    label: "Users",
    detail: "Single-page CRUD with a modal form and a details drawer.",
  },
  {
    label: "Recipes",
    detail: "Responsive card grid plus a server-rendered details page.",
  },
];

export default function DashboardPage() {
  return (
    <div className="flex flex-col gap-10">
      <PageHeader
        title={`Welcome to ${siteConfig.name}`}
        description={siteConfig.description}
      />

      <section aria-labelledby="modules-heading" className="flex flex-col gap-4">
        <h2 id="modules-heading" className="text-lg font-semibold text-foreground">
          Modules
        </h2>

        <div className="grid grid-cols-1 gap-5 md:grid-cols-3">
          {moduleItems.map((item) => (
            <Card key={item.href} className="flex h-full flex-col">
              <CardHeader>
                <span className="flex size-11 items-center justify-center rounded-lg bg-primary/10">
                  <item.icon className="size-5 text-primary" />
                </span>
                <CardTitle>{item.label}</CardTitle>
                <CardDescription>{item.description}</CardDescription>
              </CardHeader>
              <CardContent className="mt-auto">
                <ButtonLink variant="outline" className="w-full" href={item.href}>
                  Open {item.label}
                  <ArrowRight />
                </ButtonLink>
              </CardContent>
            </Card>
          ))}
        </div>
      </section>

      <section
        aria-labelledby="highlights-heading"
        className="rounded-lg border border-border bg-card p-6 shadow-sm"
      >
        <h2 id="highlights-heading" className="text-lg font-semibold text-foreground">
          What is included
        </h2>
        <dl className="mt-4 grid grid-cols-1 gap-5 sm:grid-cols-3">
          {highlights.map((highlight) => (
            <div key={highlight.label} className="space-y-1">
              <dt className="text-sm font-semibold text-primary">
                {highlight.label}
              </dt>
              <dd className="text-sm text-muted-foreground">{highlight.detail}</dd>
            </div>
          ))}
        </dl>
      </section>
    </div>
  );
}
