"use client";

import { createContext, useContext, useMemo, useState } from "react";
import Link from "next/link";
import { useRouter } from "next/navigation";

import {
  AlertDialog,
  AlertDialogAction,
  AlertDialogCancel,
  AlertDialogContent,
  AlertDialogDescription,
  AlertDialogFooter,
  AlertDialogHeader,
  AlertDialogTitle,
} from "@/components/ui/alert-dialog";

type Guard = {
  guarded: boolean;
  setGuarded: (guarded: boolean) => void;
  confirmLeaving: (href: string) => void;
};

const SessionGuardContext = createContext<Guard>({
  guarded: false,
  setGuarded: () => {},
  confirmLeaving: () => {},
});

export function useSessionGuard() {
  return useContext(SessionGuardContext);
}

export function SessionGuardProvider({
  children,
}: {
  children: React.ReactNode;
}) {
  const router = useRouter();
  const [guarded, setGuarded] = useState(false);
  const [pending, setPending] = useState<string | null>(null);

  const value = useMemo(
    () => ({ guarded, setGuarded, confirmLeaving: setPending }),
    [guarded],
  );

  return (
    <SessionGuardContext.Provider value={value}>
      {children}

      <AlertDialog
        open={pending !== null}
        onOpenChange={(open) => !open && setPending(null)}
      >
        <AlertDialogContent>
          <AlertDialogHeader>
            <AlertDialogTitle>Leaving ends your session</AlertDialogTitle>
            <AlertDialogDescription>
              The front desk can see your form only while this tab is open. Your
              answers stay on this device, but the session disappears from their
              screen until you come back.
            </AlertDialogDescription>
          </AlertDialogHeader>
          <AlertDialogFooter>
            <AlertDialogCancel>Stay on the form</AlertDialogCancel>
            <AlertDialogAction
              variant="ghost"
              onClick={() => pending && router.push(pending)}
            >
              Leave anyway
            </AlertDialogAction>
            <AlertDialogAction
              onClick={() => pending && window.open(pending, "_blank", "noopener")}
            >
              Open in a new tab
            </AlertDialogAction>
          </AlertDialogFooter>
        </AlertDialogContent>
      </AlertDialog>
    </SessionGuardContext.Provider>
  );
}

/**
 * A `Link` that asks before navigating away from a guarded page. `onNavigate`
 * covers client-side navigation only, which is all the header does.
 */
export function GuardedLink({
  href,
  onNavigate,
  ...props
}: React.ComponentProps<typeof Link>) {
  const { guarded, confirmLeaving } = useSessionGuard();

  return (
    <Link
      href={href}
      onNavigate={(event) => {
        if (guarded) {
          event.preventDefault();
          confirmLeaving(String(href));
          return;
        }
        onNavigate?.(event);
      }}
      {...props}
    />
  );
}
