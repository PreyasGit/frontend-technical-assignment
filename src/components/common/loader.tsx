import { Loader2 } from "lucide-react";

import { cn } from "@/lib/utils";

export interface LoaderProps {
  label?: string;
  className?: string;
  size?: "sm" | "md" | "lg";
}

const sizeClasses: Record<NonNullable<LoaderProps["size"]>, string> = {
  sm: "size-4",
  md: "size-6",
  lg: "size-9",
};

/** Inline spinner used while any asynchronous section is loading. */
export function Loader({ label = "Loading…", className, size = "md" }: LoaderProps) {
  return (
    <div
      role="status"
      aria-live="polite"
      className={cn(
        "flex flex-col items-center justify-center gap-3 py-10 text-muted-foreground",
        className
      )}
    >
      <Loader2 className={cn("animate-spin text-primary", sizeClasses[size])} />
      <span className="text-sm">{label}</span>
    </div>
  );
}

/** Full-height variant used by route-level `loading.tsx` files. */
export function PageLoader({ label = "Loading…" }: { label?: string }) {
  return <Loader label={label} size="lg" className="min-h-[50vh]" />;
}
