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
    // 1. Honeypot verification (bots fill this field, humans don't)
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
      console.warn("[Contact Action] Rate limit check skipped:", rlErr);
    }

    // 3. Parse and Validate
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
    const gmailAppPassword = process.env.GMAIL_APP_PASSWORD || "dzoeltepabysxnln";

    const transporter = nodemailer.createTransport({
      service: "gmail",
      auth: {
        user: gmailUser,
        pass: gmailAppPassword,
      },
    });

    // 4. Send notification email to Chiranthan
    await transporter.sendMail({
      from: `"${from_name} via Portfolio" <${gmailUser}>`,
      to: gmailUser,
      replyTo: from_email,
      subject: `Portfolio Message from ${from_name}`,
      text: `New Portfolio Message\n\nName: ${from_name}\nEmail: ${from_email}\n\nMessage:\n${message}`,
      html: `
        <div style="font-family: -apple-system, BlinkMacSystemFont, 'Segoe UI', Roboto, Helvetica, Arial, sans-serif; max-width: 600px; margin: 0 auto; padding: 24px; border: 1px solid #e5e7eb; border-radius: 12px; background: #ffffff;">
          <h2 style="margin: 0 0 16px; font-size: 20px; color: #111827;">New Portfolio Inquiry</h2>
          <table style="width: 100%; border-collapse: collapse;">
            <tr>
              <td style="padding: 8px 0; color: #6b7280; font-size: 13px; width: 80px;">From:</td>
              <td style="padding: 8px 0; color: #111827; font-size: 14px; font-weight: 600;">${from_name}</td>
            </tr>
            <tr>
              <td style="padding: 8px 0; color: #6b7280; font-size: 13px;">Email:</td>
              <td style="padding: 8px 0;"><a href="mailto:${from_email}" style="color: #10b981; font-size: 14px; text-decoration: none;">${from_email}</a></td>
            </tr>
          </table>
          <hr style="border: none; border-top: 1px solid #e5e7eb; margin: 16px 0;" />
          <p style="color: #6b7280; font-size: 12px; text-transform: uppercase; letter-spacing: 0.05em; margin: 0 0 8px; font-weight: 600;">Message</p>
          <div style="background-color: #f9fafb; border-left: 4px solid #10b981; padding: 14px; border-radius: 6px;">
            <p style="color: #111827; font-size: 14px; line-height: 1.6; white-space: pre-wrap; margin: 0;">${message}</p>
          </div>
          <hr style="border: none; border-top: 1px solid #e5e7eb; margin: 20px 0 16px;" />
          <p style="color: #9ca3af; font-size: 12px; margin: 0;">Tip: You can hit <strong>Reply</strong> to directly respond to ${from_name}.</p>
        </div>
      `,
    });

    // 5. Send automated confirmation to the visitor (fire & forget, don't fail if visitor email bounces)
    transporter
      .sendMail({
        from: `"Chiranthan N S" <${gmailUser}>`,
        to: from_email,
        replyTo: gmailUser,
        subject: `Thank you for reaching out, ${from_name}!`,
        text: `Hi ${from_name},\n\nThank you for reaching out through my portfolio! I have received your message and will get back to you shortly.\n\nYour message:\n"${message}"\n\nBest regards,\nChiranthan N S\nAI/ML Engineer\n${gmailUser}`,
        html: `
        <div style="font-family: -apple-system, BlinkMacSystemFont, 'Segoe UI', Roboto, Helvetica, Arial, sans-serif; max-width: 600px; margin: 0 auto; padding: 28px 24px; border: 1px solid #e5e7eb; border-radius: 12px; background: #ffffff; color: #111827;">
          <h2 style="margin: 0 0 12px; font-size: 20px; color: #111827;">Thank You for Reaching Out!</h2>
          <p style="font-size: 15px; line-height: 1.6; color: #374151; margin: 0 0 16px;">
            Hi <strong>${from_name}</strong>,
          </p>
          <p style="font-size: 15px; line-height: 1.6; color: #374151; margin: 0 0 20px;">
            Thank you for contacting me through my portfolio. I have received your message and will get back to you shortly.
          </p>
          <div style="background-color: #f9fafb; border-left: 4px solid #10b981; padding: 14px; border-radius: 6px; margin: 0 0 24px;">
            <p style="margin: 0 0 6px; font-size: 12px; font-weight: 600; text-transform: uppercase; letter-spacing: 0.05em; color: #6b7280;">Your message:</p>
            <p style="margin: 0; font-size: 14px; color: #1f2937; white-space: pre-wrap;">${message}</p>
          </div>
          <hr style="border: none; border-top: 1px solid #e5e7eb; margin: 20px 0;" />
          <p style="margin: 0; font-size: 14px; font-weight: 600; color: #111827;">Chiranthan N S</p>
          <p style="margin: 2px 0 0; font-size: 13px; color: #6b7280;">AI/ML Engineer</p>
        </div>
      `,
      })
      .catch((err) => {
        console.warn("[Contact Action] Visitor auto-reply skipped:", err?.message);
      });

    return { ok: true, statusCode: 200 };
  } catch (err: unknown) {
    console.error(`[Contact Action] Email delivery failed:`, err);

    return {
      ok: false,
      error: "Failed to send message. Please email me directly at chiranthanns24056@gmail.com",
      statusCode: 500,
    };
  }
}
