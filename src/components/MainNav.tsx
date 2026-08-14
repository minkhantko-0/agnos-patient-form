"use client";

import { usePathname } from "next/navigation";

import { GuardedLink } from "@/components/SessionGuard";
import { Button } from "@/components/ui/button";
import { isCurrentView } from "@/lib/nav";

const LINKS = [
  { href: "/form", label: "Patient form" },
  { href: "/staff", label: "Staff view" },
];

export function MainNav() {
  const pathname = usePathname();

  return (
    <>
      {LINKS.map(({ href, label }) => {
        const current = isCurrentView(pathname, href);

        return (
          <Button
            key={href}
            variant={current ? "secondary" : "ghost"}
            size="sm"
            className={current ? undefined : "text-muted-foreground"}
            asChild
          >
            <GuardedLink
              href={href}
              aria-current={current ? "page" : undefined}
            >
              {label}
            </GuardedLink>
          </Button>
        );
      })}
    </>
  );
}
