import {
  createClient,
  type RealtimeChannel,
  type SupabaseClient,
} from "@supabase/supabase-js";

import type { ConnectionState } from "./protocol";

// send() before the join completes silently falls back to a REST POST. Dropping
// the push is safe: each hook flushes again from its SUBSCRIBED callback.
export const canPush = (channel: RealtimeChannel | null) =>
  channel !== null && channel.state === "joined";

const url = process.env.NEXT_PUBLIC_SUPABASE_URL;
const anonKey = process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY;

export const isRealtimeConfigured = Boolean(url && anonKey);

// Fixed at build time, so hooks start in the right state instead of correcting
// themselves from an effect.
export const INITIAL_CONNECTION: ConnectionState = isRealtimeConfigured
  ? "connecting"
  : "error";

let client: SupabaseClient | null = null;

export function getRealtimeClient(): SupabaseClient | null {
  if (!url || !anonKey) return null;

  // One socket per tab, shared by every channel.
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
