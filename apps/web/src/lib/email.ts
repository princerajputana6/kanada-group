import { getEnv } from "./cloudflare";

/**
 * Thin Resend wrapper over the REST API (no SDK — one `fetch` keeps the
 * Workers bundle small). Email is best-effort: a missing key or a Resend
 * error is logged and swallowed so it never breaks the user-facing action
 * that triggered it (registration, payment approval, …).
 */

const RESEND_ENDPOINT = "https://api.resend.com/emails";
const DEFAULT_FROM = "Kanada Group <info@kanadagroup.com>";

interface SendEmailInput {
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

function escapeHtml(s: string): string {
  return s
    .replace(/&/g, "&amp;")
    .replace(/</g, "&lt;")
    .replace(/>/g, "&gt;")
    .replace(/"/g, "&quot;");
}
