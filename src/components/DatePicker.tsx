"use client";

import { useState } from "react";
import type { DropdownProps } from "react-day-picker";
import { CalendarIcon } from "lucide-react";

import { Button } from "@/components/ui/button";
import { Calendar } from "@/components/ui/calendar";
import {
  Popover,
  PopoverContent,
  PopoverTrigger,
} from "@/components/ui/popover";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { cn } from "@/lib/utils";

// Local time throughout: `toISOString()` would shift the day west of UTC.
function toISODate(date: Date) {
  const month = `${date.getMonth() + 1}`.padStart(2, "0");
  const day = `${date.getDate()}`.padStart(2, "0");
  return `${date.getFullYear()}-${month}-${day}`;
}

function fromISODate(value: string) {
  const match = /^(\d{4})-(\d{2})-(\d{2})$/.exec(value);
  if (!match) return undefined;

  const [, year, month, day] = match.map(Number);
  const date = new Date(year, month - 1, day);

  // Rejects 2001-02-30, which the Date constructor rolls over into March.
  return date.getMonth() === month - 1 ? date : undefined;
}

// Replaces react-day-picker's native selects, whose popup the browser draws at
// full screen height for 127 years of options.
function CalendarDropdown({
  options = [],
  value,
  onChange,
  disabled,
  "aria-label": ariaLabel,
}: DropdownProps) {
  return (
    <Select
      value={value === undefined ? undefined : String(value)}
      disabled={disabled}
      onValueChange={(next) =>
        onChange?.({
          target: { value: next },
        } as React.ChangeEvent<HTMLSelectElement>)
      }
    >
      <SelectTrigger
        size="sm"
        aria-label={ariaLabel}
        className="h-8 border-0 bg-transparent px-2 font-medium shadow-none hover:bg-accent"
      >
        <SelectValue />
      </SelectTrigger>
      <SelectContent className="min-w-0">
        {options.map((option) => (
          <SelectItem
            key={option.value}
            value={String(option.value)}
            disabled={option.disabled}
          >
            {option.label}
          </SelectItem>
        ))}
      </SelectContent>
    </Select>
  );
}

export function DatePicker({
  id,
  value,
  onChange,
  onBlur,
  disabled,
  placeholder = "Select a date",
  fromYear = 1900,
  toDate = new Date(),
  "aria-invalid": invalid,
  "aria-describedby": describedBy,
}: {
  id?: string;
  value: string;
  onChange: (value: string) => void;
  onBlur?: () => void;
  disabled?: boolean;
  placeholder?: string;
  fromYear?: number;
  toDate?: Date;
  "aria-invalid"?: boolean;
  "aria-describedby"?: string;
}) {
  const [open, setOpen] = useState(false);

  const selected = fromISODate(value);
  const startMonth = new Date(fromYear, 0);

  return (
    <Popover
      open={open}
      onOpenChange={(next) => {
        setOpen(next);
        // Closing counts as leaving the field; blurring into the calendar does
        // not, or the field validates the moment it opens.
        if (!next) onBlur?.();
      }}
    >
      <PopoverTrigger asChild>
        <Button
          id={id}
          type="button"
          variant="outline"
          disabled={disabled}
          onBlur={() => {
            if (!open) onBlur?.();
          }}
          aria-invalid={invalid}
          aria-describedby={describedBy}
          className={cn(
            "w-full justify-between font-normal",
            !selected && "text-muted-foreground",
          )}
        >
          {selected
            ? selected.toLocaleDateString(undefined, {
                day: "numeric",
                month: "long",
                year: "numeric",
              })
            : placeholder}
          <CalendarIcon className="text-muted-foreground" />
        </Button>
      </PopoverTrigger>

      <PopoverContent
        className="w-(--radix-popover-trigger-width) p-0"
        align="start"
      >
        <Calendar
          mode="single"
          selected={selected}
          components={{ Dropdown: CalendarDropdown }}
          classNames={{
            root: "w-full",
            // Without z-10 the triggers sit under the prev/next arrows, which
            // are absolutely positioned over the same strip, and stop clicking.
            dropdowns:
              "relative z-10 flex h-(--cell-size) w-full items-center justify-center gap-1.5 text-sm font-medium",
          }}
          defaultMonth={selected ?? new Date(toDate.getFullYear() - 30, 0)}
          captionLayout="dropdown"
          startMonth={startMonth}
          endMonth={toDate}
          disabled={{ before: startMonth, after: toDate }}
          autoFocus
          onSelect={(date) => {
            if (!date) return;
            onChange(toISODate(date));
            setOpen(false);
          }}
        />
      </PopoverContent>
    </Popover>
  );
}
