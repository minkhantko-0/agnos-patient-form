"use client";

import { Controller, type Control, type UseFormRegister } from "react-hook-form";

import { DatePicker } from "@/components/DatePicker";
import { SearchableSelect } from "@/components/SearchableSelect";
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

  // Hoisted: inside `render` the discriminant on `meta.input` is lost.
  const options = meta.input.kind === "select" ? meta.input.options : [];
  const searchable =
    meta.input.kind === "select" &&
    "searchable" in meta.input &&
    meta.input.searchable;

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

      {meta.input.kind === "select" && searchable ? (
        <Controller
          name={name}
          control={control}
          render={({ field }) => (
            <SearchableSelect
              {...shared}
              value={field.value}
              onChange={field.onChange}
              onBlur={field.onBlur}
              options={options}
              placeholder="Search…"
            />
          )}
        />
      ) : meta.input.kind === "select" ? (
        // Not a native control, so `register` cannot drive it. An empty value
        // matches no item, which is what shows the placeholder.
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
      ) : meta.input.kind === "date" ? (
        <Controller
          name={name}
          control={control}
          render={({ field }) => (
            <DatePicker
              {...shared}
              value={field.value}
              onChange={field.onChange}
              onBlur={field.onBlur}
              placeholder="Select a date of birth"
            />
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
