"use client";

import { useEffect, useMemo, useState } from "react";

import { REQUIRED_FIELDS } from "@/lib/patient/schema";

import { INITIAL_CONNECTION, canPush, getRealtimeClient } from "./client";
import {
  EVENT,
  LOBBY_CHANNEL,
  type ConnectionState,
  type LobbyIdentity,
  type LobbySession,
  type SessionSummary,
} from "./protocol";

function isIdentity(value: unknown): value is LobbyIdentity {
  return (
    typeof value === "object" &&
    value !== null &&
    typeof (value as LobbyIdentity).sessionId === "string"
  );
}

function isSummary(value: unknown): value is SessionSummary {
  return (
    typeof value === "object" &&
    value !== null &&
    typeof (value as SessionSummary).sessionId === "string" &&
    typeof (value as SessionSummary).updatedAt === "number"
  );
}

/**
 * Read-only view of every patient tab currently open: presence for who is
 * here, broadcast summaries for name, status and progress.
 *
 * Presence is the gate — a session is listed only while its tab is open — and
 * the summary fills in the detail. Staff subscribe without calling `track()`,
 * so they observe the lobby without appearing in it.
 */
export function useLobby() {
  const [connection, setConnection] =
    useState<ConnectionState>(INITIAL_CONNECTION);
  const [present, setPresent] = useState<LobbyIdentity[]>([]);
  const [summaries, setSummaries] = useState<Map<string, SessionSummary>>(
    () => new Map(),
  );

  useEffect(() => {
    const supabase = getRealtimeClient();
    if (!supabase) return;

    const channel = supabase.channel(LOBBY_CHANNEL);

    const readPresence = () => {
      const byId = new Map<string, LobbyIdentity>();

      for (const entries of Object.values(channel.presenceState())) {
        for (const entry of entries) {
          if (!isIdentity(entry)) continue;
          // Earliest join wins, so a rejoin does not reset "open for".
          const seen = byId.get(entry.sessionId);
          if (!seen || entry.startedAt < seen.startedAt) {
            byId.set(entry.sessionId, entry);
          }
        }
      }

      setPresent([...byId.values()]);
    };

    channel
      .on("broadcast", { event: EVENT.summary }, ({ payload }) => {
        if (!isSummary(payload)) return;

        setSummaries((prev) => {
          const seen = prev.get(payload.sessionId);
          if (seen && seen.updatedAt >= payload.updatedAt) return prev;

          return new Map(prev).set(payload.sessionId, payload);
        });
      })
      // Only `sync`: join/leave can observe the state mid-update, including a
      // key whose metas are emptied but not yet removed.
      .on("presence", { event: "sync" }, readPresence)
      .subscribe((status) => {
        if (status === "SUBSCRIBED") {
          setConnection("connected");
          // Broadcast has no history; ask whoever is here to re-send.
          if (canPush(channel)) {
            void channel.send({
              type: "broadcast",
              event: EVENT.hello,
              payload: { from: "staff" },
            });
          }
        } else if (status === "CHANNEL_ERROR" || status === "TIMED_OUT") {
          setConnection("error");
        } else if (status === "CLOSED") {
          setConnection("closed");
        }
      });

    return () => {
      void supabase.removeChannel(channel);
    };
  }, []);

  const sessions = useMemo<LobbySession[]>(() => {
    return present
      .map((identity) => {
        const summary = summaries.get(identity.sessionId);

        // A tab that has joined but not yet sent a summary still belongs here.
        return {
          sessionId: identity.sessionId,
          startedAt: identity.startedAt,
          name: summary?.name ?? "Unnamed patient",
          status: summary?.status ?? "idle",
          completed: summary?.completed ?? 0,
          required: summary?.required ?? REQUIRED_FIELDS.length,
          updatedAt: summary?.updatedAt ?? identity.startedAt,
        };
      })
      .sort((a, b) => b.updatedAt - a.updatedAt);
  }, [present, summaries]);

  return { connection, sessions };
}
