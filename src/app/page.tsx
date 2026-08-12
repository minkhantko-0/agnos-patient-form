import Link from "next/link";

const CARDS = [
  {
    href: "/form",
    eyebrow: "For patients",
    title: "Fill in the intake form",
    body: "Personal details, contact information and an optional emergency contact. Validated as you go, and saved on your device if you refresh.",
    cta: "Open the form",
    primary: true,
  },
  {
    href: "/staff",
    eyebrow: "For staff",
    title: "Watch sessions live",
    body: "Every open form appears in a list with its progress and whether the patient is typing, idle or done. Open one to follow it field by field.",
    cta: "Open the staff view",
    primary: false,
  },
];

export default function Home() {
  return (
    <div className="space-y-10">
      <section className="max-w-2xl">
        <p className="text-sm font-semibold tracking-wide text-brand uppercase">
          Agnos Intake
        </p>
        <h1 className="mt-3 text-3xl font-semibold text-balance text-ink sm:text-4xl">
          Patient intake that the front desk can watch as it happens
        </h1>
        <p className="mt-4 text-pretty text-ink-muted">
          A patient fills in the form on their phone. Staff see each field land
          in real time, along with whether the patient is still typing — so the
          desk knows a form is stuck before the patient has to ask.
        </p>
      </section>

      <section className="grid grid-cols-1 gap-4 md:grid-cols-2">
        {CARDS.map((card) => (
          <Link
            key={card.href}
            href={card.href}
            className="group flex flex-col rounded-xl border border-border bg-surface p-6 transition hover:border-brand hover:shadow-sm focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-brand"
          >
            <p className="text-xs font-semibold tracking-wide text-ink-faint uppercase">
              {card.eyebrow}
            </p>
            <h2 className="mt-2 text-xl font-semibold text-ink group-hover:text-brand">
              {card.title}
            </h2>
            <p className="mt-2 flex-1 text-sm text-ink-muted">{card.body}</p>
            <span
              className={`mt-5 inline-flex w-fit items-center gap-2 rounded-lg px-4 py-2 text-sm font-semibold transition ${
                card.primary
                  ? "bg-brand text-brand-ink group-hover:bg-brand-hover"
                  : "border border-border-strong text-ink group-hover:bg-surface-muted"
              }`}
            >
              {card.cta}
              <span aria-hidden>→</span>
            </span>
          </Link>
        ))}
      </section>

      <section className="rounded-xl border border-border bg-surface p-6">
        <h2 className="text-base font-semibold text-ink">Trying it out</h2>
        <p className="mt-2 max-w-2xl text-sm text-ink-muted">
          Open the staff view in one window and the patient form in another —
          two separate tabs each get their own session, so you can watch several
          patients at once. Typing in the form updates the staff view within a
          few hundred milliseconds.
        </p>
      </section>
    </div>
  );
}
