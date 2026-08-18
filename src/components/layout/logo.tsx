import { LineSquiggle } from "lucide-react";

import { cn } from "@/lib/utils";

export interface LogoProps {
  className?: string;
  /** Hides the wordmark, leaving only the mark. */
  markOnly?: boolean;
}

/** Application logo: the squiggle mark plus the product wordmark. */
export function Logo({ className, markOnly = false }: LogoProps) {
  return (
    <span className={cn("inline-flex items-center gap-2", className)}>
      <span className="flex size-8 shrink-0 items-center justify-center rounded-md bg-primary">
        <LineSquiggle aria-hidden className="size-5 text-primary-foreground" />
      </span>
      {markOnly ? null : (
        <span className="text-lg font-bold tracking-tight text-foreground">
          Infiniqe<span className="text-primary">CRUD</span>
        </span>
      )}
    </span>
  );
}
