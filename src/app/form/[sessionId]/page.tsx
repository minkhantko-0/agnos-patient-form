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
        <h1 className="font-heading text-2xl font-medium">Patient intake</h1>
        <p className="mt-1 text-sm text-muted-foreground">
          Fields marked <span className="text-destructive">*</span> are
          required. Your answers reach the front desk as you type — there is
          nothing to save. Keep this tab open: leaving the page takes your
          session off their screen, though your answers stay on this device.
        </p>
      </header>

      <PatientForm sessionId={sessionId} />
    </div>
  );
}
