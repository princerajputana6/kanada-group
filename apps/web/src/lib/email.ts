import { getEnv } from "./cloudflare";

/**
 * Thin Resend wrapper over the REST API (no SDK — one `fetch` keeps the
 * Workers bundle small). Email is best-effort: a missing key or a Resend
 * error is logged and swallowed so it never breaks the user-facing action
 * that triggered it (registration, payment approval, …).
 */

const RESEND_ENDPOINT = "https://api.resend.com/emails";
const DEFAULT_FROM = "Kanada Group <info@kanadagroup.com>";

export interface SendEmailInput {
  to: string;
  subject: string;
  html: string;
}

export async function sendEmail({ to, subject, html }: SendEmailInput): Promise<boolean> {
  const env = await getEnv();
  const apiKey = env.RESEND_API_KEY;
  if (!apiKey) {
    console.warn("[email] RESEND_API_KEY not set — skipping email to", to);
    return false;
  }

  try {
    const res = await fetch(RESEND_ENDPOINT, {
      method: "POST",
      headers: {
        Authorization: `Bearer ${apiKey}`,
        "Content-Type": "application/json",
      },
      body: JSON.stringify({
        from: env.RESEND_FROM || DEFAULT_FROM,
        to: [to],
        subject,
        html,
      }),
    });
    if (!res.ok) {
      console.error("[email] Resend error", res.status, await res.text());
      return false;
    }
    return true;
  } catch (err) {
    console.error("[email] send failed", err);
    return false;
  }
}

/**
 * Sends many emails via Resend's batch endpoint (≤100 per call). A Worker
 * on the free plan may make only 50 outbound requests per invocation, so
 * one fetch per recipient would silently stop partway through a class roster.
 */
export async function sendEmailBatch(messages: SendEmailInput[]): Promise<number> {
  if (messages.length === 0) return 0;
  const env = await getEnv();
  const apiKey = env.RESEND_API_KEY;
  if (!apiKey) {
    console.warn("[email] RESEND_API_KEY not set — skipping", messages.length, "emails");
    return 0;
  }
  const from = env.RESEND_FROM || DEFAULT_FROM;
  let sent = 0;
  for (let i = 0; i < messages.length; i += 100) {
    const chunk = messages.slice(i, i + 100);
    try {
      const res = await fetch(`${RESEND_ENDPOINT}/batch`, {
        method: "POST",
        headers: { Authorization: `Bearer ${apiKey}`, "Content-Type": "application/json" },
        body: JSON.stringify(chunk.map((m) => ({ from, to: [m.to], subject: m.subject, html: m.html }))),
      });
      if (res.ok) sent += chunk.length;
      else console.error("[email] Resend batch error", res.status, await res.text());
    } catch (err) {
      console.error("[email] batch send failed", err);
    }
  }
  return sent;
}

const BRAND = "#218390";

/** Shared responsive shell so every Kanada email looks consistent. */
function layout(title: string, body: string): string {
  return `<!doctype html><html><body style="margin:0;background:#f4f6f8;font-family:-apple-system,Segoe UI,Roboto,Helvetica,Arial,sans-serif;color:#0b0b12">
  <div style="max-width:560px;margin:0 auto;padding:32px 16px">
    <div style="background:#fff;border-radius:16px;overflow:hidden;border:1px solid #e6e9ee">
      <div style="background:${BRAND};padding:24px 28px">
        <span style="color:#fff;font-size:20px;font-weight:700;letter-spacing:-0.02em">Kanada Group</span>
        <div style="color:#d8f1f4;font-size:12px;letter-spacing:0.12em;text-transform:uppercase;margin-top:4px">VLSI Training</div>
      </div>
      <div style="padding:28px">
        <h1 style="margin:0 0 16px;font-size:22px;color:#0b0b12">${title}</h1>
        ${body}
      </div>
    </div>
    <p style="text-align:center;color:#8a93a0;font-size:12px;margin-top:20px">
      Inspired by ancient wisdom. Driven by modern innovation.
    </p>
  </div></body></html>`;
}

