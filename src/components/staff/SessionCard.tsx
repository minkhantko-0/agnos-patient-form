"use client";

import Link from "next/link";

import type { LobbySession } from "@/lib/realtime/protocol";
import { StatusPill } from "@/components/ui/StatusPill";
import { elapsed, relativeTime } from "@/lib/time";

export function SessionCard({
  session,
  now,
}: {
  session: LobbySession;
  now: number | null;
}) {
  const percent = Math.round((session.completed / session.required) * 100);

  return (
    <Link
      href={`/staff/${session.sessionId}`}
      className="group block rounded-xl border border-border bg-surface p-4 transition hover:border-brand hover:shadow-sm focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-brand"
    >
      <div className="flex items-start justify-between gap-3">
        <div className="min-w-0">
          <p className="truncate font-semibold text-ink group-hover:text-brand">
            {session.name}
          </p>
          <p className="mt-0.5 font-mono text-xs text-ink-faint">
            {session.sessionId}
          </p>
        </div>
        <StatusPill status={session.status} size="sm" />
      </div>

      <div className="mt-4">
        <div className="flex items-baseline justify-between text-xs text-ink-muted">
          <span>
            {session.completed}/{session.required} required
          </span>
          <span>{percent}%</span>
        </div>
        <div className="mt-1.5 h-1.5 overflow-hidden rounded-full bg-border">
          <div
            className="h-full rounded-full bg-brand transition-[width] duration-300"
            style={{ width: `${percent}%` }}
          />
        </div>
      </div>

      <dl className="mt-4 flex justify-between text-xs text-ink-muted">
        <div>
          <dt className="text-ink-faint">Open for</dt>
          <dd className="mt-0.5 font-medium text-ink">
            {now === null ? "—" : elapsed(session.startedAt, now)}
          </dd>
        </div>
        <div className="text-right">
          <dt className="text-ink-faint">Last activity</dt>
          <dd className="mt-0.5 font-medium text-ink">
            {now === null ? "—" : relativeTime(session.updatedAt, now)}
          </dd>
        </div>
      </dl>
    </Link>
  );
}
