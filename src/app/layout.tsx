import type { Metadata } from "next";
import Link from "next/link";
import { DM_Sans, Geist_Mono, Outfit } from "next/font/google";
import { ActivityIcon } from "lucide-react";

import "./globals.css";
import { ModeToggle } from "@/components/ModeToggle";
import { ThemeProvider } from "@/components/ThemeProvider";
import { Button } from "@/components/ui/button";
import { cn } from "@/lib/utils";

const dmSans = DM_Sans({ variable: "--font-sans", subsets: ["latin"] });
const outfit = Outfit({ variable: "--font-heading", subsets: ["latin"] });
const geistMono = Geist_Mono({
  variable: "--font-geist-mono",
  subsets: ["latin"],
});

export const metadata: Metadata = {
  title: {
    default: "Agnos Intake",
    template: "%s · Agnos Intake",
  },
  description:
    "Real-time patient intake form with a live staff monitoring view.",
};

export default function RootLayout({ children }: LayoutProps<"/">) {
  return (
    <html
      lang="en"
      // next-themes writes the theme class here before paint.
      suppressHydrationWarning
      className={cn(
        "h-full antialiased",
        dmSans.variable,
        outfit.variable,
        geistMono.variable,
      )}
    >
      <body className="flex min-h-full flex-col">
        <ThemeProvider
          attribute="class"
          defaultTheme="system"
          enableSystem
          disableTransitionOnChange
        >
          <header className="border-b bg-card">
            <div className="mx-auto flex max-w-6xl items-center justify-between gap-4 px-4 py-3 sm:px-6">
              <Link
                href="/"
                className="flex items-center gap-2 font-heading font-medium outline-none focus-visible:ring-[3px] focus-visible:ring-ring/50"
              >
                <span className="flex size-7 items-center justify-center rounded-lg bg-primary text-primary-foreground">
                  <ActivityIcon className="size-4" />
                </span>
                Agnos Intake
              </Link>

              <nav className="flex items-center gap-1">
                <Button variant="ghost" size="sm" asChild>
                  <Link href="/form">Patient form</Link>
                </Button>
                <Button variant="ghost" size="sm" asChild>
                  <Link href="/staff">Staff view</Link>
                </Button>
                <ModeToggle />
              </nav>
            </div>
          </header>

          <main className="mx-auto w-full max-w-6xl flex-1 px-4 py-6 sm:px-6 sm:py-10">
            {children}
          </main>
        </ThemeProvider>
      </body>
    </html>
  );
}
