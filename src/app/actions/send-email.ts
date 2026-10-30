"use server";

import { z } from "zod";
import { Resend } from "resend";
import nodemailer from "nodemailer";
import { headers } from "next/headers";
import { checkRateLimit } from "../../lib/security/rate-limit";
import {
  escapeHtml,
  sanitizeHeader,
  formatHtmlParagraph,
  isDisposableEmail,
} from "../../lib/security/sanitize";

// ---------------------------------------------------------------------------
// Validation schema
// ---------------------------------------------------------------------------
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

// ---------------------------------------------------------------------------
// Diagnostic logger (safe — zero credential leakage)
// ---------------------------------------------------------------------------
function logDiagnostic(): void {
  const hasResend = Boolean(process.env.RESEND_API_KEY?.trim());
  const hasGmailUser = Boolean(process.env.GMAIL_USER?.trim());
  const rawPass = process.env.GMAIL_APP_PASSWORD?.trim();
  const hasGmailPass = Boolean(
    rawPass &&
      !rawPass.includes("REPLACE_WITH") &&
      !rawPass.includes("xxxx") &&
      rawPass.length >= 8,
  );

  console.info("[Contact Diagnostic]", {
    resendConfigured: hasResend,
    gmailConfigured: hasGmailUser && hasGmailPass,
    environment: process.env.VERCEL_ENV || process.env.NODE_ENV || "development",
  });
}

// ---------------------------------------------------------------------------
// HTML Email Templates
// ---------------------------------------------------------------------------
function buildOwnerHtml(
  safeHtmlName: string,
  safeHtmlEmail: string,
  safeHtmlMessage: string,
  mailtoReplyUrl: string,
): string {
  return `<!DOCTYPE html>
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
              <p style="margin:0 0 10px;color:#6b7280;font-size:12px;font-weight:700;text-transform:uppercase;letter-spacing:0.05em;">Message</p>
              <div style="background:#f9fafb;border:1px solid #e5e7eb;border-radius:8px;padding:16px;margin-bottom:24px;">
                <p style="margin:0;color:#111827;font-size:14px;line-height:1.7;white-space:pre-wrap;">${safeHtmlMessage}</p>
              </div>
              <div style="text-align:center;margin:28px 0 16px;">
                <a href="${mailtoReplyUrl}" style="display:inline-block;background:#2563eb;color:#ffffff;font-size:14px;font-weight:600;text-decoration:none;padding:13px 28px;border-radius:8px;">
                  Reply to ${safeHtmlName}
                </a>
              </div>
            </td>
          </tr>
        </table>
      </td>
    </tr>
  </table>
</body>
</html>`;
}

function buildVisitorHtml(safeHtmlName: string, safeHtmlMessage: string): string {
  return `<!DOCTYPE html>
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
                <span style="color:#6b7280;font-size:13px;">AI/ML Engineer</span>
              </p>
            </td>
          </tr>
        </table>
      </td>
    </tr>
  </table>
</body>
</html>`;
}

