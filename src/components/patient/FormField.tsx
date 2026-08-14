"use client";

import { Controller, type Control, type UseFormRegister } from "react-hook-form";

import { Field, FieldError, FieldLabel } from "@/components/ui/field";
import { Input } from "@/components/ui/input";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { Textarea } from "@/components/ui/textarea";
import {
  FIELD_META,
  type PatientField,
  type PatientFormValues,
} from "@/lib/patient/schema";

/**
 * Renders whichever control `FIELD_META` declares for the field. Adding a field
 * to the schema is enough to make it appear here — there is no per-field JSX.
 */
export function FormField({
  name,
  register,
  control,
  error,
  disabled,
}: {
  name: PatientField;
  register: UseFormRegister<PatientFormValues>;
  control: Control<PatientFormValues>;
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
  };

  // Read out here rather than inside `render`, where the discriminant on
  // `meta.input` is no longer visible to the compiler.
  const options = meta.input.kind === "select" ? meta.input.options : [];

  return (
    <Field
      data-invalid={invalid}
      className={meta.input.kind === "textarea" ? "sm:col-span-2" : undefined}
    >
      <FieldLabel htmlFor={name} className="items-baseline">
        {meta.label}
        {"optional" in meta && meta.optional ? (
          <span className="text-xs font-normal text-muted-foreground">
            Optional
          </span>
        ) : (
          <span aria-hidden className="text-destructive">
            *
          </span>
        )}
      </FieldLabel>

      {meta.input.kind === "select" ? (
        // Radix's select is not a native control, so it cannot be wired up with
        // `register` — `Controller` bridges it to the form state instead. An
        // empty value matches no item, which is what shows the placeholder.
        <Controller
          name={name}
          control={control}
          render={({ field }) => (
            <Select
              value={field.value}
              onValueChange={field.onChange}
              disabled={disabled}
            >
              <SelectTrigger
                {...shared}
                className="w-full"
                ref={field.ref}
                onBlur={field.onBlur}
              >
                <SelectValue placeholder="Select…" />
              </SelectTrigger>
              <SelectContent>
                {options.map((option) => (
                  <SelectItem key={option} value={option}>
                    {option}
                  </SelectItem>
                ))}
              </SelectContent>
            </Select>
          )}
        />
      ) : meta.input.kind === "textarea" ? (
        <Textarea
          {...shared}
          {...register(name)}
          rows={meta.input.rows}
          placeholder={"placeholder" in meta ? meta.placeholder : undefined}
          className="resize-y"
        />
      ) : (
        <Input
          {...shared}
          {...register(name)}
          type={"type" in meta.input ? meta.input.type : "text"}
          autoComplete={meta.input.autoComplete}
          placeholder={"placeholder" in meta ? meta.placeholder : undefined}
        />
      )}

      <FieldError id={errorId}>{error}</FieldError>
    </Field>
  );
}
