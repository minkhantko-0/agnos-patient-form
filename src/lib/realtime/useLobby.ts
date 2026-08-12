"use client";

import { useEffect, useState } from "react";

import { INITIAL_CONNECTION, getRealtimeClient } from "./client";
import {
  LOBBY_CHANNEL,
  type ConnectionState,
  type LobbyPresence,
} from "./protocol";

function isPresence(value: unknown): value is LobbyPresence {
  return (
    typeof value === "object" &&
    value !== null &&
    typeof (value as LobbyPresence).sessionId === "string"
  );
}

/**
 * Read-only view of every patient tab currently open.
 *
 * Staff subscribe without calling `track()`, so they observe the lobby without
 * appearing in it. When a patient's socket drops, Supabase removes their
 * presence and a `leave` event fires — that is the whole disconnect story, with
 * no heartbeat or timeout logic on our side.
 */
export function useLobby() {
  const [connection, setConnection] =
    useState<ConnectionState>(INITIAL_CONNECTION);
  const [sessions, setSessions] = useState<LobbyPresence[]>([]);

  useEffect(() => {
    const supabase = getRealtimeClient();
    if (!supabase) return;

    const channel = supabase.channel(LOBBY_CHANNEL);

    const read = () => {
      const byId = new Map<string, LobbyPresence>();

      // Presence is keyed by session id, but a reconnecting tab can leave two
      // entries under one key for a moment — keep the freshest.
      for (const entries of Object.values(channel.presenceState())) {
        for (const entry of entries) {
          if (!isPresence(entry)) continue;
          const seen = byId.get(entry.sessionId);
          if (!seen || seen.updatedAt < entry.updatedAt) {
            byId.set(entry.sessionId, entry);
          }
        }
      }

      setSessions(
        [...byId.values()].sort((a, b) => b.updatedAt - a.updatedAt),
      );
    };

    channel
      .on("presence", { event: "sync" }, read)
      .on("presence", { event: "join" }, read)
      .on("presence", { event: "leave" }, read)
      .subscribe((status) => {
        if (status === "SUBSCRIBED") setConnection("connected");
        else if (status === "CHANNEL_ERROR" || status === "TIMED_OUT")
          setConnection("error");
        else if (status === "CLOSED") setConnection("closed");
      });

    return () => {
      void supabase.removeChannel(channel);
    };
  }, []);

  return { connection, sessions };
}
