"use client";

import { useEffect } from "react";
import { useRouter } from "next/navigation";

import { randomId } from "@/lib/realtime/client";

/**
 * `/form` mints a session and forwards to `/form/<id>`.
 *
 * The id lives in `sessionStorage`, which is per-tab: refreshing keeps the same
 * session (and so the same row in the staff list), while a second tab becomes a
 * second patient — which is what makes the multi-session view demonstrable on
 * one machine.
 */
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
