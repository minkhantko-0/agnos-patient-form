import { z } from "zod";

import {
  GENDERS,
  LANGUAGES,
  NATIONALITIES,
  RELATIONSHIPS,
  RELIGIONS,
} from "./options";

// Constrained string rather than `z.enum`: every select starts at `""`, so one
// type describes both a blank draft and a validated submission.
const requiredChoice = (options: readonly string[], message: string) =>
  z.string().refine((value) => options.includes(value), { message });

const optionalChoice = (options: readonly string[], message: string) =>
  z.string().refine((value) => value === "" || options.includes(value), {
    message,
  });

const digitsOnly = (value: string) => value.replace(/\D/g, "");

export const patientSchema = z.object({
  firstName: z
    .string()
    .trim()
    .min(1, "First name is required")
    .max(60, "Keep this under 60 characters"),

  middleName: z.string().trim().max(60, "Keep this under 60 characters"),

  lastName: z
    .string()
    .trim()
    .min(1, "Last name is required")
    .max(60, "Keep this under 60 characters"),

  dateOfBirth: z
    .string()
    .min(1, "Date of birth is required")
    .refine((value) => !Number.isNaN(Date.parse(value)), "Enter a valid date")
    .refine(
      (value) => Date.parse(value) <= Date.now(),
      "Date of birth cannot be in the future",
    )
    .refine(
      (value) => new Date(value).getUTCFullYear() >= 1900,
      "Enter a year from 1900 onwards",
    ),

  gender: requiredChoice(GENDERS, "Select a gender"),

  phone: z
    .string()
    .trim()
    .min(1, "Phone number is required")
    .refine(
      (value) => /^\+?[\d\s()./-]+$/.test(value),
      "Use digits, spaces and + ( ) - only",
    )
    .refine((value) => {
      const digits = digitsOnly(value).length;
      return digits >= 7 && digits <= 15;
    }, "Enter 7 to 15 digits"),

  email: z
    .string()
    .trim()
    .refine(
      (value) => value === "" || z.email().safeParse(value).success,
      "Enter a valid email address",
    ),

  address: z
    .string()
    .trim()
    .min(1, "Address is required")
    .min(5, "Enter the full address")
    .max(300, "Keep this under 300 characters"),

  preferredLanguage: requiredChoice(LANGUAGES, "Select a preferred language"),

  nationality: requiredChoice(NATIONALITIES, "Select a nationality"),

  religion: optionalChoice(RELIGIONS, "Select an option from the list"),

  emergencyContactName: z
    .string()
    .trim()
    .max(120, "Keep this under 120 characters"),

  emergencyContactRelationship: optionalChoice(
    RELATIONSHIPS,
    "Select an option from the list",
  ),
});

export type PatientFormValues = z.infer<typeof patientSchema>;
export type PatientField = keyof PatientFormValues;

type FieldMeta = {
  label: string;
  placeholder?: string;
  optional?: boolean;
  input:
    | { kind: "text"; type?: "text" | "tel" | "email"; autoComplete?: string }
    | { kind: "date" }
    | { kind: "select"; options: readonly string[]; searchable?: boolean }
    | { kind: "textarea"; rows: number };
};

/** Single source of truth: both the form and the staff view render from it. */
export const FIELD_META = {
  firstName: {
    label: "First name",
    input: { kind: "text", autoComplete: "given-name" },
  },
  middleName: {
    label: "Middle name",
    optional: true,
    input: { kind: "text", autoComplete: "additional-name" },
  },
  lastName: {
    label: "Last name",
    input: { kind: "text", autoComplete: "family-name" },
  },
  dateOfBirth: {
    label: "Date of birth",
    input: { kind: "date" },
  },
  gender: { label: "Gender", input: { kind: "select", options: GENDERS } },
  phone: {
    label: "Phone number",
    placeholder: "+66 81 234 5678",
    input: { kind: "text", type: "tel", autoComplete: "tel" },
  },
  email: {
    label: "Email",
    optional: true,
    placeholder: "name@example.com",
    input: { kind: "text", type: "email", autoComplete: "email" },
  },
  address: {
    label: "Address",
    placeholder: "Street, district, city, postal code",
    input: { kind: "textarea", rows: 3 },
  },
  preferredLanguage: {
    label: "Preferred language",
    input: { kind: "select", options: LANGUAGES, searchable: true },
  },
  nationality: {
    label: "Nationality",
    input: { kind: "select", options: NATIONALITIES, searchable: true },
  },
  religion: {
    label: "Religion",
    optional: true,
    input: { kind: "select", options: RELIGIONS },
  },
  emergencyContactName: {
    label: "Contact name",
    optional: true,
    input: { kind: "text", autoComplete: "off" },
  },
  emergencyContactRelationship: {
    label: "Relationship",
    optional: true,
    input: { kind: "select", options: RELATIONSHIPS },
  },
} as const satisfies Record<PatientField, FieldMeta>;

export const FIELD_SECTIONS = [
  {
    id: "identity",
    title: "Personal details",
    description: "As they appear on your passport or national ID.",
    fields: ["firstName", "middleName", "lastName", "dateOfBirth", "gender"],
  },
  {
    id: "contact",
    title: "Contact information",
    description: "How the clinic reaches you about this visit.",
    fields: ["phone", "email", "address"],
  },
  {
    id: "background",
    title: "Background",
    description: "Helps us assign the right interpreter and care team.",
    fields: ["preferredLanguage", "nationality", "religion"],
  },
  {
    id: "emergency",
    title: "Emergency contact",
    description: "Optional, but useful if we need to reach someone for you.",
    fields: ["emergencyContactName", "emergencyContactRelationship"],
  },
] as const satisfies ReadonlyArray<{
  id: string;
  title: string;
  description: string;
  fields: readonly PatientField[];
}>;

export const PATIENT_FIELDS = Object.keys(FIELD_META) as PatientField[];

export const REQUIRED_FIELDS = PATIENT_FIELDS.filter(
  (field) => !("optional" in FIELD_META[field] && FIELD_META[field].optional),
);

export const EMPTY_PATIENT: PatientFormValues = Object.fromEntries(
  PATIENT_FIELDS.map((field) => [field, ""]),
) as PatientFormValues;

/** Progress across required fields only. */
export function countCompleted(values: PatientFormValues) {
  return REQUIRED_FIELDS.filter((field) => values[field].trim() !== "").length;
}

export function displayName(values: PatientFormValues) {
  const name = [values.firstName, values.lastName]
    .map((part) => part.trim())
    .filter(Boolean)
    .join(" ");
  return name || "Unnamed patient";
}
