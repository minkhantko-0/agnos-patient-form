import { PlugZapIcon } from "lucide-react";

import { Alert, AlertDescription, AlertTitle } from "@/components/ui/alert";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";

/**
 * Shown instead of the realtime UI when the Supabase environment variables are
 * missing. Without this the app looks merely broken — channels never subscribe
 * and every view sits on "Connecting…" forever.
 */
export function SetupNotice() {
  return (
    <Card className="mx-auto max-w-xl">
      <CardHeader>
        <CardTitle className="text-lg">Realtime is not configured</CardTitle>
      </CardHeader>
      <CardContent className="space-y-4">
        <p className="text-muted-foreground">
          Add a Supabase project URL and anon key to <code>.env.local</code>,
          then restart the dev server. No database tables or migrations are
          needed — the app uses Realtime channels only.
        </p>

        <pre className="overflow-x-auto rounded-lg bg-muted p-4 font-mono text-xs">
          {`NEXT_PUBLIC_SUPABASE_URL=https://<project>.supabase.co
NEXT_PUBLIC_SUPABASE_ANON_KEY=<anon key>`}
        </pre>

        <Alert>
          <PlugZapIcon />
          <AlertTitle>Where to find them</AlertTitle>
          <AlertDescription>
            Both values are on the Supabase dashboard under Project Settings →
            API Keys.
          </AlertDescription>
        </Alert>
      </CardContent>
    </Card>
  );
}
