"use client";

import { useCallback, useMemo } from "react";

import {
  EMPTY_PATIENT,
  PATIENT_FIELDS,
  type PatientFormValues,
} from "./schema";

type Draft = { values: PatientFormValues; submitted: boolean };

const key = (sessionId: string) => `agnos:session:${sessionId}`;

/**
 * Keeps the patient's own copy of their answers in `localStorage`.
 *
 * Nothing is stored on a server, so a refresh would otherwise wipe a
 * half-finished form. This is the patient's device only — the staff view still
 * sees a session as gone the moment the tab closes.
 */
export function useDraft(sessionId: string) {
  const load = useCallback((): Draft | null => {
    try {
      const raw = window.localStorage.getItem(key(sessionId));
      if (!raw) return null;

      const parsed: unknown = JSON.parse(raw);
      if (typeof parsed !== "object" || parsed === null) return null;

      const { values, submitted } = parsed as Partial<Draft>;
      if (typeof values !== "object" || values === null) return null;

      // Rebuild from the known field list so a stored draft written by an older
      // version of the schema cannot inject unexpected keys.
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
          JSON.stringify({ values, submitted } satisfies Draft),
        );
      } catch {
        // Private browsing or a full quota — the form still works, it just
        // will not survive a refresh.
      }
    },
    [sessionId],
  );

  const clear = useCallback(() => {
    try {
      window.localStorage.removeItem(key(sessionId));
    } catch {
      // Nothing to recover from.
    }
  }, [sessionId]);

  // Stable identity: the form keeps this in an effect's dependency list, and a
  // fresh object each render would re-subscribe the watcher on every keystroke.
  return useMemo(() => ({ load, save, clear }), [load, save, clear]);
}
