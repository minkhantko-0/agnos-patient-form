"use client";

import { useCallback, useMemo } from "react";

import {
  EMPTY_PATIENT,
  PATIENT_FIELDS,
  type PatientFormValues,
} from "./schema";

type Draft = { values: PatientFormValues; submitted: boolean };

const key = (sessionId: string) => `agnos:session:${sessionId}`;

/** The patient's own copy of their answers, on their device only. */
export function useDraft(sessionId: string) {
  const load = useCallback((): Draft | null => {
    try {
      const raw = window.localStorage.getItem(key(sessionId));
      if (!raw) return null;

      const parsed: unknown = JSON.parse(raw);
      if (typeof parsed !== "object" || parsed === null) return null;

      const { values, submitted } = parsed as Partial<Draft>;
      if (typeof values !== "object" || values === null) return null;

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
          JSON.stringify({ values, submitted } satisfies Draft),
        );
      } catch {
        // Private browsing or a full quota; the form still works.
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

  // Stable identity: the form has this in a dependency list.
  return useMemo(() => ({ load, save, clear }), [load, save, clear]);
}
