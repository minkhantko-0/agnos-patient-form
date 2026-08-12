"use client";

import { useCallback, useEffect, useMemo, useRef } from "react";

/**
 * Rate-limits an outgoing send: the first call goes immediately, and further
 * calls inside the interval collapse into one trailing call at the end of it.
 *
 * Leading-edge matters here — the first keystroke in a burst should reach the
 * staff view without waiting out the interval — and the trailing call
 * guarantees the last keystroke is never the one that gets dropped.
 */
export function useTrailingThrottle(intervalMs: number, run: () => void) {
  const runRef = useRef(run);
  const lastRunAt = useRef(0);
  const timer = useRef<ReturnType<typeof setTimeout> | null>(null);

  useEffect(() => {
    runRef.current = run;
  }, [run]);

  const clear = useCallback(() => {
    if (timer.current === null) return;
    clearTimeout(timer.current);
    timer.current = null;
  }, []);

  /** Send right now, cancelling any pending trailing call. */
  const flush = useCallback(() => {
    clear();
    lastRunAt.current = Date.now();
    runRef.current();
  }, [clear]);

  /** Send now if the interval has elapsed, otherwise queue the trailing call. */
  const schedule = useCallback(() => {
    if (timer.current !== null) return;

    const wait = intervalMs - (Date.now() - lastRunAt.current);
    if (wait <= 0) {
      flush();
      return;
    }
    timer.current = setTimeout(flush, wait);
  }, [intervalMs, flush]);

  useEffect(() => clear, [clear]);

  return useMemo(
    () => ({ schedule, flush, cancel: clear }),
    [schedule, flush, clear],
  );
}
