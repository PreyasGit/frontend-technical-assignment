import { siteConfig } from "@/config/site";

/** Slim application footer. */
export function Footer() {
  return (
    <footer className="border-t border-border bg-card">
      <div className="mx-auto flex w-full max-w-7xl flex-col items-center justify-between gap-2 px-4 py-6 text-sm text-muted-foreground sm:flex-row sm:px-6">
        <p>
          &copy; {new Date().getFullYear()} {siteConfig.name}. Built with Next.js
          App Router.
        </p>
        <p>
          Data provided by{" "}
          <a
            href="https://dummyjson.com"
            target="_blank"
            rel="noreferrer"
            className="font-medium text-primary hover:underline"
          >
            DummyJSON
          </a>
        </p>
      </div>
    </footer>
  );
}
