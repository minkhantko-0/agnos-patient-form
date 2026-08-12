import type { PatientFormValues } from "@/lib/patient/schema";

/**
 * The wire contract between the patient tab and the staff tabs.
 *
 * Two channels, deliberately separate:
 *
 *   lobby            Presence only. Every open patient tab tracks a small
 *                    summary here (name, status, progress) and the staff list
 *                    renders whoever is present. Presence is used rather than
 *                    broadcast because Supabase evicts a client's presence
 *                    automatically when its socket drops, which is exactly the
 *                    "patient closed the tab" signal the staff list needs.
 *
 *   session:<id>     Broadcast only. Carries the actual field values, so form
 *                    contents reach the one staff member watching that session
 *                    instead of everyone looking at the list.
 */

export const LOBBY_CHANNEL = "lobby";

export const sessionChannel = (sessionId: string) => `session:${sessionId}`;

export const EVENT = {
  /** Patient → staff: the whole form, every time. See note below. */
  state: "state",
  /** Staff → patient: "I just opened this session, send me what you have." */
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

export type LobbyPresence = {
  sessionId: string;
  name: string;
  status: PatientStatus;
  completed: number;
  required: number;
  startedAt: number;
  updatedAt: number;
};

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

/** Presence updates are coarser — the staff list only shows a summary. */
export const PRESENCE_INTERVAL_MS = 1_000;
