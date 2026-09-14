import type { Metadata } from "next";
import type { ReactNode } from "react";
import { Toaster } from "@kanada/ui";
import { Navbar } from "@/components/navbar";
import { Footer } from "@/components/footer";
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
      <body className="flex min-h-screen flex-col bg-background text-foreground antialiased">
        <Navbar />
        <main className="flex-1">
          <PageTransition>{children}</PageTransition>
        </main>
        <Footer />
        <Toaster richColors position="top-center" />
      </body>
    </html>
  );
}
