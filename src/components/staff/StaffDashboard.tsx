"use client";

import Link from "next/link";
import { UsersIcon } from "lucide-react";

import { ConnectionBadge } from "@/components/ConnectionBadge";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Card } from "@/components/ui/card";
import {
  Empty,
  EmptyContent,
  EmptyDescription,
  EmptyHeader,
  EmptyMedia,
  EmptyTitle,
} from "@/components/ui/empty";
import { useLobby } from "@/lib/realtime/useLobby";
import { useNow } from "@/lib/time";

import { SessionCard } from "./SessionCard";

export function StaffDashboard() {
  const { connection, sessions } = useLobby();
  const now = useNow();

  return (
    <div className="space-y-6">
      <header className="flex flex-wrap items-end justify-between gap-3">
        <div>
          <h1 className="font-heading text-2xl font-medium">
            Patient sessions
          </h1>
          <p className="mt-1 text-sm text-muted-foreground">
            Everyone with the intake form open right now.
          </p>
        </div>
        <div className="flex items-center gap-3">
          <Badge variant="secondary">{sessions.length} active</Badge>
          <ConnectionBadge state={connection} />
        </div>
      </header>

      {sessions.length === 0 ? (
        <Card>
          <Empty>
            <EmptyHeader>
              <EmptyMedia variant="icon">
                <UsersIcon />
              </EmptyMedia>
              <EmptyTitle>
                {connection === "connected"
                  ? "No one is filling in the form"
                  : "Waiting for the realtime connection…"}
              </EmptyTitle>
              <EmptyDescription>
                Sessions appear here the moment a patient opens the form, and
                disappear when they close the tab.
              </EmptyDescription>
            </EmptyHeader>
            <EmptyContent>
              <Button variant="outline" asChild>
                <Link href="/form">Open a patient form to test</Link>
              </Button>
            </EmptyContent>
          </Empty>
        </Card>
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
