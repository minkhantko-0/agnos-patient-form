"use client";

import { useCallback, useMemo } from "react";

import {
  EMPTY_PATIENT,
  PATIENT_FIELDS,
  type PatientFormValues,
} from "./schema";

type Draft = {
  values: PatientFormValues;
  submitted: boolean;
  savedAt: number;
};

const key = (sessionId: string) => `agnos:session:${sessionId}`;

/*
 * A waiting-room device is shared. Answers are useful for as long as the visit
 * lasts and a liability after that, so a draft this old is dropped on sight
 * rather than sitting in localStorage indefinitely.
 */
const MAX_AGE_MS = 12 * 60 * 60 * 1_000;

function remove(sessionId: string) {
  try {
    window.localStorage.removeItem(key(sessionId));
  } catch {
    // Nothing to recover from.
  }
}

/** The patient's own copy of their answers, on their device only. */
export function useDraft(sessionId: string) {
  const load = useCallback((): Omit<Draft, "savedAt"> | null => {
    try {
      const raw = window.localStorage.getItem(key(sessionId));
      if (!raw) return null;

      const parsed: unknown = JSON.parse(raw);
      if (typeof parsed !== "object" || parsed === null) return null;

      const { values, submitted, savedAt } = parsed as Partial<Draft>;
      if (typeof values !== "object" || values === null) return null;

      if (typeof savedAt !== "number" || Date.now() - savedAt > MAX_AGE_MS) {
        remove(sessionId);
        return null;
      }

      // Rebuild from the known fields so an older draft cannot inject keys.
      const restored = { ...EMPTY_PATIENT };
      for (const field of PATIENT_FIELDS) {
        const value = (values as Record<string, unknown>)[field];
        if (typeof value === "string") restored[field] = value;
      }

      return { values: restored, submitted: submitted === true };
    } catch {
      return null;
    }
  }, [sessionId]);

  const save = useCallback(
    (values: PatientFormValues, submitted = false) => {
      try {
        window.localStorage.setItem(
          key(sessionId),
          JSON.stringify({
            values,
            submitted,
            savedAt: Date.now(),
          } satisfies Draft),
        );
      } catch {
        // Private browsing or a full quota; the form still works.
      }
    },
    [sessionId],
  );

  const clear = useCallback(() => remove(sessionId), [sessionId]);

  // Stable identity: the form has this in a dependency list.
  return useMemo(() => ({ load, save, clear }), [load, save, clear]);
}
