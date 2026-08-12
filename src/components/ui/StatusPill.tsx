import { STATUS_LABEL, type SessionStatus } from "@/lib/realtime/protocol";

const STYLE: Record<SessionStatus, { dot: string; pill: string }> = {
  filling: {
    dot: "bg-[var(--status-filling)]",
    pill: "bg-[var(--status-filling-soft)] text-[var(--status-filling)]",
  },
  idle: {
    dot: "bg-[var(--status-idle)]",
    pill: "bg-[var(--status-idle-soft)] text-[var(--status-idle)]",
  },
  submitted: {
    dot: "bg-[var(--status-submitted)]",
    pill: "bg-[var(--status-submitted-soft)] text-[var(--status-submitted)]",
  },
  disconnected: {
    dot: "bg-[var(--status-offline)]",
    pill: "bg-[var(--status-offline-soft)] text-[var(--status-offline)]",
  },
};

export function StatusPill({
  status,
  size = "md",
}: {
  status: SessionStatus;
  size?: "sm" | "md";
}) {
  const style = STYLE[status];

  return (
    <span
      className={`inline-flex shrink-0 items-center gap-1.5 rounded-full font-medium ${style.pill} ${
        size === "sm" ? "px-2 py-0.5 text-xs" : "px-2.5 py-1 text-sm"
      }`}
    >
      <span className="relative flex h-2 w-2">
        {/* Only the active state pulses — a resting indicator that animates
            forever reads as "something is happening" when nothing is. */}
        {status === "filling" && (
          <span
            className={`absolute inline-flex h-full w-full animate-ping rounded-full opacity-75 ${style.dot}`}
          />
        )}
        <span
          className={`relative inline-flex h-2 w-2 rounded-full ${style.dot}`}
        />
      </span>
      {STATUS_LABEL[status]}
    </span>
  );
}
