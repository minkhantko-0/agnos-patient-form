import { Badge } from "@/components/ui/badge";
import { STATUS_LABEL, type SessionStatus } from "@/lib/realtime/protocol";
import { cn } from "@/lib/utils";

const STYLE: Record<SessionStatus, { dot: string; pill: string }> = {
  filling: {
    dot: "bg-status-filling",
    pill: "bg-status-filling-soft text-status-filling",
  },
  idle: {
    dot: "bg-status-idle",
    pill: "bg-status-idle-soft text-status-idle",
  },
  submitted: {
    dot: "bg-status-submitted",
    pill: "bg-status-submitted-soft text-status-submitted",
  },
  disconnected: {
    dot: "bg-status-offline",
    pill: "bg-status-offline-soft text-status-offline",
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
    <Badge
      variant="secondary"
      className={cn(
        "gap-1.5",
        style.pill,
        size === "md" && "h-6 px-2.5 text-sm",
      )}
    >
      <span className="relative flex size-2">
        {status === "filling" && (
          <span
            className={cn(
              "absolute inline-flex size-full animate-ping rounded-full opacity-75",
              style.dot,
            )}
          />
        )}
        <span
          className={cn("relative inline-flex size-2 rounded-full", style.dot)}
        />
      </span>
      {STATUS_LABEL[status]}
    </Badge>
  );
}
