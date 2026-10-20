"use server";

import { z } from "zod";
import nodemailer from "nodemailer";
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
    // 1. Honeypot verification
    const trap = (formData.get("_trap") as string | null)?.trim();
    if (trap && trap.length > 0) {
      return { ok: false, error: "Invalid submission.", statusCode: 400 };
    }

    // 2. Rate limiting
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

    // 3. Validate
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
        error: parsed.error.issues[0]?.message ?? "Please provide valid information.",
        statusCode: 400,
      };
    }

    const { from_name, from_email, message } = parsed.data;

    const gmailUser = process.env.GMAIL_USER || "chiranthanns24056@gmail.com";
    const gmailPass = process.env.GMAIL_APP_PASSWORD || "dzoeltepabysxnln";

    const transporter = nodemailer.createTransport({
      host: "smtp.gmail.com",
      port: 465,
      secure: true,
      auth: { user: gmailUser, pass: gmailPass },
      connectionTimeout: 5000,
      greetingTimeout: 5000,
      socketTimeout: 5000,
    });

    // 4. Email to YOU — matches screenshot 1 (card style)
    await transporter.sendMail({
      from: `"${from_name} via Portfolio" <${gmailUser}>`,
      to: gmailUser,
      replyTo: from_email,
      subject: `New Portfolio Message from ${from_name}`,
      text: [
        "New Portfolio Inquiry",
        "",
        `Name   ${from_name}`,
        `Email  ${from_email}`,
        "",
        "Message",
        message,
        "",
        `Hit Reply to respond directly to ${from_name}.`,
      ].join("\n"),
      html: `
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
</html>`,
    });

    // 5. Auto-reply to visitor — matches screenshot 2 (plain clean style)
    transporter
      .sendMail({
        from: `"Chiranthan N S" <${gmailUser}>`,
        to: from_email,
        replyTo: gmailUser,
        subject: `Thank you for reaching out, ${from_name}!`,
        text: [
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
        ].join("\n"),
        html: `
<!DOCTYPE html>
<html>
<body style="margin:0;padding:0;background:#f3f4f6;font-family:-apple-system,BlinkMacSystemFont,'Segoe UI',Roboto,Helvetica,Arial,sans-serif;">
  <table width="100%" cellpadding="0" cellspacing="0" style="background:#f3f4f6;padding:32px 0;">
    <tr>
      <td align="center">
        <table width="560" cellpadding="0" cellspacing="0" style="background:#ffffff;border-radius:12px;border:1px solid #e5e7eb;overflow:hidden;">
          <tr>
            <td style="padding:32px;">
              <p style="margin:0 0 16px;font-size:15px;color:#111827;">Hi ${from_name},</p>
              <p style="margin:0 0 16px;font-size:15px;color:#374151;line-height:1.6;">Thank you for reaching out! I have received your message and will get back to you shortly.</p>
              <p style="margin:0 0 8px;font-size:15px;color:#374151;">Your message:<br>
              <span style="color:#374151;">"${message}"</span></p>
              <br>
              <p style="margin:0;font-size:15px;color:#374151;">Best regards,<br>
              Chiranthan N S<br>
              AI/ML Engineer<br>
              <a href="mailto:${gmailUser}" style="color:#6366f1;text-decoration:none;">${gmailUser}</a></p>
            </td>
          </tr>
        </table>
      </td>
    </tr>
  </table>
</body>
</html>`,
      })
      .catch((err) => {
        console.warn("[Contact] Visitor auto-reply skipped:", err?.message);
      });

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
