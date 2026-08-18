import { cn } from "@/lib/utils";

export interface LogoProps {
  className?: string;
  /** Hides the wordmark, leaving only the mark. */
  markOnly?: boolean;
}

/** Application logo: an inline SVG mark plus the product wordmark. */
export function Logo({ className, markOnly = false }: LogoProps) {
  return (
    <span className={cn("inline-flex items-center gap-2", className)}>
      <svg
        viewBox="0 0 32 32"
        aria-hidden
        className="size-8 shrink-0"
        xmlns="http://www.w3.org/2000/svg"
      >
        <rect width="32" height="32" rx="8" className="fill-primary" />
        <path
          d="M10 21.5V10.5h3.4v11H10Zm6.2 0V10.5h4.1c2.6 0 4.3 1.6 4.3 4s-1.7 4-4.3 4h-.7v3Z"
          className="fill-primary-foreground"
        />
        <circle cx="24.5" cy="22" r="2.5" className="fill-accent" />
      </svg>
      {markOnly ? null : (
        <span className="text-lg font-bold tracking-tight text-foreground">
          Infiniqe<span className="text-primary">CRUD</span>
        </span>
      )}
    </span>
  );
}
