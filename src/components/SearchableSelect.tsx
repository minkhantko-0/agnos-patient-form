"use client";

import { useState } from "react";

import {
  Combobox,
  ComboboxContent,
  ComboboxEmpty,
  ComboboxInput,
  ComboboxItem,
  ComboboxList,
} from "@/components/ui/combobox";

/**
 * A select you can type into, for the lists too long to scan — nationality is
 * 53 options. Base UI filters `items` against the input itself; the value is
 * still one of `options`, since typing narrows the list rather than setting a
 * free-text value.
 */
export function SearchableSelect({
  id,
  value,
  onChange,
  onBlur,
  options,
  placeholder,
  disabled,
  "aria-invalid": invalid,
  "aria-describedby": describedBy,
}: {
  id?: string;
  value: string;
  onChange: (value: string) => void;
  onBlur?: () => void;
  options: readonly string[];
  placeholder?: string;
  disabled?: boolean;
  "aria-invalid"?: boolean;
  "aria-describedby"?: string;
}) {
  const [open, setOpen] = useState(false);

  return (
    <Combobox
      items={options as string[]}
      // The form models "nothing chosen" as an empty string; Base UI uses null.
      value={value === "" ? null : value}
      onValueChange={(next) => onChange(next ?? "")}
      disabled={disabled}
      onOpenChange={setOpen}
    >
      <ComboboxInput
        id={id}
        className="w-full"
        placeholder={placeholder}
        disabled={disabled}
        aria-invalid={invalid}
        aria-describedby={describedBy}
        // Picking an option blurs the input; only leaving the field entirely
        // should hand control back to validation.
        onBlur={() => {
          if (!open) onBlur?.();
        }}
      />
      <ComboboxContent>
        <ComboboxEmpty>No match</ComboboxEmpty>
        <ComboboxList>
          {(option: string) => (
            <ComboboxItem key={option} value={option}>
              {option}
            </ComboboxItem>
          )}
        </ComboboxList>
      </ComboboxContent>
    </Combobox>
  );
}
