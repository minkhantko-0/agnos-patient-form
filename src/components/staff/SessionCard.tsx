"use client";

import Link from "next/link";

import { StatusPill } from "@/components/StatusPill";
import {
  Card,
  CardAction,
  CardContent,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";
import { Progress } from "@/components/ui/progress";
import type { LobbySession } from "@/lib/realtime/protocol";
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
      className="group block rounded-2xl outline-none focus-visible:ring-[3px] focus-visible:ring-ring/50"
    >
      <Card
        size="sm"
        className="h-full transition-all group-hover:ring-primary/40"
      >
        <CardHeader>
          <CardTitle className="truncate group-hover:text-primary">
            {session.name}
          </CardTitle>
          <p className="truncate font-mono text-xs text-muted-foreground">
            {session.sessionId}
          </p>
          <CardAction>
            <StatusPill status={session.status} size="sm" />
          </CardAction>
        </CardHeader>

        <CardContent className="space-y-1.5">
          <div className="flex items-baseline justify-between text-xs text-muted-foreground">
            <span>
              {session.completed}/{session.required} required
            </span>
            <span>{percent}%</span>
          </div>
          <Progress value={percent} className="h-1.5" />
        </CardContent>

        <CardContent>
          <dl className="flex justify-between text-xs">
            <div>
              <dt className="text-muted-foreground">Open for</dt>
              <dd className="mt-0.5 font-medium">
                {now === null ? "—" : elapsed(session.startedAt, now)}
              </dd>
            </div>
            <div className="text-right">
              <dt className="text-muted-foreground">Last activity</dt>
              <dd className="mt-0.5 font-medium">
                {now === null ? "—" : relativeTime(session.updatedAt, now)}
              </dd>
            </div>
          </dl>
        </CardContent>
      </Card>
    </Link>
  );
}
