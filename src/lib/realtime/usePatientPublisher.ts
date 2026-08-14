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

import {
  INITIAL_CONNECTION,
  canPush,
  getRealtimeClient,
  randomId,
} from "./client";
import {
  BROADCAST_INTERVAL_MS,
  EVENT,
  IDLE_AFTER_MS,
  LOBBY_CHANNEL,
  SUMMARY_INTERVAL_MS,
  sessionChannel,
  type ConnectionState,
  type LobbyIdentity,
  type PatientStatus,
  type SessionSummary,
  type StatePayload,
} from "./protocol";
import { useTrailingThrottle } from "./useTrailingThrottle";

/** Everything the patient tab sends outward, and the status machine with it. */
export function usePatientPublisher(sessionId: string) {
  const [connection, setConnection] =
    useState<ConnectionState>(INITIAL_CONNECTION);

  const stateRef = useRef<Omit<StatePayload, "instance">>({
    values: EMPTY_PATIENT,
    status: "idle",
    revision: 0,
    at: 0,
  });
  const startedAt = useRef(0);
  // Regenerated on every mount, which is exactly what a refresh needs.
  const [instance] = useState(() => randomId(6));
  const idleTimer = useRef<ReturnType<typeof setTimeout> | null>(null);
  const session = useRef<RealtimeChannel | null>(null);
  const lobby = useRef<RealtimeChannel | null>(null);

  const sendState = useCallback(() => {
    if (!canPush(session.current)) return;

    void session.current?.send({
      type: "broadcast",
      event: EVENT.state,
      payload: { ...stateRef.current, instance },
    });
  }, [instance]);

  const sendSummary = useCallback(() => {
    if (!canPush(lobby.current)) return;

    const { values, status } = stateRef.current;
    void lobby.current?.send({
      type: "broadcast",
      event: EVENT.summary,
      payload: {
        sessionId,
        name: displayName(values),
        status,
        completed: countCompleted(values),
        required: REQUIRED_FIELDS.length,
        updatedAt: Date.now(),
      } satisfies SessionSummary,
    });
  }, [sessionId]);

  const state = useTrailingThrottle(BROADCAST_INTERVAL_MS, sendState);
  const summary = useTrailingThrottle(SUMMARY_INTERVAL_MS, sendSummary);

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

  const startIdleCountdown = useCallback(() => {
    clearIdleTimer();
    idleTimer.current = setTimeout(() => {
      idleTimer.current = null;
      commit(stateRef.current.values, "idle");
      state.flush();
      summary.flush();
    }, IDLE_AFTER_MS);
  }, [commit, state, summary, clearIdleTimer]);

  const publish = useCallback(
    (values: PatientFormValues) => {
      if (stateRef.current.status === "submitted") return;

      commit(values, "filling");
      state.schedule();
      summary.schedule();
      startIdleCountdown();
    },
    [commit, state, summary, startIdleCountdown],
  );

  /** Load values without claiming the patient is active. */
  const seed = useCallback(
    (values: PatientFormValues) => {
      commit(values, stateRef.current.status);
      state.schedule();
      summary.schedule();
    },
    [commit, state, summary],
  );

  /**
   * Back out of the terminal status. Without this `publish` keeps early
   * returning and a correction never leaves the patient's tab.
   */
  const resume = useCallback(
    (values: PatientFormValues) => {
      commit(values, "filling");
      state.flush();
      summary.flush();
      startIdleCountdown();
    },
    [commit, state, summary, startIdleCountdown],
  );

  /** Terminal: no further updates are sent for this session. */
  const markSubmitted = useCallback(
    (values: PatientFormValues) => {
      clearIdleTimer();
      commit(values, "submitted");
      state.flush();
      summary.flush();
    },
    [commit, state, summary, clearIdleTimer],
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
      // A staff tab opened mid-form and has no history to read.
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

    lobbyCh
      .on("broadcast", { event: EVENT.hello }, () => summary.flush())
      .subscribe((status) => {
        if (status !== "SUBSCRIBED") return;

        // Once per join and never again — re-tracking to publish values makes
        // the entry blink out of the staff list.
        void lobbyCh.track({
          sessionId,
          startedAt: startedAt.current,
        } satisfies LobbyIdentity);

        summary.flush();
      });

    return () => {
      session.current = null;
      lobby.current = null;
      state.cancel();
      summary.cancel();
      void supabase.removeChannel(sessionCh);
      void supabase.removeChannel(lobbyCh);
    };
  }, [sessionId, state, summary]);

  useEffect(() => clearIdleTimer, [clearIdleTimer]);

  return { connection, publish, seed, resume, markSubmitted };
}
