import type { Metadata } from "next";

import { PatientForm } from "@/components/patient/PatientForm";
import { SetupNotice } from "@/components/SetupNotice";
import { isRealtimeConfigured } from "@/lib/realtime/client";

export const metadata: Metadata = { title: "Patient form" };

export default async function PatientFormPage({
  params,
}: PageProps<"/form/[sessionId]">) {
  const { sessionId } = await params;

  if (!isRealtimeConfigured) return <SetupNotice />;

  return (
    <div className="mx-auto max-w-3xl space-y-6">
      <header>
        <h1 className="text-2xl font-semibold text-ink">Patient intake</h1>
        <p className="mt-1 text-sm text-ink-muted">
          Fields marked <span className="text-danger">*</span> are required. Your
          answers reach the front desk as you type — there is nothing to save.
        </p>
      </header>

      <PatientForm sessionId={sessionId} />
    </div>
  );
}