// ---------------------------------------------------------------------------
// Main server action
// ---------------------------------------------------------------------------
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
          error: "Too many requests. Please wait a few minutes before trying again.",
          statusCode: 429,
        };
      }
    } catch (rlErr) {
      console.warn("[Contact] Rate limit check skipped:", rlErr);
    }

    // 3. Input validation
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

    logDiagnostic();

    // 4. Sanitize inputs
    const safeName = sanitizeHeader(from_name);
    const safeEmail = sanitizeHeader(from_email);
    const safeHtmlName = escapeHtml(from_name);
    const safeHtmlEmail = escapeHtml(from_email);
    const safeHtmlMessage = formatHtmlParagraph(message);

    const mailtoReplyUrl = `mailto:${safeEmail}?subject=${encodeURIComponent(
      `Re: Portfolio Inquiry from ${safeName}`,
    )}`;

    const ownerHtml = buildOwnerHtml(
      safeHtmlName,
      safeHtmlEmail,
      safeHtmlMessage,
      mailtoReplyUrl,
    );
    const visitorHtml = buildVisitorHtml(safeHtmlName, safeHtmlMessage);

    const ownerEmail =
      process.env.CONTACT_OWNER_EMAIL?.trim() ||
      process.env.GMAIL_USER?.trim() ||
      "chiranthanns24056@gmail.com";

    const resendApiKey = process.env.RESEND_API_KEY?.trim();
    const rawGmailPass = process.env.GMAIL_APP_PASSWORD?.trim();
    const gmailPass = rawGmailPass?.replace(/["'\s]/g, "");
    const gmailUser = (process.env.GMAIL_USER?.trim() || ownerEmail).replace(/["'\s]/g, "");

    const isGmailConfigured = Boolean(
      gmailPass &&
        !gmailPass.includes("REPLACE_WITH") &&
        !gmailPass.includes("xxxx") &&
        gmailPass.length >= 8,
    );

    // =========================================================================
    // OPTION 1: Resend (Modern Serverless API)
    // =========================================================================
    if (resendApiKey) {
      console.info("[Contact] Dispatching via Resend API");
      const resend = new Resend(resendApiKey);

      const { error: ownerError } = await resend.emails.send({
        from: "Portfolio Contact <onboarding@resend.dev>",
        to: [ownerEmail],
        replyTo: `${safeName} <${safeEmail}>`,
        subject: `New Portfolio Message from ${safeName}`,
        html: ownerHtml,
        text: [
          "New Portfolio Inquiry",
          "",
          `Name:  ${safeName}`,
          `Email: ${safeEmail}`,
          "",
          "Message:",
          message,
          "",
          `Reply: ${mailtoReplyUrl}`,
        ].join("\n"),
        headers: {
          "X-Priority": "1",
          Importance: "High",
        },
      });

      if (ownerError) {
        console.error("[Contact] Resend owner notification error:", ownerError);
        return {
          ok: false,
          error:
            "Unable to send message via email service. Please email me directly at " + ownerEmail,
          statusCode: 500,
        };
      }

      console.log(`[Contact] Delivered to ${ownerEmail} via Resend.`);

      // Send visitor auto-confirmation (non-fatal if on Resend sandbox domain)
      try {
        const { error: visitorError } = await resend.emails.send({
          from: "Chiranthan N S <onboarding@resend.dev>",
          to: [safeEmail],
          replyTo: ownerEmail,
          subject: `Thank you for reaching out, ${safeName}!`,
          html: visitorHtml,
          text: [
            `Hi ${safeName},`,
            "",
            "Thank you for reaching out! I have received your message and will get back to you shortly.",
            "",
            "Best regards,",
            "Chiranthan N S",
            "AI/ML Engineer",
          ].join("\n"),
        });

        if (visitorError) {
          console.warn("[Contact] Resend visitor confirmation non-fatal warning:", visitorError);
        }
      } catch (visErr) {
        console.warn("[Contact] Visitor confirmation failed (non-fatal):", visErr);
      }

      return { ok: true, statusCode: 200 };
    }

    // =========================================================================
    // OPTION 2: Gmail SMTP via Nodemailer
    // =========================================================================
    if (isGmailConfigured && gmailPass) {
      console.info("[Contact] Dispatching via Gmail SMTP (Nodemailer)");
      const transporter = nodemailer.createTransport({
        service: "gmail",
        auth: {
          user: gmailUser,
          pass: gmailPass,
        },
        connectionTimeout: 10000,
        greetingTimeout: 10000,
        socketTimeout: 15000,
      });

      try {
        // Step 1: Owner notification
        await transporter.sendMail({
          from: `"${safeName} via Portfolio" <${gmailUser}>`,
          to: ownerEmail,
          replyTo: `"${safeName}" <${safeEmail}>`,
          subject: `New Portfolio Message from ${safeName}`,
          text: [
            "New Portfolio Inquiry",
            "",
            `Name:  ${safeName}`,
            `Email: ${safeEmail}`,
            "",
            "Message:",
            message,
            "",
            `Reply to ${safeName}: ${safeEmail}`,
          ].join("\n"),
          html: ownerHtml,
          headers: {
            "X-Priority": "1",
            Importance: "High",
          },
        });

        console.log(`[Contact] Delivered to ${ownerEmail} via Gmail SMTP.`);

        // Step 2: Visitor confirmation
        try {
          await transporter.sendMail({
            from: `"Chiranthan N S" <${gmailUser}>`,
            to: safeEmail,
            replyTo: ownerEmail,
            subject: `Thank you for reaching out, ${safeName}!`,
            html: visitorHtml,
            text: [
              `Hi ${safeName},`,
              "",
              "Thank you for reaching out! I have received your message and will get back to you shortly.",
              "",
              "Best regards,",
              "Chiranthan N S",
              "AI/ML Engineer",
            ].join("\n"),
            headers: {
              "Auto-Submitted": "auto-replied",
              "X-Auto-Response-Suppress": "All",
              Precedence: "auto_reply",
            },
          });
        } catch (visErr) {
          console.warn("[Contact] Gmail visitor confirmation failed (non-fatal):", visErr);
        }

        return { ok: true, statusCode: 200 };
      } catch (smtpErr: unknown) {
        const errString = smtpErr instanceof Error ? smtpErr.message : String(smtpErr);
        console.error("[Contact] Gmail SMTP send failed:", errString);

        if (errString.includes("535") || errString.includes("BadCredentials") || errString.includes("Username and Password not accepted")) {
          console.error(
            "[Contact Auth Error] Gmail App Password rejected (535-5.7.8). " +
              "Google has likely revoked the App Password. " +
              "Generate a new App Password at myaccount.google.com/apppasswords or use RESEND_API_KEY.",
          );
        }

        return {
          ok: false,
          error:
            "Email service authentication failed. Please contact me directly at " + ownerEmail,
          statusCode: 500,
        };
      }
    }

    // =========================================================================
    // OPTION 3: Neither Provider Configured
    // =========================================================================
    console.error(
      "[Contact Configuration Missing] Neither RESEND_API_KEY nor valid GMAIL_APP_PASSWORD is set. " +
        "Please configure RESEND_API_KEY (recommended) or GMAIL_APP_PASSWORD in your environment variables.",
    );

    return {
      ok: false,
      error:
        "Contact form is currently being updated. Please email me directly at " + ownerEmail,
      statusCode: 503,
    };
  } catch (err: unknown) {
    const errMsg = err instanceof Error ? err.message : String(err);
    console.error("[Contact] Unexpected error during email delivery:", errMsg);
    return {
      ok: false,
      error:
        "Unable to send your message. Please reach out directly via email at chiranthanns24056@gmail.com",
      statusCode: 500,
    };
  }
}