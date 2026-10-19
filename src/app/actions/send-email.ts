"use server";

import { z } from "zod";
import nodemailer from "nodemailer";
import { headers } from "next/headers";
import { checkRateLimit } from "../../lib/security/rate-limit";
import {
  escapeHtml,
  formatHtmlParagraph,
  sanitizeHeader,
  isDisposableEmail,
} from "../../lib/security/sanitize";

// Strict validation schema preventing CRLF header injection, buffer overflows, and malformed inputs
const contactSchema = z.object({
  from_name: z
    .string({ required_error: "Name is required" })
    .trim()
    .min(2, "Name must be at least 2 characters")
    .max(100, "Name cannot exceed 100 characters")
    .refine(
      (val) => !/[\r\n\t\x00-\x1f\x7f]/.test(val),
      "Name contains invalid control characters",
    ),
  from_email: z
    .string({ required_error: "Email is required" })
    .trim()
    .toLowerCase()
    .min(5, "Email is too short")
    .max(254, "Email address is too long")
    .email("Please provide a valid email address")
    .refine(
      (val) => !/[\r\n\t\x00-\x1f\x7f]/.test(val),
      "Email contains invalid characters",
    )
    .refine(
      (val) => !isDisposableEmail(val),
      "Please provide a permanent, non-disposable email address",
    ),
  message: z
    .string({ required_error: "Message is required" })
    .trim()
    .min(10, "Message must be at least 10 characters")
    .max(2000, "Message cannot exceed 2000 characters"),
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
    // 1. Honeypot verification (silent rejection for bots)
    const trap = (formData.get("_trap") as string | null)?.trim();
    if (trap && trap.length > 0) {
      // Return safe failure without disclosing bot detection
      return { ok: false, error: "Invalid submission.", statusCode: 400 };
    }

    // 2. Distributed / sliding-window rate limiting
    const headersList = await headers();
    const rateLimit = await checkRateLimit(headersList);

    if (!rateLimit.success) {
      return {
        ok: false,
        error: "Too many requests. Please wait a few minutes before trying again.",
        statusCode: 429,
      };
    }

    // 3. Normalize & validate input fields
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
      const firstError = parsed.error.issues[0]?.message;
      return {
        ok: false,
        error: firstError ?? "Please provide a valid name, email, and message.",
        statusCode: 400,
      };
    }

    const { from_name, from_email, message } = parsed.data;

    // 4. Validate server-side credentials
    const gmailUser = process.env.GMAIL_USER?.trim();
    const gmailAppPassword = process.env.GMAIL_APP_PASSWORD?.trim();

    if (!gmailUser || !gmailAppPassword) {
      console.error("[Contact Action] Missing email configuration credentials.");
      return {
        ok: false,
        error: "Contact service is temporarily unavailable. Please email directly.",
        statusCode: 503,
      };
    }

    // 5. Header sanitization (strip CRLF, double quotes, and control chars)
    const sanitizedName = sanitizeHeader(from_name);
    const safeHtmlMessage = formatHtmlParagraph(message);
    const safeHtmlName = escapeHtml(from_name);
    const safeHtmlEmail = escapeHtml(from_email);

    // 6. Transporter creation
    const transporter = nodemailer.createTransport({
      service: "gmail",
      auth: {
        user: gmailUser,
        pass: gmailAppPassword,
      },
    });

    // 7. Notification email to portfolio owner (user input NEVER controls sender)
    const notifyOwner = transporter.sendMail({
      from: `"${sanitizedName} via Portfolio" <${gmailUser}>`,
      to: gmailUser,
      replyTo: from_email,
      subject: `New Portfolio Message from ${sanitizedName}`,
      text: `Name: ${from_name}\nEmail: ${from_email}\n\nMessage:\n${message}`,
      html: `
        <div style="font-family:sans-serif;max-width:600px;margin:0 auto;padding:24px;border:1px solid #e5e7eb;border-radius:12px;background:#ffffff;color:#111827;">
          <h2 style="margin:0 0 16px;font-size:20px;color:#111827;">New Portfolio Inquiry</h2>
          <table style="width:100%;border-collapse:collapse;">
            <tr>
              <td style="padding:8px 0;color:#6b7280;font-size:13px;width:80px;">Name</td>
              <td style="padding:8px 0;color:#111827;font-size:14px;font-weight:600;">${safeHtmlName}</td>
            </tr>
            <tr>
              <td style="padding:8px 0;color:#6b7280;font-size:13px;">Email</td>
              <td style="padding:8px 0;"><a href="mailto:${safeHtmlEmail}" style="color:#4f46e5;font-size:14px;">${safeHtmlEmail}</a></td>
            </tr>
          </table>
          <hr style="border:none;border-top:1px solid #e5e7eb;margin:16px 0;" />
          <p style="color:#6b7280;font-size:13px;margin:0 0 8px;">Message</p>
          <div style="color:#111827;font-size:14px;line-height:1.6;background:#f9fafb;padding:12px;border-radius:6px;">${safeHtmlMessage}</div>
          <hr style="border:none;border-top:1px solid #e5e7eb;margin:16px 0;" />
          <p style="color:#9ca3af;font-size:12px;margin:0;">Hit Reply to respond directly to ${safeHtmlName}.</p>
        </div>
      `,
    });

    // 8. Auto-reply confirmation to the visitor
    const confirmVisitor = transporter.sendMail({
      from: `"Chiranthan N S" <${gmailUser}>`,
      to: from_email,
      replyTo: gmailUser,
      subject: `Thank you for reaching out, ${sanitizedName}!`,
      text: `Hi ${from_name},\n\nThank you for reaching out! I've received your message and will get back to you shortly.\n\nYour message:\n"${message}"\n\nBest regards,\nChiranthan N S\nAI/ML Engineer\n${gmailUser}`,
      html: `
        <div style="font-family:-apple-system,BlinkMacSystemFont,'Segoe UI',Roboto,Helvetica,Arial,sans-serif;max-width:600px;margin:0 auto;padding:32px 24px;border:1px solid #e5e7eb;border-radius:12px;background:#ffffff;color:#111827;">
          <h2 style="margin:0 0 12px;font-size:22px;color:#111827;">Thank You for Reaching Out!</h2>
          <p style="font-size:15px;line-height:1.6;color:#374151;margin:0 0 16px;">
            Hi <strong>${safeHtmlName}</strong>,
          </p>
          <p style="font-size:15px;line-height:1.6;color:#374151;margin:0 0 20px;">
            Thank you for contacting me through my portfolio. I have received your message and will get back to you shortly.
          </p>
          <div style="background-color:#f9fafb;border-left:4px solid #6366f1;padding:16px;border-radius:6px;margin:0 0 24px;">
            <p style="margin:0 0 6px;font-size:12px;font-weight:600;text-transform:uppercase;letter-spacing:0.05em;color:#6b7280;">Your message:</p>
            <p style="margin:0;font-size:14px;color:#1f2937;line-height:1.6;font-style:italic;">${safeHtmlMessage}</p>
          </div>
          <p style="font-size:14px;line-height:1.6;color:#4b5563;margin:0 0 20px;">
            In the meantime, feel free to explore my projects on <a href="https://github.com/ChiranthanNS" style="color:#6366f1;text-decoration:none;font-weight:500;">GitHub</a> or connect with me on <a href="https://www.linkedin.com/in/chiranthan-n-s-426253328/" style="color:#6366f1;text-decoration:none;font-weight:500;">LinkedIn</a>.
          </p>
          <hr style="border:none;border-top:1px solid #e5e7eb;margin:24px 0;" />
          <p style="margin:0;font-size:14px;font-weight:600;color:#111827;">Chiranthan N S</p>
          <p style="margin:2px 0 0;font-size:13px;color:#6b7280;">AI/ML Engineer</p>
          <p style="margin:2px 0 0;font-size:13px;"><a href="mailto:${gmailUser}" style="color:#6366f1;text-decoration:none;">${gmailUser}</a></p>
        </div>
      `,
    });

    await Promise.all([notifyOwner, confirmVisitor]);

    return { ok: true, statusCode: 200 };
  } catch (err: unknown) {
    // Avoid logging sensitive user messages or raw passwords in logs
    const errCode = (err as { code?: string })?.code || "TRANSPORT_ERROR";
    console.error(`[Contact Action] Email delivery failed: ${errCode}`);

    return {
      ok: false,
      error: "Failed to send message. Please email me directly at chiranthanns24056@gmail.com",
      statusCode: 500,
    };
  }
}
