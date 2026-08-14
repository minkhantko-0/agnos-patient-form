"use client";

import { ThemeProvider as NextThemesProvider } from "next-themes";

/**
 * The shadcn preset expresses dark mode as a `.dark` class rather than a media
 * query, so something has to put that class on <html>. Defaulting to "system"
 * keeps the behaviour the app had before: follow the OS unless told otherwise.
 */
export function ThemeProvider({
  children,
  ...props
}: React.ComponentProps<typeof NextThemesProvider>) {
  return <NextThemesProvider {...props}>{children}</NextThemesProvider>;
}
