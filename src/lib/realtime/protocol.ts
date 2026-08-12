import type { PatientFormValues } from "@/lib/patient/schema";

/**
 * The wire contract between the patient tab and the staff tabs.
 *
 * Two channels, deliberately separate:
 *
 *   lobby            Who is here, and a summary of each. Presence carries
 *                    identity only and is tracked exactly once; the changing
 *                    summary rides on broadcast. See the note below.
 *
 *   session:<id>     Broadcast only. Carries the actual field values, so form
 *                    contents reach the one staff member watching that session
 *                    instead of everyone looking at the list.
 *
 * Why presence is written once and never updated
 * ----------------------------------------------
 * Presence is a liveness signal, not an update channel. Supabase evicts a
 * client's presence when its socket drops, which is exactly the "patient closed
 * the tab" signal the staff list needs — but re-calling `track()` to publish new
 * values is an untrack-then-track, and the server coalesces rapid updates. An
 * observer therefore sees the key leave with empty metas and only reappear on a
 * later diff, so a card blinks out of the list while the patient is still
 * typing. Identity goes in presence; everything that changes goes in broadcast.
 */

export const LOBBY_CHANNEL = "lobby";

export const sessionChannel = (sessionId: string) => `session:${sessionId}`;

export const EVENT = {
  /** Patient → staff, on `session:<id>`: the whole form, every time. */
  state: "state",
  /** Patient → staff, on `lobby`: name, status and progress. */
  summary: "summary",
  /**
   * Staff → patient: "I just opened this view, send me what you have."
   * Sent on whichever channel the staff tab just joined; neither channel
   * replays history, so without it a late joiner sees nothing until the next
   * keystroke.
   */
  hello: "hello",
} as const;

/**
 * Full state on every keystroke rather than a per-field diff.
 *
 * The payload is a flat record of short strings — under a kilobyte even when
 * the form is complete — so sending all of it costs less than the bookkeeping a
 * diff protocol needs to stay correct. It also means a staff tab that misses a
 * message (backgrounded, briefly offline) is repaired by the next one instead
 * of holding a permanently corrupt merge of partial updates.
 */
export type StatePayload = {
  values: PatientFormValues;
  status: PatientStatus;
  /**
   * Monotonic per patient session. Broadcast does not guarantee ordering, so
   * the staff side drops anything older than what it has already applied.
   */
  revision: number;
  at: number;
};

export type HelloPayload = {
  /** Staff tab id, only used to make the handshake legible while debugging. */
  from: string;
};

/** What the patient tab reports about itself. */
export type PatientStatus = "filling" | "idle" | "submitted";

/** What the staff view shows — patient status plus the one it infers itself. */
export type SessionStatus = PatientStatus | "disconnected";

/** Presence payload on `lobby`. Written once at join, never updated. */
export type LobbyIdentity = {
  sessionId: string;
  startedAt: number;
};

/** Broadcast payload on `lobby`, whenever the summary changes. */
export type SessionSummary = {
  sessionId: string;
  name: string;
  status: PatientStatus;
  completed: number;
  required: number;
  updatedAt: number;
};

/** What the staff list renders: identity merged with the latest summary. */
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

/** Floor on time between broadcasts, so fast typing cannot flood the channel. */
export const BROADCAST_INTERVAL_MS = 150;

/** The lobby summary is coarser — the staff list does not need keystrokes. */
export const SUMMARY_INTERVAL_MS = 1_000;
