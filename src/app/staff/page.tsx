import type { Metadata } from "next";

import { SetupNotice } from "@/components/SetupNotice";
import { StaffDashboard } from "@/components/staff/StaffDashboard";
import { isRealtimeConfigured } from "@/lib/realtime/client";

export const metadata: Metadata = { title: "Staff view" };

export default function StaffPage() {
  if (!isRealtimeConfigured) return <SetupNotice />;

  return <StaffDashboard />;
}
