import type { ConnectionState } from "@/lib/realtime/protocol";
import { cn } from "@/lib/utils";

const COPY: Record<ConnectionState, { label: string; className: string }> = {
  connecting: {
    label: "Connecting…",
    className: "text-muted-foreground",
  },
  connected: {
    label: "Live",
    className: "text-status-submitted",
  },
  error: {
    label: "Connection lost",
    className: "text-destructive",
  },
  closed: {
    label: "Disconnected",
    className: "text-muted-foreground",
  },
};

export function ConnectionBadge({ state }: { state: ConnectionState }) {
  const { label, className } = COPY[state];

  return (
    <span
      className={cn(
        "inline-flex items-center gap-1.5 text-xs font-medium",
        className,
      )}
      // Screen readers should hear connection drops without needing focus.
      role="status"
      aria-live="polite"
    >
      <span className="size-1.5 rounded-full bg-current" />
      {label}
    </span>
  );
}
