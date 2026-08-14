"use client";

import { CheckIcon } from "lucide-react";

import { Button } from "@/components/ui/button";
import {
  Card,
  CardContent,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";
import {
  Empty,
  EmptyContent,
  EmptyDescription,
  EmptyHeader,
  EmptyMedia,
  EmptyTitle,
} from "@/components/ui/empty";
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
      <Card>
        <Empty>
          <EmptyHeader>
            <EmptyMedia
              variant="icon"
              className="bg-status-submitted-soft text-status-submitted"
            >
              <CheckIcon />
            </EmptyMedia>
            <EmptyTitle>Form submitted</EmptyTitle>
            <EmptyDescription>
              Your details are with the front desk. Keep this tab open until a
              staff member confirms — closing it removes the session from their
              screen.
            </EmptyDescription>
          </EmptyHeader>
          <EmptyContent>
            <Button type="button" variant="outline" onClick={onEdit}>
              Make a correction
            </Button>
          </EmptyContent>
        </Empty>
      </Card>

      <Card>
        <CardHeader>
          <CardTitle>What you submitted</CardTitle>
        </CardHeader>
        <CardContent>
          <dl className="space-y-6">
            {FIELD_SECTIONS.map((section) => (
              <div key={section.id}>
                <p className="text-xs font-medium tracking-wide text-muted-foreground uppercase">
                  {section.title}
                </p>
                <div className="mt-2 grid grid-cols-1 gap-x-8 sm:grid-cols-2">
                  {section.fields.map((field) => (
                    <div
                      key={field}
                      className="flex justify-between gap-4 border-b py-2 last:border-0"
                    >
                      <dt className="text-muted-foreground">
                        {FIELD_META[field].label}
                      </dt>
                      <dd className="text-right font-medium">
                        {values[field].trim() || (
                          <span className="text-muted-foreground italic">
                            Not provided
                          </span>
                        )}
                      </dd>
                    </div>
                  ))}
                </div>
              </div>
            ))}
          </dl>
        </CardContent>
      </Card>
    </div>
  );
}