function button(href: string, label: string): string {
  return `<a href="${href}" style="display:inline-block;background:${BRAND};color:#fff;text-decoration:none;padding:12px 22px;border-radius:10px;font-weight:600;font-size:15px">${label}</a>`;
}

export async function sendWelcomeEmail(opts: {
  to: string;
  name: string;
  appUrl: string;
}): Promise<void> {
  const html = layout(
    `Welcome to Kanada Group, ${escapeHtml(opts.name)}!`,
    `<p style="font-size:15px;line-height:1.6;color:#3b4350">
       Your registration for the Kanada Group VLSI Training Program is complete.
       You now have access to our <strong>free 8-week VLSI Foundations</strong> program —
       start learning the fundamentals right away.
     </p>
     <p style="font-size:15px;line-height:1.6;color:#3b4350">
       Once you complete the Foundations program, you can unlock the
       <strong>Digital VLSI Design</strong> and <strong>Analog VLSI Design</strong> tracks.
     </p>
     <p style="margin:24px 0">${button(`${opts.appUrl}/courses`, "Browse courses")}</p>`,
  );
  await sendEmail({ to: opts.to, subject: "Welcome to Kanada Group VLSI Training", html });
}

export async function sendPaymentApprovedEmail(opts: {
  to: string;
  name: string;
  courseTitle: string;
  courseUrl: string;
}): Promise<void> {
  const html = layout(
    "Payment confirmed ✅",
    `<p style="font-size:15px;line-height:1.6;color:#3b4350">
       Hi ${escapeHtml(opts.name)}, your payment for
       <strong>${escapeHtml(opts.courseTitle)}</strong> has been verified by our team.
     </p>
     <p style="font-size:15px;line-height:1.6;color:#3b4350">
       Your enrollment is now active — you can start the course immediately.
     </p>
     <p style="margin:24px 0">${button(opts.courseUrl, "Go to the course")}</p>`,
  );
  await sendEmail({ to: opts.to, subject: `Payment confirmed — ${opts.courseTitle}`, html });
}

export async function sendPaymentSubmittedEmail(opts: {
  to: string;
  name: string;
  courseTitle: string;
}): Promise<void> {
  const html = layout(
    "We received your payment",
    `<p style="font-size:15px;line-height:1.6;color:#3b4350">
       Thanks ${escapeHtml(opts.name)} — we've received your payment screenshot for
       <strong>${escapeHtml(opts.courseTitle)}</strong>.
     </p>
     <p style="font-size:15px;line-height:1.6;color:#3b4350">
       Our team will verify it shortly. You'll get another email the moment your
       enrollment is activated.
     </p>`,
  );
  await sendEmail({ to: opts.to, subject: `Payment received — ${opts.courseTitle}`, html });
}

export async function sendPasswordResetEmail(opts: {
  to: string;
  name: string;
  resetUrl: string;
  expiresMinutes: number;
}): Promise<boolean> {
  const html = layout(
    "Reset your password",
    `<p style="font-size:15px;line-height:1.6;color:#3b4350">
       Hi ${escapeHtml(opts.name)}, we received a request to reset the password for your
       Kanada Group account.
     </p>
     <p style="margin:24px 0">${button(opts.resetUrl, "Choose a new password")}</p>
     <p style="font-size:13px;line-height:1.6;color:#6b7280">
       This link works once and expires in ${opts.expiresMinutes} minutes. If you didn't ask
       for this, you can ignore this email — your password won't change.
     </p>
     <p style="font-size:12px;line-height:1.6;color:#9aa1ab;word-break:break-all">
       Button not working? Paste this into your browser:<br>${escapeHtml(opts.resetUrl)}
     </p>`,
  );
  return sendEmail({ to: opts.to, subject: "Reset your Kanada Group password", html });
}

