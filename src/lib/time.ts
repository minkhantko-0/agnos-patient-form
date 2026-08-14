"use client";

import { useSyncExternalStore } from "react";

/*
 * One clock shared by every component that shows a relative timestamp, rather
 * than an interval per component. Exposed through `useSyncExternalStore` so the
 * server render and the first client render agree on `null`, which keeps
 * "3s ago" text out of the hydration diff.
 */
let now: number | null = null;
let timer: ReturnType<typeof setInterval> | null = null;

const listeners = new Set<() => void>();

function tick() {
  now = Date.now();
  for (const listener of listeners) listener();
}

function subscribe(listener: () => void) {
  listeners.add(listener);

  if (timer === null) {
    // React re-reads the snapshot after subscribing, so seeding is enough.
    now = Date.now();
    timer = setInterval(tick, 1_000);
  }

  return () => {
    listeners.delete(listener);
    if (listeners.size === 0 && timer !== null) {
      clearInterval(timer);
      timer = null;
      now = null;
    }
  };
}

const getSnapshot = () => now;
const getServerSnapshot = () => null;

/** Current time in ms, or `null` before the client clock has started. */
export function useNow() {
  return useSyncExternalStore(subscribe, getSnapshot, getServerSnapshot);
}

export function relativeTime(from: number, at: number) {
  const seconds = Math.max(0, Math.round((at - from) / 1_000));
  if (seconds < 5) return "just now";
  if (seconds < 60) return `${seconds}s ago`;

  const minutes = Math.floor(seconds / 60);
  if (minutes < 60) return `${minutes}m ago`;

  return `${Math.floor(minutes / 60)}h ago`;
}

export function elapsed(from: number, at: number) {
  const minutes = Math.floor(Math.max(0, at - from) / 60_000);
  if (minutes < 1) return "under a minute";
  if (minutes < 60) return `${minutes} min`;
  return `${Math.floor(minutes / 60)} hr ${minutes % 60} min`;
}
