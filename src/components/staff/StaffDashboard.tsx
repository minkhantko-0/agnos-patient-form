"use client";

import Link from "next/link";

import { useLobby } from "@/lib/realtime/useLobby";
import { ConnectionBadge } from "@/components/ui/ConnectionBadge";
import { useNow } from "@/lib/time";

import { SessionCard } from "./SessionCard";

export function StaffDashboard() {
  const { connection, sessions } = useLobby();
  const now = useNow();

  return (
    <div className="space-y-6">
      <header className="flex flex-wrap items-end justify-between gap-3">
        <div>
          <h1 className="text-2xl font-semibold text-ink">Patient sessions</h1>
          <p className="mt-1 text-sm text-ink-muted">
            Everyone with the intake form open right now.
          </p>
        </div>
        <div className="flex items-center gap-3">
          <span className="rounded-full bg-surface-muted px-3 py-1 text-sm font-medium text-ink-muted">
            {sessions.length} active
          </span>
          <ConnectionBadge state={connection} />
        </div>
      </header>

      {sessions.length === 0 ? (
        <div className="rounded-xl border border-dashed border-border-strong bg-surface p-10 text-center">
          <p className="font-medium text-ink">
            {connection === "connected"
              ? "No one is filling in the form"
              : "Waiting for the realtime connection…"}
          </p>
          <p className="mx-auto mt-2 max-w-sm text-sm text-ink-muted">
            Sessions appear here the moment a patient opens the form, and
            disappear when they close the tab.
          </p>
          <Link
            href="/form"
            className="mt-5 inline-block rounded-lg border border-border-strong px-4 py-2 text-sm font-medium text-ink transition hover:bg-surface-muted focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-brand"
          >
            Open a patient form to test
          </Link>
        </div>
      ) : (
        <ul className="grid grid-cols-1 gap-4 sm:grid-cols-2 xl:grid-cols-3">
          {sessions.map((session) => (
            <li key={session.sessionId}>
              <SessionCard session={session} now={now} />
            </li>
          ))}
        </ul>
      )}
    </div>
  );
}