export async function sendPasswordChangedEmail(opts: {
  to: string;
  name: string;
  appUrl: string;
}): Promise<void> {
  const html = layout(
    "Your password was changed",
    `<p style="font-size:15px;line-height:1.6;color:#3b4350">
       Hi ${escapeHtml(opts.name)}, the password for your Kanada Group account was just
       changed, and you've been signed out on all devices.
     </p>
     <p style="font-size:15px;line-height:1.6;color:#3b4350">
       If this wasn't you, reset your password right away and contact us.
     </p>
     <p style="margin:24px 0">${button(`${opts.appUrl}/forgot-password`, "Reset password")}</p>`,
  );
  await sendEmail({ to: opts.to, subject: "Your Kanada Group password was changed", html });
}

export type LiveClassEmailKind = "scheduled" | "updated" | "cancelled";

export function buildLiveClassEmail(opts: {
  to: string;
  name: string;
  kind: LiveClassEmailKind;
  classTitle: string;
  courseTitle: string;
  teacherName: string;
  when: string;
  durationMinutes: number;
  classesUrl: string;
}): SendEmailInput {
  const heading = {
    scheduled: "New live class scheduled",
    updated: "Live class updated",
    cancelled: "Live class cancelled",
  }[opts.kind];
  const lead = {
    scheduled: "a new live class has been scheduled for your course.",
    updated: "the details of an upcoming live class have changed.",
    cancelled: "the following live class has been cancelled.",
  }[opts.kind];
  const strike = opts.kind === "cancelled" ? "text-decoration:line-through;" : "";
  const html = layout(
    heading,
    `<p style="font-size:15px;line-height:1.6;color:#3b4350">Hi ${escapeHtml(opts.name)}, ${lead}</p>
     <div style="border:1px solid #e6e9ee;border-radius:12px;padding:16px 18px;margin:18px 0;${strike}">
       <div style="font-size:17px;font-weight:700;color:#0b0b12">${escapeHtml(opts.classTitle)}</div>
       <div style="font-size:14px;color:#3b4350;margin-top:6px">${escapeHtml(opts.courseTitle)} · with ${escapeHtml(opts.teacherName)}</div>
       <div style="font-size:14px;color:#218390;font-weight:600;margin-top:10px">${escapeHtml(opts.when)} · ${opts.durationMinutes} min</div>
     </div>
     ${
       opts.kind === "cancelled"
         ? ""
         : `<p style="font-size:14px;line-height:1.6;color:#3b4350">The Join button opens 15 minutes before the class starts.</p>
            <p style="margin:24px 0">${button(opts.classesUrl, "View live classes")}</p>`
     }`,
  );
  return { to: opts.to, subject: `${heading}: ${opts.classTitle}`, html };
}

export function buildTicketEmail(opts: {
  to: string;
  heading: string;
  /** Trusted HTML — callers must escape any user-supplied text in it. */
  intro: string;
  ticketNumber: number;
  subject: string;
  excerpt?: string;
  ticketUrl: string;
  cta: string;
}): SendEmailInput {
  const quote = opts.excerpt
    ? `<blockquote style="margin:16px 0;padding:12px 16px;border-left:3px solid ${BRAND};background:#f6f9fa;color:#3b4350;font-size:14px;line-height:1.6;white-space:pre-wrap">${escapeHtml(opts.excerpt.slice(0, 600))}${opts.excerpt.length > 600 ? "…" : ""}</blockquote>`
    : "";
  const html = layout(
    opts.heading,
    `<p style="font-size:15px;line-height:1.6;color:#3b4350">${opts.intro}</p>
     <p style="font-size:14px;color:#0b0b12;font-weight:600;margin:16px 0 0">#${opts.ticketNumber} · ${escapeHtml(opts.subject)}</p>
     ${quote}
     <p style="margin:24px 0">${button(opts.ticketUrl, opts.cta)}</p>`,
  );
  return { to: opts.to, subject: `[#${opts.ticketNumber}] ${opts.heading}: ${opts.subject}`, html };
}

export function escapeHtml(s: string): string {
  return s
    .replace(/&/g, "&amp;")
    .replace(/</g, "&lt;")
    .replace(/>/g, "&gt;")
    .replace(/"/g, "&quot;");
}
