import type { Metadata } from "next";

import { SetupNotice } from "@/components/SetupNotice";
import { SessionDetail } from "@/components/staff/SessionDetail";
import { isRealtimeConfigured } from "@/lib/realtime/client";

export const metadata: Metadata = { title: "Session" };

export default async function StaffSessionPage({
  params,
}: PageProps<"/staff/[sessionId]">) {
  const { sessionId } = await params;

  if (!isRealtimeConfigured) return <SetupNotice />;

  return <SessionDetail sessionId={sessionId} />;
}
