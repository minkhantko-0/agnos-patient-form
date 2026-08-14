"use client";

import { FIELD_META, type PatientField } from "@/lib/patient/schema";
import { cn } from "@/lib/utils";

export function LiveField({
  field,
  value,
  changed,
}: {
  field: PatientField;
  value: string;
  changed: boolean;
}) {
  const meta = FIELD_META[field];
  const filled = value.trim() !== "";

  return (
    <div
      // Remounting on each change restarts the flash animation, which a plain
      // class toggle would not do while the previous one is still running.
      key={changed ? "on" : "off"}
      className={cn("rounded-lg px-3 py-2", changed && "field-flash")}
    >
      <dt className="flex items-baseline gap-2 text-xs text-muted-foreground">
        {meta.label}
        {"optional" in meta && meta.optional && (
          <span className="text-[10px] tracking-wide uppercase">optional</span>
        )}
      </dt>
      <dd
        className={cn(
          "mt-0.5 text-sm break-words",
          filled ? "font-medium" : "text-muted-foreground italic",
        )}
        // Announce the new value to a screen reader when it lands.
        aria-live="polite"
      >
        {filled ? value : "—"}
      </dd>
    </div>
  );
}
