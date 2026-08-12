"use client";

import { useEffect, useRef, useState } from "react";
import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";

import {
  EMPTY_PATIENT,
  FIELD_SECTIONS,
  REQUIRED_FIELDS,
  countCompleted,
  patientSchema,
  type PatientFormValues,
} from "@/lib/patient/schema";
import { useDraft } from "@/lib/patient/useDraft";
import { usePatientPublisher } from "@/lib/realtime/usePatientPublisher";
import { ConnectionBadge } from "@/components/ui/ConnectionBadge";

import { FormField } from "./FormField";
import { SubmittedPanel } from "./SubmittedPanel";

export function PatientForm({ sessionId }: { sessionId: string }) {
  const { connection, publish, seed, markSubmitted } =
    usePatientPublisher(sessionId);
  const draft = useDraft(sessionId);

  const [submitted, setSubmitted] = useState(false);
  const [completed, setCompleted] = useState(0);
  const restored = useRef(false);

  const form = useForm<PatientFormValues>({
    resolver: zodResolver(patientSchema),
    defaultValues: EMPTY_PATIENT,
    // Don't scold someone mid-word: validate when they leave a field, then keep
    // the message live as they correct it.
    mode: "onBlur",
    reValidateMode: "onChange",
  });

  const { register, handleSubmit, formState, watch, reset, getValues } = form;

  // Restore a draft from this device before wiring up the outbound feed, so the
  // first thing staff receive is the recovered form rather than a blank one.
  useEffect(() => {
    if (restored.current) return;
    restored.current = true;

    const saved = draft.load();
    if (!saved) return;

    reset(saved.values);
    setCompleted(countCompleted(saved.values));
    setSubmitted(saved.submitted);
    seed(saved.values);
  }, [draft, reset, seed]);

  // `watch`'s subscription form reports every keystroke without re-rendering
  // the whole form on each one.
  useEffect(() => {
    const subscription = watch((next) => {
      const values = next as PatientFormValues;
      publish(values);
      draft.save(values);
      setCompleted(countCompleted(values));
    });
    return () => subscription.unsubscribe();
  }, [watch, publish, draft]);

  const onSubmit = (values: PatientFormValues) => {
    markSubmitted(values);
    draft.save(values, true);
    setSubmitted(true);
  };

  if (submitted) {
    return (
      <SubmittedPanel
        values={getValues()}
        onEdit={() => {
          setSubmitted(false);
          draft.save(getValues(), false);
        }}
      />
    );
  }

  const total = REQUIRED_FIELDS.length;
  const percent = Math.round((completed / total) * 100);

  return (
    <form onSubmit={handleSubmit(onSubmit)} noValidate className="space-y-6">
      <div className="sticky top-0 z-10 -mx-4 border-b border-border bg-page/85 px-4 py-3 backdrop-blur sm:mx-0 sm:rounded-xl sm:border sm:px-5">
        <div className="flex items-center justify-between gap-3">
          <p className="text-sm font-medium text-ink">
            {completed} of {total} required fields
          </p>
          <ConnectionBadge state={connection} />
        </div>
        <div
          className="mt-2 h-1.5 overflow-hidden rounded-full bg-border"
          role="progressbar"
          aria-valuenow={percent}
          aria-valuemin={0}
          aria-valuemax={100}
          aria-label="Form completion"
        >
          <div
            className="h-full rounded-full bg-brand transition-[width] duration-300"
            style={{ width: `${percent}%` }}
          />
        </div>
      </div>

      {FIELD_SECTIONS.map((section) => (
        <fieldset
          key={section.id}
          className="rounded-xl border border-border bg-surface p-4 sm:p-6"
        >
          <legend className="px-1 text-base font-semibold text-ink">
            {section.title}
          </legend>
          <p className="mb-4 text-sm text-ink-muted">{section.description}</p>

          <div className="grid grid-cols-1 gap-4 sm:grid-cols-2">
            {section.fields.map((field) => (
              <FormField
                key={field}
                name={field}
                register={register}
                error={formState.errors[field]?.message}
              />
            ))}
          </div>
        </fieldset>
      ))}

      <div className="flex flex-col gap-3 sm:flex-row sm:items-center sm:justify-between">
        <p className="text-sm text-ink-muted">
          Staff can already see what you have typed. Submitting tells them the
          form is final.
        </p>
        <button
          type="submit"
          className="w-full rounded-lg bg-brand px-5 py-3 font-semibold text-brand-ink transition hover:bg-brand-hover focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-brand sm:w-auto"
        >
          Submit form
        </button>
      </div>

      {formState.submitCount > 0 && !formState.isValid && (
        <p role="alert" className="text-sm text-danger">
          Some required fields still need attention — they are marked above.
        </p>
      )}
    </form>
  );
}
