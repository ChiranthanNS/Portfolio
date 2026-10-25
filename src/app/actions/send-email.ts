"use server";

import { z } from "zod";
import nodemailer from "nodemailer";
import { headers } from "next/headers";
import { checkRateLimit } from "../../lib/security/rate-limit";
import {
  escapeHtml,
  sanitizeHeader,
  formatHtmlParagraph,
  isDisposableEmail,
} from "../../lib/security/sanitize";

const contactSchema = z.object({
  from_name: z
    .string({ required_error: "Name is required" })
    .trim()
    .min(1, "Name is required")
    .max(100, "Name is too long")
    .refine(
      (val) => !/[\r\n\t\x00-\x1f\x7f]/.test(val),
      "Name contains invalid characters",
    ),
  from_email: z
    .string({ required_error: "Email is required" })
    .trim()
    .toLowerCase()
    .email("Please provide a valid email address")
    .max(200, "Email is too long")
    .refine(
      (val) => !/[\r\n\t\x00-\x1f\x7f]/.test(val),
      "Email contains invalid characters",
    )
    .refine(
      (val) => !isDisposableEmail(val),
      "Please provide a permanent, valid email address.",
    ),
  message: z
    .string({ required_error: "Message is required" })
    .trim()
    .min(5, "Message must be at least 5 characters")
    .max(2000, "Message is too long"),
  _trap: z.string().optional(),
});

export type ContactSubmissionResult = {
  ok: boolean;
  error?: string;
  statusCode?: number;
};

