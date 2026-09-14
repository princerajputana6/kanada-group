export default function ContactPage() {
  return (
    <div className="mx-auto max-w-3xl px-4 py-16">
      <h1 className="text-3xl font-bold">Contact us</h1>
      <p className="mt-4 text-muted-foreground">
        Have a question about the program, admissions, or a technical issue with the platform?
        Reach out and our team will get back to you.
      </p>
      <div className="mt-8 space-y-4 rounded-lg border border-border p-6">
        <div>
          <p className="text-sm font-semibold">Email</p>
          <a href="mailto:connect@biztreck.world" className="text-primary hover:underline">
            connect@biztreck.world
          </a>
        </div>
        <div>
          <p className="text-sm font-semibold">Program</p>
          <p className="text-sm text-muted-foreground">
            Digital &amp; Analog VLSI Training — 20-week cohort program
          </p>
        </div>
      </div>
    </div>
  );
}
