/**
 * Shown instead of the realtime UI when the Supabase environment variables are
 * missing. Without this the app looks merely broken — channels never subscribe
 * and every view sits on "Connecting…" forever.
 */
export function SetupNotice() {
  return (
    <div className="mx-auto max-w-xl rounded-xl border border-border bg-surface p-6">
      <h1 className="text-lg font-semibold text-ink">Realtime is not configured</h1>
      <p className="mt-2 text-sm text-ink-muted">
        Add a Supabase project URL and anon key to <code>.env.local</code>, then
        restart the dev server. No database tables or migrations are needed —
        the app uses Realtime channels only.
      </p>
      <pre className="mt-4 overflow-x-auto rounded-lg bg-surface-muted p-4 font-mono text-xs text-ink">
        {`NEXT_PUBLIC_SUPABASE_URL=https://<project>.supabase.co
NEXT_PUBLIC_SUPABASE_ANON_KEY=<anon key>`}
      </pre>
      <p className="mt-4 text-sm text-ink-muted">
        Both values are on the Supabase dashboard under{" "}
        <span className="font-medium text-ink">Project Settings → API Keys</span>.
      </p>
    </div>
  );
}
