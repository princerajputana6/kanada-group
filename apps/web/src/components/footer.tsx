import Link from "next/link";
import { Logo } from "@/components/logo";

export function Footer() {
  return (
    <footer className="relative overflow-hidden border-t border-border">
      <div className="pointer-events-none absolute inset-x-0 top-0 h-px bg-gradient-to-r from-transparent via-primary/50 to-transparent" />
      <div className="mx-auto grid max-w-6xl gap-10 px-4 py-14 sm:grid-cols-4">
        <div className="sm:col-span-2">
          <Link href="/" className="group inline-block">
            <Logo />
          </Link>
          <p className="mt-3 max-w-sm text-sm text-muted-foreground">
            Inspired by ancient wisdom. Driven by modern innovation. A comprehensive VLSI
            training ecosystem — semiconductor fundamentals to tapeout.
          </p>
        </div>

        <div>
          <p className="text-sm font-semibold">Platform</p>
          <ul className="mt-3 space-y-2 text-sm text-muted-foreground">
            <li>
              <Link href="/courses" className="transition-colors hover:text-foreground">
                Browse courses
              </Link>
            </li>
            <li>
              <Link href="/sign-up" className="transition-colors hover:text-foreground">
                Create account
              </Link>
            </li>
            <li>
              <Link href="/sign-in" className="transition-colors hover:text-foreground">
                Sign in
              </Link>
            </li>
          </ul>
        </div>

        <div>
          <p className="text-sm font-semibold">Company</p>
          <ul className="mt-3 space-y-2 text-sm text-muted-foreground">
            <li>
              <Link href="/about" className="transition-colors hover:text-foreground">
                About
              </Link>
            </li>
            <li>
              <Link href="/contact" className="transition-colors hover:text-foreground">
                Contact
              </Link>
            </li>
          </ul>
        </div>
      </div>

      <div className="border-t border-border py-6 text-center text-xs text-muted-foreground">
        © {new Date().getFullYear()} Kanada Group. All rights reserved.
      </div>
    </footer>
  );
}
