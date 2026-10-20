"use server";

import { z } from "zod";
import nodemailer from "nodemailer";
import { Resend } from "resend";
import { headers } from "next/headers";
import { checkRateLimit } from "../../lib/security/rate-limit";

const contactSchema = z.object({
  from_name: z
    .string({ required_error: "Name is required" })
    .trim()
    .min(1, "Name is required")
    .max(100, "Name is too long"),
  from_email: z
    .string({ required_error: "Email is required" })
    .trim()
    .toLowerCase()
    .email("Please provide a valid email address")
    .max(200, "Email is too long"),
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
    // 1. Honeypot check (catches simple spam bots)
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

    const toEmail = "chiranthanns24056@gmail.com";
    const gmailUser = process.env.GMAIL_USER || "chiranthanns24056@gmail.com";
    const gmailPass = (
      process.env.GMAIL_APP_PASSWORD || "dzoeltepabysxnln"
    ).replace(/\s+/g, "");

    // Prepare transporter for Gmail SMTP delivery
    const transporter = nodemailer.createTransport({
      service: "gmail",
      auth: {
        user: gmailUser,
        pass: gmailPass,
      },
      connectionTimeout: 15000,
      greetingTimeout: 15000,
      socketTimeout: 15000,
    });

    // Content for Owner (Card Style)
    const ownerSubject = `New Portfolio Message from ${from_name}`;
    const ownerText = [
      "New Portfolio Inquiry",
      "",
      `Name:  ${from_name}`,
      `Email: ${from_email}`,
      "",
      "Message:",
      message,
      "",
      `Hit Reply to respond directly to ${from_name}.`,
    ].join("\n");

    const ownerHtml = `
<!DOCTYPE html>
<html>
<body style="margin:0;padding:0;background:#f3f4f6;font-family:-apple-system,BlinkMacSystemFont,'Segoe UI',Roboto,Helvetica,Arial,sans-serif;">
  <table width="100%" cellpadding="0" cellspacing="0" style="background:#f3f4f6;padding:32px 0;">
    <tr>
      <td align="center">
        <table width="560" cellpadding="0" cellspacing="0" style="background:#ffffff;border-radius:12px;border:1px solid #e5e7eb;overflow:hidden;">
          <tr>
            <td style="padding:32px 32px 24px;">
              <h2 style="margin:0 0 24px;font-size:22px;font-weight:700;color:#111827;">New Portfolio Inquiry</h2>
              <table width="100%" cellpadding="0" cellspacing="0">
                <tr>
                  <td style="padding:8px 0;color:#6b7280;font-size:13px;width:60px;vertical-align:top;">Name</td>
                  <td style="padding:8px 0;color:#111827;font-size:14px;font-weight:600;">${from_name}</td>
                </tr>
                <tr>
                  <td style="padding:8px 0;color:#6b7280;font-size:13px;vertical-align:top;">Email</td>
                  <td style="padding:8px 0;"><a href="mailto:${from_email}" style="color:#6366f1;font-size:14px;text-decoration:none;">${from_email}</a></td>
                </tr>
              </table>
              <hr style="border:none;border-top:1px solid #e5e7eb;margin:20px 0;" />
              <p style="margin:0 0 10px;color:#6b7280;font-size:12px;font-weight:600;text-transform:uppercase;letter-spacing:0.05em;">Message</p>
              <p style="margin:0;color:#111827;font-size:14px;line-height:1.7;white-space:pre-wrap;">${message}</p>
              <hr style="border:none;border-top:1px solid #e5e7eb;margin:24px 0 16px;" />
              <p style="margin:0;color:#9ca3af;font-size:12px;">Hit <strong>Reply</strong> to respond directly to ${from_name}.</p>
            </td>
          </tr>
        </table>
      </td>
    </tr>
  </table>
</body>
</html>`;

    // 4. Send notification to YOU (Owner)
    // If RESEND_API_KEY is configured in Vercel, prioritize Resend HTTP API for ultra-fast owner delivery.
    let ownerNotified = false;
    const resendApiKey = process.env.RESEND_API_KEY;

    if (resendApiKey) {
      try {
        const resend = new Resend(resendApiKey);
        const resendRes = await resend.emails.send({
          from: "Portfolio Contact <onboarding@resend.dev>",
          to: toEmail,
          replyTo: from_email,
          subject: ownerSubject,
          html: ownerHtml,
        });

        if (!resendRes.error) {
          ownerNotified = true;
          console.log("[Contact] Owner notified successfully via Resend.");
        } else {
          console.warn("[Contact] Resend owner send error:", resendRes.error);
        }
      } catch (rErr) {
        console.warn("[Contact] Resend send exception, will use Gmail SMTP:", rErr);
      }
    }

    if (!ownerNotified) {
      await transporter.sendMail({
        from: `"${from_name} via Portfolio" <${gmailUser}>`,
        to: toEmail,
        replyTo: from_email,
        subject: ownerSubject,
        text: ownerText,
        html: ownerHtml,
      });
      ownerNotified = true;
      console.log("[Contact] Owner notified successfully via Gmail SMTP.");
    }

    // 5. Send automated confirmation to the VISITOR (exact design from screenshot)
    // Note: Sent via Gmail SMTP because Resend test domain cannot send to external recipients.
    // Properly awaited so Vercel Serverless Function does not terminate before delivery.
    const visitorSubject = `Thank you for reaching out, ${from_name}!`;
    const visitorText = [
      `Hi ${from_name},`,
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
<div style="font-family:-apple-system,BlinkMacSystemFont,'Segoe UI',Roboto,Helvetica,Arial,sans-serif;font-size:15px;line-height:1.6;color:#111827;max-width:600px;padding:8px 0;">
  <p style="margin:0 0 16px 0;font-size:15px;color:#111827;">Hi ${from_name},</p>
  <p style="margin:0 0 16px 0;font-size:15px;color:#111827;">Thank you for reaching out! I have received your message and will get back to you shortly.</p>
  <p style="margin:0 0 4px 0;font-size:15px;color:#111827;">Your message:</p>
  <p style="margin:0 0 20px 0;font-size:15px;color:#374151;">&ldquo;${message}&rdquo;</p>
  <p style="margin:0;font-size:15px;color:#111827;line-height:1.5;">
    Best regards,<br>
    Chiranthan N S<br>
    AI/ML Engineer<br>
    <a href="mailto:${gmailUser}" style="color:#2563eb;text-decoration:none;">${gmailUser}</a>
  </p>
</div>`;

    try {
      await transporter.sendMail({
        from: `"Chiranthan N S" <${gmailUser}>`,
        to: from_email,
        replyTo: gmailUser,
        subject: visitorSubject,
        text: visitorText,
        html: visitorHtml,
      });
      console.log(`[Contact] Confirmation email sent to visitor (${from_email}).`);
    } catch (visitorErr) {
      console.warn("[Contact] Visitor confirmation failed:", visitorErr);
    }

    return { ok: true, statusCode: 200 };
  } catch (err: unknown) {
    console.error("[Contact] Email delivery failed:", err);
    return {
      ok: false,
      error:
        "Failed to send message. Please email me directly at chiranthanns24056@gmail.com",
      statusCode: 500,
    };
  }
}
