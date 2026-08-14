"use client";

import { useEffect } from "react";
import { useRouter } from "next/navigation";

import { randomId } from "@/lib/realtime/client";

// sessionStorage is per-tab: a refresh keeps the session, a second tab becomes
// a second patient.
const ACTIVE_SESSION_KEY = "agnos:active-session";

export default function NewSessionPage() {
  const router = useRouter();

  useEffect(() => {
    let sessionId = window.sessionStorage.getItem(ACTIVE_SESSION_KEY);

    if (!sessionId) {
      sessionId = randomId(8);
      window.sessionStorage.setItem(ACTIVE_SESSION_KEY, sessionId);
    }

    router.replace(`/form/${sessionId}`);
  }, [router]);

  return (
    <p className="py-20 text-center text-sm text-muted-foreground" role="status">
      Starting your session…
    </p>
  );
}
