"use client";

import { useEffect, useRef, useState } from "react";
import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { TriangleAlertIcon } from "lucide-react";

import { ConnectionBadge } from "@/components/ConnectionBadge";
import { useSessionGuard } from "@/components/SessionGuard";
import { Alert, AlertTitle } from "@/components/ui/alert";
import { Button } from "@/components/ui/button";
import { Card, CardContent } from "@/components/ui/card";
import {
  FieldDescription,
  FieldGroup,
  FieldLegend,
  FieldSet,
} from "@/components/ui/field";
import { Progress } from "@/components/ui/progress";
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

import { FormField } from "./FormField";
import { SubmittedPanel } from "./SubmittedPanel";

const isFilled = (values: PatientFormValues) =>
  Object.values(values).some((value) => value.trim() !== "");

export function PatientForm({ sessionId }: { sessionId: string }) {
  const { connection, publish, seed, markSubmitted } =
    usePatientPublisher(sessionId);
  const draft = useDraft(sessionId);

  const [submitted, setSubmitted] = useState(false);
  const [completed, setCompleted] = useState(0);
  const [hasContent, setHasContent] = useState(false);
  const restored = useRef(false);
  const { setGuarded } = useSessionGuard();

  const form = useForm<PatientFormValues>({
    resolver: zodResolver(patientSchema),
    defaultValues: EMPTY_PATIENT,
    mode: "onBlur",
    reValidateMode: "onChange",
  });

  const { register, control, handleSubmit, formState, watch, reset, getValues } =
    form;

  // Restore before wiring up the feed, so staff receive the recovered form.
  useEffect(() => {
    if (restored.current) return;
    restored.current = true;

    const saved = draft.load();
    if (!saved) return;

    reset(saved.values);
    setCompleted(countCompleted(saved.values));
    setHasContent(isFilled(saved.values));
    setSubmitted(saved.submitted);
    seed(saved.values);
  }, [draft, reset, seed]);

  useEffect(() => {
    const subscription = watch((next) => {
      const values = next as PatientFormValues;
      publish(values);
      draft.save(values);
      setCompleted(countCompleted(values));
      setHasContent(isFilled(values));
    });
    return () => subscription.unsubscribe();
  }, [watch, publish, draft]);

  // Submitted forms are guarded too: leaving takes a finished form off the
  // front desk's screen, which is worse than losing a half-typed one.
  useEffect(() => {
    setGuarded(hasContent);
    return () => setGuarded(false);
  }, [hasContent, setGuarded]);

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
      <div className="sticky top-0 z-10 -mx-4 space-y-2 border-b bg-background/85 px-4 py-3 backdrop-blur sm:mx-0 sm:rounded-2xl sm:border sm:px-5">
        <div className="flex items-center justify-between gap-3">
          <p className="text-sm font-medium">
            {completed} of {total} required fields
          </p>
          <ConnectionBadge state={connection} />
        </div>
        <Progress value={percent} className="h-1.5" aria-label="Form completion" />
      </div>

      {FIELD_SECTIONS.map((section) => (
        <Card key={section.id}>
          <CardContent>
            <FieldSet>
              <div>
                <FieldLegend className="font-heading">
                  {section.title}
                </FieldLegend>
                <FieldDescription>{section.description}</FieldDescription>
              </div>

              <FieldGroup className="grid grid-cols-1 gap-6 sm:grid-cols-2">
                {section.fields.map((field) => (
                  <FormField
                    key={field}
                    name={field}
                    register={register}
                    control={control}
                    error={formState.errors[field]?.message}
                  />
                ))}
              </FieldGroup>
            </FieldSet>
          </CardContent>
        </Card>
      ))}

      {formState.submitCount > 0 && !formState.isValid && (
        <Alert variant="destructive">
          <TriangleAlertIcon />
          <AlertTitle>
            Some required fields still need attention — they are marked above.
          </AlertTitle>
        </Alert>
      )}

      <div className="flex flex-col gap-3 sm:flex-row sm:items-center sm:justify-between">
        <p className="text-sm text-muted-foreground">
          Staff can already see what you have typed. Submitting tells them the
          form is final.
        </p>
        <Button type="submit" size="lg" className="w-full sm:w-auto">
          Submit form
        </Button>
      </div>
    </form>
  );
}
