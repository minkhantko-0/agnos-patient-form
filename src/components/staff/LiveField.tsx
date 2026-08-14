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
      // Remounting restarts the flash; toggling the class mid-animation would not.
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
      >
        {filled ? value : "—"}
      </dd>
    </div>
  );
}
