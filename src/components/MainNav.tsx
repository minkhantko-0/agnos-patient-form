"use client";

import Link from "next/link";
import { usePathname } from "next/navigation";

import { Button } from "@/components/ui/button";

const LINKS = [
  { href: "/form", label: "Patient form" },
  { href: "/staff", label: "Staff view" },
];

export function MainNav() {
  const pathname = usePathname();

  return (
    <>
      {LINKS.map(({ href, label }) => {
        // Session routes live under each root, so /staff/abc123 still marks
        // the staff tab as current.
        const current = pathname === href || pathname.startsWith(`${href}/`);

        return (
          <Button
            key={href}
            variant={current ? "secondary" : "ghost"}
            size="sm"
            className={current ? undefined : "text-muted-foreground"}
            asChild
          >
            <Link href={href} aria-current={current ? "page" : undefined}>
              {label}
            </Link>
          </Button>
        );
      })}
    </>
  );
}
