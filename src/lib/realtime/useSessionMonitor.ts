"use client";

import { useEffect, useMemo, useRef, useState } from "react";

import {
  EMPTY_PATIENT,
  PATIENT_FIELDS,
  type PatientField,
  type PatientFormValues,
} from "@/lib/patient/schema";

import { INITIAL_CONNECTION, getRealtimeClient, randomId } from "./client";
import {
  EVENT,
  sessionChannel,
  type ConnectionState,
  type PatientStatus,
  type StatePayload,
} from "./protocol";

const HIGHLIGHT_MS = 1_400;

type Snapshot = {
  values: PatientFormValues;
  status: PatientStatus;
  at: number;
};

function isStatePayload(value: unknown): value is StatePayload {
  if (typeof value !== "object" || value === null) return false;
  const payload = value as StatePayload;
  return (
    typeof payload.revision === "number" &&
    typeof payload.values === "object" &&
    payload.values !== null
  );
}

const STATUSES: PatientStatus[] = ["filling", "idle", "submitted"];

/*
 * Anyone holding the public anon key can broadcast on this channel, and a
 * client on an older field set would send a payload just as incomplete. Rebuild
 * from the known fields rather than trusting what arrives — the same thing
 * `useDraft.load()` does for localStorage.
 */
function readValues(raw: unknown): PatientFormValues {
  const source = (raw ?? {}) as Record<string, unknown>;
  const values = { ...EMPTY_PATIENT };

  for (const field of PATIENT_FIELDS) {
    const value = source[field];
    if (typeof value === "string") values[field] = value;
  }

  return values;
}

function readStatus(raw: unknown): PatientStatus {
  return STATUSES.includes(raw as PatientStatus) ? (raw as PatientStatus) : "idle";
}

/** One staff member watching one patient session. */
export function useSessionMonitor(sessionId: string) {
  const [connection, setConnection] =
    useState<ConnectionState>(INITIAL_CONNECTION);
  const [snapshot, setSnapshot] = useState<Snapshot | null>(null);
  const [changed, setChanged] = useState<PatientField[]>([]);

  const revision = useRef(-1);
  const instance = useRef<string | null>(null);
  const values = useRef<PatientFormValues>(EMPTY_PATIENT);
  const timers = useRef(new Map<PatientField, ReturnType<typeof setTimeout>>());

  useEffect(() => {
    const supabase = getRealtimeClient();
    if (!supabase) return;

    const highlight = (fields: PatientField[]) => {
      setChanged((prev) => [...new Set([...prev, ...fields])]);

      for (const field of fields) {
        clearTimeout(timers.current.get(field));
        timers.current.set(
          field,
          setTimeout(() => {
            timers.current.delete(field);
            setChanged((prev) => prev.filter((name) => name !== field));
          }, HIGHLIGHT_MS),
        );
      }
    };

    const channel = supabase.channel(sessionChannel(sessionId), {
      config: { broadcast: { self: false } },
    });

    channel
      .on("broadcast", { event: EVENT.state }, ({ payload }) => {
        if (!isStatePayload(payload)) return;

        // A patient refresh restarts `revision` at 0, so a counter from a new
        // mount says nothing about the one we were following.
        if (payload.instance !== instance.current) {
          instance.current = payload.instance;
          revision.current = -1;
          values.current = EMPTY_PATIENT;
        }

        // Broadcast is unordered; ignore anything we have passed.
        if (payload.revision <= revision.current) return;
        const isFirst = revision.current === -1;
        revision.current = payload.revision;

        const next = readValues(payload.values);
        const diff = PATIENT_FIELDS.filter(
          (field) => values.current[field] !== next[field],
        );
        values.current = next;

        setSnapshot({
          values: next,
          status: readStatus(payload.status),
          at: typeof payload.at === "number" ? payload.at : 0,
        });

        // Skip the first: everything differs from a blank baseline.
        if (!isFirst && diff.length > 0) highlight(diff);
      })
      .subscribe((status) => {
        if (status === "SUBSCRIBED") {
          setConnection("connected");
          void channel.send({
            type: "broadcast",
            event: EVENT.hello,
            payload: { from: randomId(6) },
          });
        } else if (status === "CHANNEL_ERROR" || status === "TIMED_OUT") {
          setConnection("error");
        } else if (status === "CLOSED") {
          setConnection("closed");
        }
      });

    const pending = timers.current;
    return () => {
      for (const timer of pending.values()) clearTimeout(timer);
      pending.clear();
      void supabase.removeChannel(channel);
    };
  }, [sessionId]);

  const changedFields = useMemo(() => new Set(changed), [changed]);

  return {
    connection,
    values: snapshot?.values ?? EMPTY_PATIENT,
    status: snapshot?.status ?? null,
    // `at` is 0 on the payload a freshly-opened form flushes, which is "not
    // updated", not "updated in 1970".
    updatedAt: snapshot?.at || null,
    hasData: snapshot !== null,
    changedFields,
  };
}
