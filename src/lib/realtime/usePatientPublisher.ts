"use client";

import { useCallback, useEffect, useRef, useState } from "react";
import type { RealtimeChannel } from "@supabase/supabase-js";

import {
  EMPTY_PATIENT,
  REQUIRED_FIELDS,
  countCompleted,
  displayName,
  type PatientFormValues,
} from "@/lib/patient/schema";

import { INITIAL_CONNECTION, getRealtimeClient } from "./client";
import {
  BROADCAST_INTERVAL_MS,
  EVENT,
  IDLE_AFTER_MS,
  LOBBY_CHANNEL,
  PRESENCE_INTERVAL_MS,
  sessionChannel,
  type ConnectionState,
  type LobbyPresence,
  type PatientStatus,
  type StatePayload,
} from "./protocol";
import { useTrailingThrottle } from "./useTrailingThrottle";

/**
 * Everything the patient tab sends outward.
 *
 * Owns the status machine (`filling` → `idle` after a pause → `submitted`) so
 * the form component only has to say what happened, not what it means.
 */
export function usePatientPublisher(sessionId: string) {
  const [connection, setConnection] =
    useState<ConnectionState>(INITIAL_CONNECTION);

  const stateRef = useRef<StatePayload>({
    values: EMPTY_PATIENT,
    status: "idle",
    revision: 0,
    at: 0,
  });
  const startedAt = useRef(0);
  const idleTimer = useRef<ReturnType<typeof setTimeout> | null>(null);
  const session = useRef<RealtimeChannel | null>(null);
  const lobby = useRef<RealtimeChannel | null>(null);

  const sendState = useCallback(() => {
    void session.current?.send({
      type: "broadcast",
      event: EVENT.state,
      payload: stateRef.current,
    });
  }, []);

  const sendPresence = useCallback(() => {
    const { values, status } = stateRef.current;
    void lobby.current?.track({
      sessionId,
      name: displayName(values),
      status,
      completed: countCompleted(values),
      required: REQUIRED_FIELDS.length,
      startedAt: startedAt.current,
      updatedAt: Date.now(),
    } satisfies LobbyPresence);
  }, [sessionId]);

  const state = useTrailingThrottle(BROADCAST_INTERVAL_MS, sendState);
  const presence = useTrailingThrottle(PRESENCE_INTERVAL_MS, sendPresence);

  const commit = useCallback(
    (values: PatientFormValues, status: PatientStatus) => {
      stateRef.current = {
        values,
        status,
        revision: stateRef.current.revision + 1,
        at: Date.now(),
      };
    },
    [],
  );

  const clearIdleTimer = useCallback(() => {
    if (idleTimer.current === null) return;
    clearTimeout(idleTimer.current);
    idleTimer.current = null;
  }, []);

  /** The patient typed. Announce activity and start counting down to idle. */
  const publish = useCallback(
    (values: PatientFormValues) => {
      if (stateRef.current.status === "submitted") return;

      commit(values, "filling");
      state.schedule();
      presence.schedule();

      clearIdleTimer();
      idleTimer.current = setTimeout(() => {
        idleTimer.current = null;
        commit(stateRef.current.values, "idle");
        state.flush();
        presence.flush();
      }, IDLE_AFTER_MS);
    },
    [commit, state, presence, clearIdleTimer],
  );

  /** Load values without claiming the patient is active — e.g. a restored draft. */
  const seed = useCallback(
    (values: PatientFormValues) => {
      commit(values, stateRef.current.status);
      state.schedule();
      presence.schedule();
    },
    [commit, state, presence],
  );

  /** Terminal state: no further updates are sent for this session. */
  const markSubmitted = useCallback(
    (values: PatientFormValues) => {
      clearIdleTimer();
      commit(values, "submitted");
      state.flush();
      presence.flush();
    },
    [commit, state, presence, clearIdleTimer],
  );

  useEffect(() => {
    const supabase = getRealtimeClient();
    if (!supabase) return;

    startedAt.current = Date.now();

    const sessionCh = supabase.channel(sessionChannel(sessionId), {
      config: { broadcast: { self: false } },
    });
    session.current = sessionCh;

    sessionCh
      // Broadcast keeps no history, so a staff tab opening mid-form would see
      // nothing until the next keystroke. It says hello; we replay immediately.
      .on("broadcast", { event: EVENT.hello }, () => state.flush())
      .subscribe((status) => {
        if (status === "SUBSCRIBED") {
          setConnection("connected");
          state.flush();
        } else if (status === "CHANNEL_ERROR" || status === "TIMED_OUT") {
          setConnection("error");
        } else if (status === "CLOSED") {
          setConnection("closed");
        }
      });

    const lobbyCh = supabase.channel(LOBBY_CHANNEL, {
      config: { presence: { key: sessionId } },
    });
    lobby.current = lobbyCh;
    lobbyCh.subscribe((status) => {
      if (status === "SUBSCRIBED") presence.flush();
    });

    return () => {
      session.current = null;
      lobby.current = null;
      state.cancel();
      presence.cancel();
      void supabase.removeChannel(sessionCh);
      void supabase.removeChannel(lobbyCh);
    };
  }, [sessionId, state, presence]);

  useEffect(() => clearIdleTimer, [clearIdleTimer]);

  return { connection, publish, seed, markSubmitted };
}
