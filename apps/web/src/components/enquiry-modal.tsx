"use client";

import { useActionState, useState } from "react";
import { Modal, Button, Input, Label, Select, Textarea } from "@kanada/ui";
import { submitEnquiryAction } from "@/actions/enquiry-actions";
import type { ActionState } from "@/actions/auth-actions";

function EnquiryForm({
  courseOptions,
  onDone,
}: {
  courseOptions: string[];
  onDone: () => void;
}) {
  const [state, formAction, pending] = useActionState<ActionState, FormData>(
    submitEnquiryAction,
    {},
  );

  if (state.success) {
    return (
      <div className="py-4 text-center">
        <div className="mx-auto mb-4 grid h-14 w-14 place-items-center rounded-full bg-primary/10 text-2xl text-primary">
          ✓
        </div>
        <p className="text-lg font-semibold">Thank you!</p>
        <p className="mt-1 text-sm text-muted-foreground">
          We&apos;ve received your enquiry. Our team will reach out to you shortly.
        </p>
        <Button className="mt-5" onClick={onDone}>
          Done
        </Button>
      </div>
    );
  }

  return (
    <form action={formAction} className="space-y-3.5">
      <p className="text-sm text-muted-foreground">
        Fill this form and our team will get back to you with course details.
      </p>
      <div className="space-y-1.5">
        <Label htmlFor="enq-name">
          Name <span className="text-destructive">*</span>
        </Label>
        <Input id="enq-name" name="name" required autoComplete="name" />
      </div>
      <div className="grid gap-3.5 sm:grid-cols-2">
        <div className="space-y-1.5">
          <Label htmlFor="enq-phone">
            Mobile No <span className="text-destructive">*</span>
          </Label>
          <Input
            id="enq-phone"
            name="phone"
            type="tel"
            required
            placeholder="10-digit number"
            autoComplete="tel"
          />
        </div>
        <div className="space-y-1.5">
          <Label htmlFor="enq-email">
            Email <span className="text-destructive">*</span>
          </Label>
          <Input id="enq-email" name="email" type="email" required autoComplete="email" />
        </div>
      </div>
      <div className="space-y-1.5">
        <Label htmlFor="enq-course">Course</Label>
        <Select id="enq-course" name="course" defaultValue="">
          <option value="">Select a course (optional)</option>
          {courseOptions.map((c) => (
            <option key={c} value={c}>
              {c}
            </option>
          ))}
          <option value="General enquiry">General enquiry</option>
        </Select>
      </div>
      <div className="space-y-1.5">
        <Label htmlFor="enq-source">How did you hear about us?</Label>
        <Select id="enq-source" name="source" defaultValue="">
          <option value="">Select an option (optional)</option>
          <option value="Google Search">Google Search</option>
          <option value="Social Media">Social Media (Instagram / Facebook / LinkedIn)</option>
          <option value="YouTube">YouTube</option>
          <option value="Friend / Referral">Friend / Referral</option>
          <option value="Advertisement">Advertisement</option>
          <option value="College / Campus">College / Campus</option>
          <option value="Other">Other</option>
        </Select>
      </div>
      <div className="space-y-1.5">
        <Label htmlFor="enq-message">Comments</Label>
        <Textarea
          id="enq-message"
          name="message"
          placeholder="Enter your message (optional)"
          className="min-h-20"
        />
      </div>
      {state.error && <p className="text-sm text-destructive">{state.error}</p>}
      <Button type="submit" className="w-full" disabled={pending}>
        {pending ? "Submitting…" : "Submit enquiry"}
      </Button>
    </form>
  );
}

/** Capsule "Enquire Now" button in the header that opens the enquiry popup. */
export function EnquiryButton({ courseOptions }: { courseOptions: string[] }) {
  const [open, setOpen] = useState(false);
  const [instance, setInstance] = useState(0);

  return (
    <>
      <button
        type="button"
        onClick={() => {
          setInstance((i) => i + 1);
          setOpen(true);
        }}
        className="inline-flex items-center gap-1.5 rounded-full border border-primary/40 bg-primary/10 px-4 py-1.5 text-sm font-semibold text-primary transition-colors hover:bg-primary hover:text-primary-foreground"
      >
        <span aria-hidden="true">✦</span> Enquire Now
      </button>

      <Modal open={open} onClose={() => setOpen(false)} title="VLSI Course Enquiry">
        <EnquiryForm
          key={instance}
          courseOptions={courseOptions}
          onDone={() => setOpen(false)}
        />
      </Modal>
    </>
  );
}
