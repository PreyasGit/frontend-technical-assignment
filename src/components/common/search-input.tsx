"use client";

import { useEffect, useRef, useState } from "react";
import { Search, X } from "lucide-react";

import { Input } from "@/components/ui/input";
import { useDebounce } from "@/hooks/use-debounce";
import { cn } from "@/lib/utils";

export interface SearchInputProps {
  /** Committed search term, normally read from the URL. */
  value: string;
  onChange: (value: string) => void;
  placeholder?: string;
  /** Debounce window before `onChange` fires, in milliseconds. */
  delay?: number;
  className?: string;
  label?: string;
}

/**
 * Debounced search field.
 *
 * Typing updates local state immediately while the committed value (URL plus
 * server request) only changes once typing pauses.
 */
export function SearchInput({
  value,
  onChange,
  placeholder = "Search…",
  delay = 450,
  className,
  label = "Search",
}: SearchInputProps) {
  const [draft, setDraft] = useState(value);
  const [committedValue, setCommittedValue] = useState(value);
  const debouncedDraft = useDebounce(draft, delay);

  // Callers pass inline closures, so the latest props are mirrored into refs to
  // keep the debounce effect free of unstable dependencies.
  const latestProps = useRef({ value, onChange });
  useEffect(() => {
    latestProps.current = { value, onChange };
  });

  // The committed value can also change from outside (back button, "Clear
  // filters"). Adjusting state during render is React's recommended
  // alternative to a synchronising effect.
  if (value !== committedValue) {
    setCommittedValue(value);
    setDraft(value);
  }

  useEffect(() => {
    // Only report a term that differs from what is already committed, which
    // also prevents an echo when the value arrives back through the URL.
    if (debouncedDraft === latestProps.current.value) return;
    latestProps.current.onChange(debouncedDraft);
  }, [debouncedDraft]);

  return (
    <div className={cn("relative w-full", className)}>
      <Search
        aria-hidden
        className="pointer-events-none absolute top-1/2 left-2.5 size-4 -translate-y-1/2 text-muted-foreground"
      />
      <Input
        type="search"
        aria-label={label}
        value={draft}
        placeholder={placeholder}
        onChange={(event) => setDraft(event.target.value)}
        className="pl-8 [&::-webkit-search-cancel-button]:hidden"
      />
      {draft ? (
        <button
          type="button"
          aria-label="Clear search"
          onClick={() => setDraft("")}
          className="absolute top-1/2 right-2 -translate-y-1/2 cursor-pointer rounded-sm p-0.5 text-muted-foreground transition-colors outline-none hover:text-foreground focus-visible:ring-3 focus-visible:ring-ring/50"
        >
          <X className="size-4" />
        </button>
      ) : null}
    </div>
  );
}
