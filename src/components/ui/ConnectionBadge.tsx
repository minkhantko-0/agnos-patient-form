import type { ConnectionState } from "@/lib/realtime/protocol";

const COPY: Record<ConnectionState, { label: string; className: string }> = {
  connecting: {
    label: "Connecting…",
    className: "text-ink-muted",
  },
  connected: {
    label: "Live",
    className: "text-[var(--status-submitted)]",
  },
  error: {
    label: "Connection lost",
    className: "text-danger",
  },
  closed: {
    label: "Disconnected",
    className: "text-ink-muted",
  },
};

export function ConnectionBadge({ state }: { state: ConnectionState }) {
  const { label, className } = COPY[state];

  return (
    <span
      className={`inline-flex items-center gap-1.5 text-xs font-medium ${className}`}
      // Screen readers should hear connection drops without needing focus.
      role="status"
      aria-live="polite"
    >
      <span className="h-1.5 w-1.5 rounded-full bg-current" />
      {label}
    </span>
  );
}
