import type { PatientFormValues } from "@/lib/patient/schema";

// Two channels: `lobby` for who is here, `session:<id>` for one patient's
// values. Presence carries identity only — re-calling track() to publish
// changes is an untrack-then-track, which blinks the card out of the list.

export const LOBBY_CHANNEL = "lobby";

export const sessionChannel = (sessionId: string) => `session:${sessionId}`;

export const EVENT = {
  state: "state",
  summary: "summary",
  /** Neither channel replays history, so a late joiner has to ask. */
  hello: "hello",
} as const;

// Full state every time, not a diff: a missed message is repaired by the next.
export type StatePayload = {
  values: PatientFormValues;
  status: PatientStatus;
  /** Broadcast is unordered; the staff side drops anything it has passed. */
  revision: number;
  at: number;
};

export type HelloPayload = {
  from: string;
};

export type PatientStatus = "filling" | "idle" | "submitted";

export type SessionStatus = PatientStatus | "disconnected";

/** Presence payload on `lobby`. Written once at join, never updated. */
export type LobbyIdentity = {
  sessionId: string;
  startedAt: number;
};

export type SessionSummary = {
  sessionId: string;
  name: string;
  status: PatientStatus;
  completed: number;
  required: number;
  updatedAt: number;
};

export type LobbySession = LobbyIdentity & Omit<SessionSummary, "sessionId">;

export type ConnectionState = "connecting" | "connected" | "error" | "closed";

export const STATUS_LABEL: Record<SessionStatus, string> = {
  filling: "Filling in",
  idle: "Inactive",
  submitted: "Submitted",
  disconnected: "Left the form",
};

/** Silence after the last keystroke before a patient counts as inactive. */
export const IDLE_AFTER_MS = 4_000;

export const BROADCAST_INTERVAL_MS = 150;

export const SUMMARY_INTERVAL_MS = 1_000;
