import type { Metadata } from "next";
import Link from "next/link";
import { Geist, Geist_Mono } from "next/font/google";

import "./globals.css";

const geistSans = Geist({ variable: "--font-geist-sans", subsets: ["latin"] });
const geistMono = Geist_Mono({ variable: "--font-geist-mono", subsets: ["latin"] });

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
      className={`${geistSans.variable} ${geistMono.variable} h-full antialiased`}
    >
      <body className="flex min-h-full flex-col font-sans">
        <header className="border-b border-border bg-surface">
          <div className="mx-auto flex max-w-6xl items-center justify-between gap-4 px-4 py-3 sm:px-6">
            <Link
              href="/"
              className="flex items-center gap-2 font-semibold text-ink focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-brand"
            >
              <span className="flex h-7 w-7 items-center justify-center rounded-md bg-brand text-sm text-brand-ink">
                A
              </span>
              Agnos Intake
            </Link>

            <nav className="flex items-center gap-1 text-sm">
              <Link
                href="/form"
                className="rounded-lg px-3 py-1.5 font-medium text-ink-muted transition hover:bg-surface-muted hover:text-ink focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-brand"
              >
                Patient form
              </Link>
              <Link
                href="/staff"
                className="rounded-lg px-3 py-1.5 font-medium text-ink-muted transition hover:bg-surface-muted hover:text-ink focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-brand"
              >
                Staff view
              </Link>
            </nav>
          </div>
        </header>

        <main className="mx-auto w-full max-w-6xl flex-1 px-4 py-6 sm:px-6 sm:py-10">
          {children}
        </main>
      </body>
    </html>
  );
}
