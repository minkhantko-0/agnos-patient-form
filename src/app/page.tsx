import Link from "next/link";
import { ArrowRightIcon, ClipboardListIcon, RadioIcon } from "lucide-react";

import { Button } from "@/components/ui/button";
import {
  Card,
  CardContent,
  CardDescription,
  CardFooter,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";

const CARDS = [
  {
    href: "/form",
    icon: ClipboardListIcon,
    eyebrow: "For patients",
    title: "Fill in the intake form",
    body: "Personal details, contact information and an optional emergency contact. Validated as you go, and saved on your device if you refresh.",
    cta: "Open the form",
    variant: "default" as const,
  },
  {
    href: "/staff",
    icon: RadioIcon,
    eyebrow: "For staff",
    title: "Watch sessions live",
    body: "Every open form appears in a list with its progress and whether the patient is typing, idle or done. Open one to follow it field by field.",
    cta: "Open the staff view",
    variant: "outline" as const,
  },
];

export default function Home() {
  return (
    <div className="space-y-10">
      <section className="max-w-2xl">
        <p className="text-sm font-medium tracking-wide text-primary uppercase">
          Agnos Intake
        </p>
        <h1 className="mt-3 font-heading text-3xl font-medium text-balance sm:text-4xl">
          Patient intake that the front desk can watch as it happens
        </h1>
        <p className="mt-4 text-pretty text-muted-foreground">
          A patient fills in the form on their phone. Staff see each field land
          in real time, along with whether the patient is still typing — so the
          desk knows a form is stuck before the patient has to ask.
        </p>
      </section>

      <section className="grid grid-cols-1 gap-4 md:grid-cols-2">
        {CARDS.map((card) => (
          <Card key={card.href} className="justify-between">
            <CardHeader>
              <span className="flex size-9 items-center justify-center rounded-lg bg-muted text-muted-foreground">
                <card.icon className="size-5" />
              </span>
            </CardHeader>
            <CardContent className="space-y-2">
              <p className="text-xs font-medium tracking-wide text-muted-foreground uppercase">
                {card.eyebrow}
              </p>
              <CardTitle className="text-xl">{card.title}</CardTitle>
              <CardDescription>{card.body}</CardDescription>
            </CardContent>
            <CardFooter>
              <Button variant={card.variant} asChild>
                <Link href={card.href}>
                  {card.cta}
                  <ArrowRightIcon data-icon="inline-end" />
                </Link>
              </Button>
            </CardFooter>
          </Card>
        ))}
      </section>

      <Card size="sm">
        <CardHeader>
          <CardTitle>Trying it out</CardTitle>
          <CardDescription className="max-w-2xl">
            Open the staff view in one window and the patient form in another —
            two separate tabs each get their own session, so you can watch
            several patients at once. Typing in the form updates the staff view
            within a few hundred milliseconds.
          </CardDescription>
        </CardHeader>
      </Card>
    </div>
  );
}
