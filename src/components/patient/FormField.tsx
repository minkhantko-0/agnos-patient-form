"use client";

import type { UseFormRegister } from "react-hook-form";

import {
  FIELD_META,
  type PatientField,
  type PatientFormValues,
} from "@/lib/patient/schema";

const CONTROL =
  "w-full rounded-lg border border-border bg-surface px-3 py-2.5 text-ink " +
  "outline-none transition placeholder:text-ink-faint " +
  "focus:border-brand focus:ring-2 focus:ring-brand/30 " +
  "aria-invalid:border-danger aria-invalid:ring-2 aria-invalid:ring-danger/20 " +
  "disabled:cursor-not-allowed disabled:opacity-60";

/**
 * Renders whichever control `FIELD_META` declares for the field. Adding a field
 * to the schema is enough to make it appear here — there is no per-field JSX.
 */
export function FormField({
  name,
  register,
  error,
  disabled,
}: {
  name: PatientField;
  register: UseFormRegister<PatientFormValues>;
  error?: string;
  disabled?: boolean;
}) {
  const meta = FIELD_META[name];
  const errorId = `${name}-error`;
  const invalid = Boolean(error);

  const shared = {
    id: name,
    disabled,
    "aria-invalid": invalid,
    "aria-describedby": invalid ? errorId : undefined,
    ...register(name),
  };

  return (
    <div className={meta.input.kind === "textarea" ? "sm:col-span-2" : ""}>
      <label
        htmlFor={name}
        className="mb-1.5 flex items-baseline gap-2 text-sm font-medium text-ink"
      >
        {meta.label}
        {"optional" in meta && meta.optional ? (
          <span className="text-xs font-normal text-ink-faint">Optional</span>
        ) : (
          <span aria-hidden className="text-danger">
            *
          </span>
        )}
      </label>

      {meta.input.kind === "select" ? (
        <select {...shared} className={CONTROL}>
          {/* Matches the `""` the form is initialised with, so an untouched
              select shows the prompt instead of silently picking option one. */}
          <option value="">Select…</option>
          {meta.input.options.map((option) => (
            <option key={option} value={option}>
              {option}
            </option>
          ))}
        </select>
      ) : meta.input.kind === "textarea" ? (
        <textarea
          {...shared}
          rows={meta.input.rows}
          placeholder={"placeholder" in meta ? meta.placeholder : undefined}
          className={`${CONTROL} resize-y`}
        />
      ) : (
        <input
          {...shared}
          type={"type" in meta.input ? meta.input.type : "text"}
          autoComplete={meta.input.autoComplete}
          placeholder={"placeholder" in meta ? meta.placeholder : undefined}
          className={CONTROL}
        />
      )}

      {error && (
        <p id={errorId} className="mt-1.5 text-sm text-danger">
          {error}
        </p>
      )}
    </div>
  );
}
