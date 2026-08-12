import { createClient, type SupabaseClient } from "@supabase/supabase-js";

import type { ConnectionState } from "./protocol";

const url = process.env.NEXT_PUBLIC_SUPABASE_URL;
const anonKey = process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY;

/**
 * The app talks to Supabase Realtime only — no tables, no auth, no row-level
 * policies. Nothing is written to a database, so the anon key is doing exactly
 * what it is meant to do: authorise a public channel subscription.
 */
export const isRealtimeConfigured = Boolean(url && anonKey);

/**
 * Whether credentials exist is fixed at build time, so every hook can start in
 * the correct state rather than rendering "Connecting…" and then correcting
 * itself from inside an effect.
 */
export const INITIAL_CONNECTION: ConnectionState = isRealtimeConfigured
  ? "connecting"
  : "error";

let client: SupabaseClient | null = null;

export function getRealtimeClient(): SupabaseClient | null {
  if (!url || !anonKey) return null;

  // One socket per tab, shared by every channel the tab opens.
  client ??= createClient(url, anonKey, {
    auth: { persistSession: false, autoRefreshToken: false },
    realtime: { params: { eventsPerSecond: 20 } },
  });

  return client;
}

export function randomId(length = 10) {
  const bytes = new Uint8Array(length);
  crypto.getRandomValues(bytes);
  return Array.from(bytes, (byte) => (byte % 36).toString(36)).join("");
}