export async function sendContactMessage(
  formData: FormData,
): Promise<ContactSubmissionResult> {
  try {
    // 1. Honeypot check
    const trap = (formData.get("_trap") as string | null)?.trim();
    if (trap && trap.length > 0) {
      return { ok: false, error: "Invalid submission.", statusCode: 400 };
    }

    // 2. Rate limiting check
    try {
      const headersList = await headers();
      const rateLimit = await checkRateLimit(headersList);
      if (!rateLimit.success) {
        return {
          ok: false,
          error: "Too many requests. Please wait a few minutes.",
          statusCode: 429,
        };
      }
    } catch (rlErr) {
      console.warn("[Contact] Rate limit check skipped:", rlErr);
    }

    // 3. Validation
    const rawName = formData.get("from_name") || formData.get("name");
    const rawEmail = formData.get("from_email") || formData.get("email");
    const rawMessage = formData.get("message");

    const parsed = contactSchema.safeParse({
      from_name: typeof rawName === "string" ? rawName : "",
      from_email: typeof rawEmail === "string" ? rawEmail : "",
      message: typeof rawMessage === "string" ? rawMessage : "",
      _trap: typeof trap === "string" ? trap : "",
    });

    if (!parsed.success) {
      return {
        ok: false,
        error:
          parsed.error.issues[0]?.message ?? "Please provide valid information.",
        statusCode: 400,
      };
    }

    const { from_name, from_email, message } = parsed.data;

    // Credentials with verified active fallback
    const gmailUser = (
      process.env.GMAIL_USER || "chiranthanns24056@gmail.com"
    ).trim();
    const gmailPass = (
      process.env.GMAIL_APP_PASSWORD ||
      process.env.GMAIL_PASS ||
      "dzoeltepabysxnln"
    ).replace(/["'\s]/g, "");

    const transporter = nodemailer.createTransport({
      service: "gmail",
      auth: {
        user: gmailUser,
        pass: gmailPass,
      },
      connectionTimeout: 10000,
      greetingTimeout: 10000,
      socketTimeout: 15000,
      tls: {
        rejectUnauthorized: false,
      },
    });

    // Sanitized inputs for safe email headers & HTML rendering
    const safeName = sanitizeHeader(from_name);
    const safeEmail = sanitizeHeader(from_email);
    const safeHtmlName = escapeHtml(from_name);
    const safeHtmlEmail = escapeHtml(from_email);
    const safeHtmlMessage = formatHtmlParagraph(message);

    const mailtoReplyUrl = `mailto:${safeEmail}?subject=${encodeURIComponent(
      `Re: Portfolio Inquiry from ${safeName}`,
    )}`;

    // Email 1: Notification to Owner (with prominent one-click direct Reply action)
    const ownerSubject = `New Portfolio Message from ${safeName}`;
    const ownerText = [
      "New Portfolio Inquiry",
      "",
      `Name:  ${safeName}`,
      `Email: ${safeEmail}`,
      "",
      "Message:",
      message,
      "",
      "---",
      `Reply directly to ${safeName}:`,
      mailtoReplyUrl,
      `Direct Email: ${safeEmail}`,
      "",
      "Note: Since Gmail treats emails sent through your own account as self-sent, clicking Gmail's default Reply button will reply to yourself. Please click the link above or email " +
        safeEmail +
        " directly.",
    ].join("\n");

    const ownerHtml = `
<!DOCTYPE html>
<html>
<head>
  <meta charset="utf-8">
  <meta name="viewport" content="width=device-width, initial-scale=1.0">
</head>
<body style="margin:0;padding:0;background:#f3f4f6;font-family:-apple-system,BlinkMacSystemFont,'Segoe UI',Roboto,Helvetica,Arial,sans-serif;">
  <table width="100%" cellpadding="0" cellspacing="0" style="background:#f3f4f6;padding:32px 16px;">
    <tr>
      <td align="center">
        <table width="100%" cellpadding="0" cellspacing="0" style="max-width:580px;background:#ffffff;border-radius:12px;border:1px solid #e5e7eb;overflow:hidden;box-shadow:0 1px 3px rgba(0,0,0,0.05);">
          <tr>
            <td style="padding:32px 32px 24px;">
              <h2 style="margin:0 0 20px;font-size:22px;font-weight:700;color:#111827;">New Portfolio Inquiry</h2>

              <table width="100%" cellpadding="0" cellspacing="0" style="margin-bottom:20px;">
                <tr>
                  <td style="padding:8px 0;color:#6b7280;font-size:13px;width:70px;vertical-align:top;font-weight:500;">From:</td>
                  <td style="padding:8px 0;color:#111827;font-size:15px;font-weight:600;">${safeHtmlName}</td>
                </tr>
                <tr>
                  <td style="padding:8px 0;color:#6b7280;font-size:13px;vertical-align:top;font-weight:500;">Email:</td>
                  <td style="padding:8px 0;"><a href="mailto:${safeHtmlEmail}" style="color:#2563eb;font-size:15px;font-weight:500;text-decoration:none;">${safeHtmlEmail}</a></td>
                </tr>
              </table>

              <hr style="border:none;border-top:1px solid #e5e7eb;margin:16px 0 20px;" />

              <p style="margin:0 0 10px;color:#6b7280;font-size:12px;font-weight:700;text-transform:uppercase;letter-spacing:0.05em;">Message Content</p>
              <div style="background:#f9fafb;border:1px solid #e5e7eb;border-radius:8px;padding:16px;margin-bottom:24px;">
                <p style="margin:0;color:#111827;font-size:14px;line-height:1.7;white-space:pre-wrap;">${safeHtmlMessage}</p>
              </div>

              <!-- Dedicated Reply Action Button: Bypasses Gmail self-reply quirk -->
              <div style="text-align:center;margin:28px 0 16px;">
                <a href="${mailtoReplyUrl}" style="display:inline-block;background:#2563eb;color:#ffffff;font-size:14px;font-weight:600;text-decoration:none;padding:13px 28px;border-radius:8px;box-shadow:0 2px 4px rgba(37,99,235,0.2);">
                  ✉️ Reply to ${safeHtmlName} (${safeHtmlEmail})
                </a>
              </div>

              <div style="background:#eff6ff;border:1px solid #bfdbfe;border-radius:8px;padding:12px 16px;margin-top:20px;">
                <p style="margin:0;color:#1e40af;font-size:12px;line-height:1.5;">
                  <strong>💡 Gmail Tip:</strong> Because this alert is sent via your personal Gmail SMTP, clicking Gmail's default top &ldquo;Reply&rdquo; button will attempt to reply to yourself. Click the <strong>blue button above</strong> or email <a href="mailto:${safeHtmlEmail}" style="color:#1d4ed8;font-weight:600;">${safeHtmlEmail}</a> directly to send your reply to ${safeHtmlName}.
                </p>
              </div>
            </td>
          </tr>
        </table>
      </td>
    </tr>
  </table>
</body>
</html>`;

    // Email 2: Automated confirmation back to the VISITOR ("return mail")
    const visitorSubject = `Thank you for reaching out, ${safeName}!`;
    const visitorText = [
      `Hi ${safeName},`,
      "",
      "Thank you for reaching out! I have received your message and will get back to you shortly.",
      "",
      "Your message:",
      `"${message}"`,
      "",
      "Best regards,",
      "Chiranthan N S",
      "AI/ML Engineer",
      gmailUser,
    ].join("\n");

    const visitorHtml = `
<!DOCTYPE html>
<html>
<head>
  <meta charset="utf-8">
  <meta name="viewport" content="width=device-width, initial-scale=1.0">
</head>
<body style="margin:0;padding:0;background:#f9fafb;font-family:-apple-system,BlinkMacSystemFont,'Segoe UI',Roboto,Helvetica,Arial,sans-serif;">
  <table width="100%" cellpadding="0" cellspacing="0" style="background:#f9fafb;padding:24px 16px;">
    <tr>
      <td align="center">
        <table width="100%" cellpadding="0" cellspacing="0" style="max-width:580px;background:#ffffff;border-radius:12px;border:1px solid #e5e7eb;overflow:hidden;padding:32px 32px 28px;">
          <tr>
            <td>
              <p style="margin:0 0 16px 0;font-size:16px;color:#111827;font-weight:600;">Hi ${safeHtmlName},</p>
              <p style="margin:0 0 16px 0;font-size:14px;color:#374151;line-height:1.6;">
                Thank you for reaching out! I have received your message and will get back to you shortly.
              </p>
              <p style="margin:0 0 6px 0;font-size:13px;font-weight:600;color:#6b7280;text-transform:uppercase;letter-spacing:0.04em;">Your message:</p>
              <div style="background:#f3f4f6;border-radius:8px;padding:14px 18px;margin:0 0 24px 0;border-left:3px solid #2563eb;">
                <p style="margin:0;font-size:14px;color:#374151;line-height:1.6;white-space:pre-wrap;">${safeHtmlMessage}</p>
              </div>
              <hr style="border:none;border-top:1px solid #e5e7eb;margin:20px 0;" />
              <p style="margin:0;font-size:14px;color:#111827;line-height:1.6;">
                Best regards,<br>
                <strong>Chiranthan N S</strong><br>
                <span style="color:#6b7280;font-size:13px;">AI/ML Engineer</span><br>
                <a href="mailto:${gmailUser}" style="color:#2563eb;text-decoration:none;font-size:13px;">${gmailUser}</a>
              </p>
            </td>
          </tr>
        </table>
      </td>
    </tr>
  </table>
</body>
</html>`;

    // Step 1: Send notification to Owner (guaranteed primary delivery)
    await transporter.sendMail({
      from: `"${safeName} via Portfolio" <${gmailUser}>`,
      to: gmailUser,
      replyTo: `"${safeName}" <${safeEmail}>`,
      subject: ownerSubject,
      text: ownerText,
      html: ownerHtml,
      headers: {
        "X-Priority": "1",
        "X-MSMail-Priority": "High",
        Importance: "High",
      },
    });
    console.log(`[Contact] Owner notification sent for: ${safeEmail}`);

    // Step 2: Send automated confirmation back to the visitor ("return mail")
    // Delivered sequentially with RFC 3834 auto-responder headers to prevent spam flags
    try {
      await transporter.sendMail({
        from: `"Chiranthan N S" <${gmailUser}>`,
        to: safeEmail,
        replyTo: gmailUser,
        subject: visitorSubject,
        text: visitorText,
        html: visitorHtml,
        headers: {
          "Auto-Submitted": "auto-replied",
          "X-Auto-Response-Suppress": "All",
          Precedence: "auto_reply",
        },
      });
      console.log(`[Contact] Return mail auto-confirmation sent to: ${safeEmail}`);
    } catch (visitorErr) {
      // If visitor's mailbox rejects, log diagnostic without failing the owner's notification
      console.warn("[Contact] Visitor auto-confirmation delivery failed:", visitorErr);
    }

    return { ok: true, statusCode: 200 };
  } catch (err: unknown) {
    console.error("[Contact] Email delivery failed:", err);
    const detail =
      err instanceof Error ? err.message : "Unknown error";
    return {
      ok: false,
      error: `Failed to send message (${detail}). Please email me directly at chiranthanns24056@gmail.com`,
      statusCode: 500,
    };
  }
}
