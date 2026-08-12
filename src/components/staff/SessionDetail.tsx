"use client";

import Link from "next/link";

import {
  FIELD_SECTIONS,
  REQUIRED_FIELDS,
  countCompleted,
  displayName,
} from "@/lib/patient/schema";
import type { SessionStatus } from "@/lib/realtime/protocol";
import { useLobby } from "@/lib/realtime/useLobby";
import { useSessionMonitor } from "@/lib/realtime/useSessionMonitor";
import { ConnectionBadge } from "@/components/ui/ConnectionBadge";
import { StatusPill } from "@/components/ui/StatusPill";
import { relativeTime, useNow } from "@/lib/time";

import { LiveField } from "./LiveField";

export function SessionDetail({ sessionId }: { sessionId: string }) {
  const monitor = useSessionMonitor(sessionId);
  const { sessions } = useLobby();
  const now = useNow();

  const presence = sessions.find(
    (session) => session.sessionId === sessionId,
  );

  /*
   * Two independent signals combine here:
   *   presence  — is the patient's tab still open? (lobby, ~1s granularity)
   *   broadcast — what are they doing? (session channel, ~150ms granularity)
   *
   * Broadcast wins while the patient is present because it is the fresher of
   * the two. A submitted form stays "Submitted" after they close the tab; any
   * other state becomes "Left the form".
   */
  const status: SessionStatus = presence
    ? (monitor.status ?? presence.status)
    : monitor.status === "submitted"
      ? "submitted"
      : "disconnected";

  const name = monitor.hasData
    ? displayName(monitor.values)
    : (presence?.name ?? "Unnamed patient");

  const completed = monitor.hasData
    ? countCompleted(monitor.values)
    : (presence?.completed ?? 0);
  const percent = Math.round((completed / REQUIRED_FIELDS.length) * 100);

  return (
    <div className="space-y-6">
      <div>
        <Link
          href="/staff"
          className="inline-flex items-center gap-1.5 text-sm font-medium text-ink-muted transition hover:text-brand focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-brand"
        >
          <span aria-hidden>←</span> All sessions
        </Link>
      </div>

      <header className="rounded-xl border border-border bg-surface p-4 sm:p-6">
        <div className="flex flex-wrap items-start justify-between gap-3">
          <div className="min-w-0">
            <h1 className="truncate text-2xl font-semibold text-ink">{name}</h1>
            <p className="mt-1 font-mono text-xs text-ink-faint">{sessionId}</p>
          </div>
          <div className="flex flex-col items-end gap-2">
            <StatusPill status={status} />
            <ConnectionBadge state={monitor.connection} />
          </div>
        </div>

        <div className="mt-5">
          <div className="flex items-baseline justify-between text-sm text-ink-muted">
            <span>
              {completed} of {REQUIRED_FIELDS.length} required fields
            </span>
            <span>
              {monitor.updatedAt !== null && now !== null
                ? `Updated ${relativeTime(monitor.updatedAt, now)}`
                : "No updates yet"}
            </span>
          </div>
          <div className="mt-2 h-1.5 overflow-hidden rounded-full bg-border">
            <div
              className="h-full rounded-full bg-brand transition-[width] duration-300"
              style={{ width: `${percent}%` }}
            />
          </div>
        </div>
      </header>

      {!monitor.hasData ? (
        <div className="rounded-xl border border-dashed border-border-strong bg-surface p-10 text-center">
          <p className="font-medium text-ink">
            {presence ? "Waiting for the patient's first update…" : "No live data"}
          </p>
          <p className="mx-auto mt-2 max-w-sm text-sm text-ink-muted">
            {presence
              ? "Their tab is open. Values appear as soon as they type."
              : "This session is not open on any device. Form contents are held in the patient's browser, so nothing remains once they close the tab."}
          </p>
        </div>
      ) : (
        <div className="grid grid-cols-1 gap-4 lg:grid-cols-2">
          {FIELD_SECTIONS.map((section) => (
            <section
              key={section.id}
              className="rounded-xl border border-border bg-surface p-4 sm:p-5"
            >
              <h2 className="text-xs font-semibold tracking-wide text-ink-faint uppercase">
                {section.title}
              </h2>
              <dl className="mt-3 divide-y divide-border">
                {section.fields.map((field) => (
                  <LiveField
                    key={field}
                    field={field}
                    value={monitor.values[field]}
                    changed={monitor.changedFields.has(field)}
                  />
                ))}
              </dl>
            </section>
          ))}
        </div>
      )}
    </div>
  );
}
