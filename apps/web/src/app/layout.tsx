import type { Metadata } from "next";
import type { ReactNode } from "react";
import { Toaster } from "@kanada/ui";
import { Navbar } from "@/components/navbar";
import { PageTransition } from "@/components/page-transition";
import "./globals.css";

export const metadata: Metadata = {
  title: "Kanada Group | VLSI Learning Platform",
  description:
    "Learn Digital & Analog VLSI design from industry experts — semiconductor fundamentals to tapeout.",
};

export default function RootLayout({ children }: { children: ReactNode }) {
  return (
    <html lang="en">
      <body className="min-h-screen bg-background text-foreground antialiased">
        <Navbar />
        <main>
          <PageTransition>{children}</PageTransition>
        </main>
        <Toaster richColors position="top-center" />
      </body>
    </html>
  );
}
