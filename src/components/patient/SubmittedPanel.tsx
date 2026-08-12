"use client";

import {
  FIELD_META,
  FIELD_SECTIONS,
  type PatientFormValues,
} from "@/lib/patient/schema";

export function SubmittedPanel({
  values,
  onEdit,
}: {
  values: PatientFormValues;
  onEdit: () => void;
}) {
  return (
    <div className="space-y-6">
      <div className="rounded-xl border border-border bg-surface p-6 text-center">
        <div className="mx-auto flex h-12 w-12 items-center justify-center rounded-full bg-brand-soft">
          <svg
            viewBox="0 0 24 24"
            fill="none"
            stroke="currentColor"
            strokeWidth={2.5}
            strokeLinecap="round"
            strokeLinejoin="round"
            className="h-6 w-6 text-brand"
            aria-hidden
          >
            <path d="m5 13 4 4L19 7" />
          </svg>
        </div>
        <h2 className="mt-4 text-xl font-semibold text-ink">Form submitted</h2>
        <p className="mx-auto mt-2 max-w-md text-sm text-ink-muted">
          Your details are with the front desk. Keep this tab open until a staff
          member confirms — closing it removes the session from their screen.
        </p>
        <button
          type="button"
          onClick={onEdit}
          className="mt-5 rounded-lg border border-border-strong px-4 py-2 text-sm font-medium text-ink transition hover:bg-surface-muted focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-brand"
        >
          Make a correction
        </button>
      </div>

      <div className="rounded-xl border border-border bg-surface p-4 sm:p-6">
        <h3 className="text-base font-semibold text-ink">What you submitted</h3>
        <dl className="mt-4 space-y-5">
          {FIELD_SECTIONS.map((section) => (
            <div key={section.id}>
              <p className="text-xs font-semibold tracking-wide text-ink-faint uppercase">
                {section.title}
              </p>
              <div className="mt-2 grid grid-cols-1 gap-x-6 gap-y-2 sm:grid-cols-2">
                {section.fields.map((field) => (
                  <div
                    key={field}
                    className="flex justify-between gap-4 border-b border-border py-1.5 last:border-0"
                  >
                    <dt className="text-sm text-ink-muted">
                      {FIELD_META[field].label}
                    </dt>
                    <dd className="text-right text-sm font-medium text-ink">
                      {values[field].trim() || (
                        <span className="text-ink-faint">Not provided</span>
                      )}
                    </dd>
                  </div>
                ))}
              </div>
            </div>
          ))}
        </dl>
      </div>
    </div>
  );
}
