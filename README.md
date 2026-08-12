# Agnos Intake

A responsive patient intake form with a live staff view. A patient fills in the
form on their phone; staff watch each field arrive in real time, along with
whether the patient is still typing, has gone quiet, or has submitted.

- **Live demo:** _(add deployed URL)_
- **Patient form:** `/form`
- **Staff view:** `/staff`

Open the staff view in one window and the form in another to see it work. Each
browser tab gets its own session, so one machine can simulate several patients.

---

## Running it locally

```bash
npm install
cp .env.example .env.local   # then fill in the two values below
npm run dev
```

Open http://localhost:3000.

### Supabase setup

Realtime sync uses Supabase Realtime. **No database tables, migrations, or auth
setup are required** — the app uses Broadcast and Presence channels only, and
never writes a row.

1. Create a free project at [supabase.com](https://supabase.com).
2. Open **Project Settings → API Keys**.
3. Put the project URL and the *anon / publishable* key into `.env.local`:

```bash
NEXT_PUBLIC_SUPABASE_URL=https://your-project.supabase.co
NEXT_PUBLIC_SUPABASE_ANON_KEY=your-anon-key
```

If these are missing the app renders a setup notice rather than sitting on
"Connecting…" forever.

### Scripts

| Command | Purpose |
| --- | --- |
| `npm run dev` | Development server |
| `npm run build` | Production build |
| `npm start` | Serve the production build |
| `npx tsc --noEmit` | Type check |
| `npx eslint src` | Lint |

---

## Deployment

Deployed on **Vercel**. Import the repository, add the two `NEXT_PUBLIC_*`
environment variables, and deploy — there is no build configuration to change.

Vercel's serverless functions cannot hold open WebSocket connections, which is
why the realtime transport is Supabase rather than a WebSocket server of our
own. Supabase Realtime *is* WebSockets; the socket runs browser-to-Supabase and
never touches the Next.js server. The application is therefore fully static
apart from the two dynamic session routes, and scales without sticky sessions.

---

# Development planning documentation

## Project structure

```
src/
├── app/                        Routes only — each page is a thin shell
│   ├── page.tsx                Landing / role chooser
│   ├── form/page.tsx           Mints a session id, redirects to /form/<id>
│   ├── form/[sessionId]/       Patient form
│   ├── staff/page.tsx          Live list of active sessions
│   └── staff/[sessionId]/      One session, field by field
│
├── components/
│   ├── patient/                PatientForm, FormField, SubmittedPanel
│   ├── staff/                  StaffDashboard, SessionCard, SessionDetail, LiveField
│   ├── ui/                     StatusPill, ConnectionBadge
│   └── SetupNotice.tsx         Shown when env vars are absent
│
└── lib/
    ├── patient/
    │   ├── options.ts          Choice lists for the selects
    │   ├── schema.ts           Zod schema + field registry (see below)
    │   └── useDraft.ts         localStorage draft persistence
    ├── realtime/
    │   ├── protocol.ts         Channel names, event names, payload types
    │   ├── client.ts           Supabase client singleton
    │   ├── usePatientPublisher.ts   Outbound: everything the patient sends
    │   ├── useLobby.ts              Inbound: who is currently filling in
    │   ├── useSessionMonitor.ts     Inbound: one session's field values
    │   └── useTrailingThrottle.ts   Leading+trailing send rate limiter
    └── time.ts                 Shared ticking clock for relative timestamps
```

Three rules shape the layout:

- **Routes hold no logic.** Every `page.tsx` resolves params, checks
  configuration, and renders one component. This keeps the realtime code out of
  the server/client boundary entirely.
- **Realtime is a library, not a component concern.** Components call a hook and
  get plain values back. No component imports `@supabase/supabase-js`.
- **The form is data, not markup.** `FIELD_META` in `schema.ts` declares every
  field's label, control type, and whether it is optional. The patient form and
  the staff view both render from it, so adding a field means editing one
  object — and the two sides can never disagree about a label or drift apart.

## Design

The visual system is a small set of CSS custom properties declared once and
re-declared under `prefers-color-scheme: dark`, mapped to Tailwind utilities
through `@theme inline`. Because the tokens flip rather than the classes, almost
no component carries a `dark:` variant — `bg-surface` is correct in both
schemes. Native controls follow via `color-scheme`, so the date picker is themed
too.

**Mobile first.** Patients are on phones in a waiting room; staff are usually at
a desk. The two interfaces are shaped by that difference rather than by one
shared responsive grid:

| | Mobile | Tablet | Desktop |
| --- | --- | --- | --- |
| Patient form | Single column, full-width controls, `sticky` progress bar | Two columns within each section | Capped at `max-w-3xl` — a 1400px-wide form is harder to read, not easier |
| Staff list | One card per row | Two columns | Three columns |
| Staff detail | Sections stacked | Stacked | Two columns, so a whole form fits without scrolling |

Specific decisions:

- **Progress is measured against required fields only.** Counting the optional
  ones would make a complete form read as 85% done and stall the bar near the
  end.
- **Validation waits for blur, then goes live.** `mode: "onBlur"` with
  `reValidateMode: "onChange"` means nobody is told their email is invalid while
  they are still typing the domain, but a correction clears the error
  immediately.
- **Only the active status pulses.** An indicator that animates in every state
  stops carrying information.
- **Changed fields flash once** in the staff view, ~1.4s, and the animation is
  replaced by a static outline under `prefers-reduced-motion`.
- **The first message never flashes.** Opening a session mid-form would
  otherwise light up every field at once, which reads as noise rather than as an
  update.
- Touch targets are ≥44px, every input has a real `<label>`, errors are wired up
  with `aria-describedby`, and status changes are announced with `aria-live`.

## Component architecture

```
app/form/[sessionId]                       app/staff                app/staff/[sessionId]
        │                                       │                          │
   PatientForm ──── usePatientPublisher    StaffDashboard ─ useLobby   SessionDetail
        │                                       │                       │        │
    FormField ×13                          SessionCard ×N        useSessionMonitor
        │                                                              LiveField ×13
  SubmittedPanel
```

| Component | Purpose |
| --- | --- |
| `PatientForm` | Owns form state (react-hook-form + Zod), subscribes to its own changes and forwards them to the publisher, saves a local draft, and swaps to the confirmation panel on submit. |
| `FormField` | Renders whichever control `FIELD_META` declares — text, select, or textarea — with its label, optional marker, and error. There is no per-field JSX anywhere. |
| `SubmittedPanel` | Confirmation plus a read-back of what was sent, with a route back into editing. |
| `StaffDashboard` | The lobby: active session count, connection state, and a card grid. |
| `SessionCard` | One session at a glance — name, status, progress, how long it has been open, last activity. |
| `SessionDetail` | Combines presence and broadcast into a single status, then renders the whole form read-only. |
| `LiveField` | One label/value pair that flashes when its value changes. |
| `StatusPill` / `ConnectionBadge` | The two indicators, shared by both views. |

The hooks are the seam. `usePatientPublisher` is everything the patient sends;
`useLobby` and `useSessionMonitor` are everything staff receive. Each returns
plain data, so every component in the tree can be rendered and reasoned about
without a live connection.

## Real-time synchronisation flow

Two channels, deliberately separate.

```mermaid
sequenceDiagram
    participant P as Patient tab
    participant SB as Supabase Realtime
    participant L as Staff list
    participant D as Staff detail

    P->>SB: track() on `lobby` — identity, once only
    SB-->>L: presence sync → session appears in the list
    L->>SB: broadcast `hello` on `lobby`
    P->>SB: broadcast `summary` — name, status, progress
    SB-->>L: card fills in

    D->>SB: subscribe `session:<id>`
    D->>SB: broadcast `hello`
    SB-->>P: `hello`
    P->>SB: broadcast `state` (full form, revision n)
    SB-->>D: `state` → detail view populates

    loop while typing
        P->>SB: `state` (throttled to 150ms)
        SB-->>D: changed fields flash
        P->>SB: `summary` (throttled to 1s)
        SB-->>L: card progress updates
    end

    Note over P: 4s of silence
    P->>SB: `state` with status "idle"

    P->>SB: `state` with status "submitted"

    P--xSB: tab closes
    SB-->>L: presence leave → "Left the form"
```

**`lobby` — Presence *and* broadcast, doing different jobs.** Presence answers
"is this tab still open": each patient tracks `{ sessionId, startedAt }` exactly
once on join and never updates it. Supabase evicts a client's presence when its
socket drops, so a closed tab needs no heartbeat or timeout logic here. The
things that change — name, status, progress — are broadcast as a `summary`
instead. The staff list uses presence as the gate and the summary for detail.

**`session:<id>` — Broadcast.** Carries the actual field values, so form
contents reach only the staff member who opened that session rather than
everyone looking at the list.

### Design decisions

**Full state on every message, not diffs.** The payload is a flat record of
short strings — under a kilobyte even when complete — so sending all of it costs
less than the bookkeeping a diff protocol needs to stay correct. It also
self-heals: a staff tab that misses a message while backgrounded is repaired by
the next one, instead of holding a permanently corrupt merge.

**A `hello` handshake on open.** Broadcast keeps no history, so a staff tab
opening onto a half-filled form would see nothing until the next keystroke. It
announces itself; the patient tab replays its current state immediately.

**Revision numbers.** Broadcast does not guarantee ordering, so each message
carries a counter and the staff side drops anything older than what it has
already applied.

**Two throttle rates.** Field values are throttled to 150ms and presence to 1s,
both leading-edge-plus-trailing: the first keystroke of a burst goes out
immediately, and the last one is never the one that gets dropped. The staff list
only shows a summary, so it does not need keystroke granularity, and the coarser
rate keeps a room full of patients well inside Supabase's per-client event
limit.

**Presence is never used as an update channel.** This one was learned the hard
way: an earlier version re-called `track()` once a second to publish progress,
and cards blinked out of the staff list while patients were still typing.
Re-tracking is an untrack-then-track, and Supabase coalesces rapid presence
updates — so an observer sees the key leave with empty metas and only reappear
on a later diff. Presence now carries identity only. Relatedly, the staff list
rebuilds from `presenceState()` only on the `sync` event, because a `join` or
`leave` handler can observe the state mid-update.

**Nothing is pushed at a channel that has not joined.** `channel.send()` on a
joining channel does not fail — supabase-js quietly falls back to a REST POST.
Both senders check first and skip, which is safe precisely because messages
carry full state and every hook re-flushes from its `SUBSCRIBED` callback.

**Status is computed by whoever knows best.** The patient tab owns
`filling → idle → submitted`, because only it knows when someone stopped typing.
`disconnected` is inferred by staff from presence. The detail view prefers the
broadcast status while the patient is present (it is ~6× fresher) and falls back
to presence otherwise — with one exception: a submitted form stays "Submitted"
after the tab closes rather than decaying to "Left the form".

### What is deliberately not persisted

Nothing is stored server-side. Form contents live in the patient's browser and
are relayed through Realtime; closing the tab ends the session and the staff
view says so explicitly. This matches the brief — which asks for real-time
monitoring, not a patient record system — and means no patient data is written
to a database. A patient's own answers survive a refresh via `localStorage` on
their device only.

Adding durable submissions later would mean one Postgres table and an insert on
submit; nothing about the realtime layer would change.

---

## Beyond the brief

- **Multi-session dashboard.** Staff see every active session and drill into
  one, rather than a single hard-coded room.
- **Field-level change highlighting** so staff can see *what* just changed, not
  only that something did.
- **Progress tracking** against required fields, on both the form and each card.
- **`hello` handshake** so a staff view opened mid-form is populated
  immediately.
- **Draft recovery** — a refresh on the patient's device restores their answers.
- **Connection state surfaced** in both interfaces instead of silently failing.
- **Accessibility**: labelled inputs, `aria-describedby` errors, `aria-live`
  status regions, visible focus rings, and a `prefers-reduced-motion` fallback.
- **Dark mode** driven by system preference.
- **Explicit setup notice** when environment variables are missing.

## Tech stack

Next.js 16 (App Router) · React 19 · TypeScript · Tailwind CSS v4 ·
react-hook-form + Zod · Supabase Realtime · Vercel
