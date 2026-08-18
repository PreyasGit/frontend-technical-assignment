import { Badge } from "@/components/ui/badge";
import type { RecordSource } from "@/types/api.types";

export interface SourceBadgeProps {
  source?: RecordSource;
}

/**
 * Marks records that differ from the read-only upstream dataset.
 *
 * Upstream records render nothing, so the badge only draws attention to data
 * the user has actually created or edited.
 */
export function SourceBadge({ source }: SourceBadgeProps) {
  if (!source || source === "upstream") return null;

  return (
    <Badge variant={source === "created" ? "accent" : "default"}>
      {source === "created" ? "New" : "Edited"}
    </Badge>
  );
}
