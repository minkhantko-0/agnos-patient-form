# Agnos Intake

A responsive patient intake form with a live staff view. A patient fills in the
form on their phone; staff watch each field arrive in real time, along with
whether the patient is still typing, has gone quiet, or has submitted.

- **Live demo:** https://agnos-patient-form-nine.vercel.app
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

The four planning sections the brief asks for — **Project Structure**, **Design**,
**Component Architecture** and **Real-Time Synchronisation Flow** — are a separate
document:

- **[Development-Planning-Documentation.docx](Development-Planning-Documentation.docx)**
- Source, and the same content rendered on GitHub:
  [docs/development-planning.md](docs/development-planning.md)


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
- **Dark mode** following the OS by default, with a light/dark/system toggle in
  the header.
- **A design system rather than ad-hoc styling** — shadcn/ui with a custom
  preset, so every control shares one vocabulary.
- **Date-of-birth calendar** with year and month menus, bounded to 1900–today.
- **Navigation guard**: once the form has content, leaving it asks first and
  offers to open the destination in a new tab — because a session lives only as
  long as its tab.
- **Current-view indicator** in the header.
- **Searchable selects** for nationality and preferred language.
- **Explicit setup notice** when environment variables are missing.

## Tech stack

Next.js 16 (App Router) · React 19 · TypeScript · Tailwind CSS v4 ·
shadcn/ui (Radix, plus Base UI for the combobox) · react-hook-form + Zod ·
Supabase Realtime · Vercel
