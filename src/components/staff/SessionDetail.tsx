"use client";

import Link from "next/link";
import { ArrowLeftIcon, InboxIcon } from "lucide-react";

import { ConnectionBadge } from "@/components/ConnectionBadge";
import { StatusPill } from "@/components/StatusPill";
import { Button } from "@/components/ui/button";
import {
  Card,
  CardAction,
  CardContent,
  CardHeader,
} from "@/components/ui/card";
import {
  Empty,
  EmptyDescription,
  EmptyHeader,
  EmptyMedia,
  EmptyTitle,
} from "@/components/ui/empty";
import { Progress } from "@/components/ui/progress";
import {
  FIELD_SECTIONS,
  REQUIRED_FIELDS,
  countCompleted,
  displayName,
} from "@/lib/patient/schema";
import type { SessionStatus } from "@/lib/realtime/protocol";
import { useLobby } from "@/lib/realtime/useLobby";
import { useSessionMonitor } from "@/lib/realtime/useSessionMonitor";
import { relativeTime, useNow } from "@/lib/time";

import { LiveField } from "./LiveField";

export function SessionDetail({ sessionId }: { sessionId: string }) {
  const monitor = useSessionMonitor(sessionId);
  const { sessions } = useLobby();
  const now = useNow();

  const presence = sessions.find(
    (session) => session.sessionId === sessionId,
  );

  // Presence says whether the tab is open; broadcast, fresher, says what they
  // are doing — so it wins while they are present.
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
      <Button variant="ghost" size="sm" asChild>
        <Link href="/staff">
          <ArrowLeftIcon data-icon="inline-start" />
          All sessions
        </Link>
      </Button>

      <Card>
        <CardHeader>
          <h1 className="truncate font-heading text-2xl font-medium">{name}</h1>
          <p className="truncate font-mono text-xs text-muted-foreground">
            {sessionId}
          </p>
          <CardAction className="flex flex-col items-end gap-2">
            <StatusPill status={status} />
            <ConnectionBadge state={monitor.connection} />
          </CardAction>
        </CardHeader>

        <CardContent className="space-y-2">
          <div className="flex flex-wrap items-baseline justify-between gap-x-4 text-sm text-muted-foreground">
            <span>
              {completed} of {REQUIRED_FIELDS.length} required fields
            </span>
            <span>
              {monitor.updatedAt !== null && now !== null
                ? `Updated ${relativeTime(monitor.updatedAt, now)}`
                : "No updates yet"}
            </span>
          </div>
          <Progress value={percent} className="h-1.5" />
        </CardContent>
      </Card>

      {!monitor.hasData ? (
        <Card>
          <Empty>
            <EmptyHeader>
              <EmptyMedia variant="icon">
                <InboxIcon />
              </EmptyMedia>
              <EmptyTitle>
                {presence
                  ? "Waiting for the patient's first update…"
                  : "No live data"}
              </EmptyTitle>
              <EmptyDescription>
                {presence
                  ? "Their tab is open. Values appear as soon as they type."
                  : "This session is not open on any device. Form contents are held in the patient's browser, so nothing remains once they close the tab or navigate away."}
              </EmptyDescription>
            </EmptyHeader>
          </Empty>
        </Card>
      ) : (
        <div className="grid grid-cols-1 gap-4 lg:grid-cols-2">
          {FIELD_SECTIONS.map((section) => (
            <Card key={section.id} size="sm">
              <CardHeader>
                <h2 className="text-xs font-medium tracking-wide text-muted-foreground uppercase">
                  {section.title}
                </h2>
              </CardHeader>
              <CardContent>
                <dl className="divide-y">
                  {section.fields.map((field) => (
                    <LiveField
                      key={field}
                      field={field}
                      value={monitor.values[field]}
                      changed={monitor.changedFields.has(field)}
                    />
                  ))}
                </dl>
              </CardContent>
            </Card>
          ))}
        </div>
      )}
    </div>
  );
}
