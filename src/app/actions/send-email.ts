"use server";

import { z } from "zod";
import nodemailer from "nodemailer";

const schema = z.object({
  from_name: z.string().min(1).max(100),
  from_email: z.string().email().max(200),
  message: z.string().min(10).max(2000),
  _trap: z.literal(""), // honeypot
});

// Simple in-memory rate limit: max 5 submissions per IP per 10 minutes
const rateLimitMap = new Map<string, { count: number; resetAt: number }>();

function checkRateLimit(ip: string): boolean {
  const now = Date.now();
  const entry = rateLimitMap.get(ip);
  if (!entry || now > entry.resetAt) {
    rateLimitMap.set(ip, { count: 1, resetAt: now + 10 * 60 * 1000 });
    return true;
  }
  if (entry.count >= 5) return false;
  entry.count++;
  return true;
}

export async function sendContactMessage(
  formData: FormData,
): Promise<{ ok: boolean; error?: string }> {
  const ip =
    (typeof process !== "undefined" && process.env["REMOTE_ADDR"]) || "unknown";

  if (!checkRateLimit(ip)) {
    return { ok: false, error: "Too many requests. Please wait a few minutes." };
  }

  const parsed = schema.safeParse({
    from_name: formData.get("from_name"),
    from_email: formData.get("from_email"),
    message: formData.get("message"),
    _trap: formData.get("_trap") ?? "",
  });

  if (!parsed.success) {
    return { ok: false, error: "Please provide a valid name, email, and message." };
  }

  const { from_name, from_email, message } = parsed.data;

  const gmailUser = process.env.GMAIL_USER;
  const gmailAppPassword = process.env.GMAIL_APP_PASSWORD;

  if (!gmailUser || !gmailAppPassword) {
    console.error("[Contact form] GMAIL_USER or GMAIL_APP_PASSWORD not set.");
    return { ok: false, error: "Contact form is not configured. Please email me directly." };
  }

  try {
    const transporter = nodemailer.createTransport({
      service: "gmail",
      auth: {
        user: gmailUser,
        pass: gmailAppPassword,
      },
    });

    // 1. Send notification to Chiranthan
    const notifyOwner = transporter.sendMail({
      from: `"${from_name} via Portfolio" <${gmailUser}>`,
      to: gmailUser,
      replyTo: from_email,
      subject: `New Portfolio Message from ${from_name}`,
      text: `Name: ${from_name}\nEmail: ${from_email}\n\nMessage:\n${message}`,
      html: `
        <div style="font-family:sans-serif;max-width:600px;margin:0 auto;padding:24px;border:1px solid #e5e7eb;border-radius:12px;">
          <h2 style="margin:0 0 16px;font-size:20px;color:#111827;">New Portfolio Inquiry</h2>
          <table style="width:100%;border-collapse:collapse;">
            <tr>
              <td style="padding:8px 0;color:#6b7280;font-size:13px;width:80px;">Name</td>
              <td style="padding:8px 0;color:#111827;font-size:14px;font-weight:600;">${from_name}</td>
            </tr>
            <tr>
              <td style="padding:8px 0;color:#6b7280;font-size:13px;">Email</td>
              <td style="padding:8px 0;"><a href="mailto:${from_email}" style="color:#4f46e5;font-size:14px;">${from_email}</a></td>
            </tr>
          </table>
          <hr style="border:none;border-top:1px solid #e5e7eb;margin:16px 0;" />
          <p style="color:#6b7280;font-size:13px;margin:0 0 8px;">Message</p>
          <p style="color:#111827;font-size:14px;white-space:pre-wrap;margin:0;">${message}</p>
          <hr style="border:none;border-top:1px solid #e5e7eb;margin:16px 0;" />
          <p style="color:#9ca3af;font-size:12px;margin:0;">Hit Reply to respond directly to ${from_name}.</p>
        </div>
      `,
    });

    // 2. Send automated confirmation email to the visitor
    const confirmVisitor = transporter.sendMail({
      from: `"Chiranthan N S" <${gmailUser}>`,
      to: from_email,
      replyTo: gmailUser,
      subject: `Thank you for reaching out, ${from_name}!`,
      text: `Hi ${from_name},\n\nThank you for reaching out! I've received your message and will get back to you shortly.\n\nYour message:\n"${message}"\n\nBest regards,\nChiranthan N S\nAI/ML Engineer\n${gmailUser}`,
      html: `
        <div style="font-family:-apple-system,BlinkMacSystemFont,'Segoe UI',Roboto,Helvetica,Arial,sans-serif;max-width:600px;margin:0 auto;padding:32px 24px;border:1px solid #e5e7eb;border-radius:12px;background:#ffffff;color:#111827;">
          <h2 style="margin:0 0 12px;font-size:22px;color:#111827;">Thank You for Reaching Out!</h2>
          <p style="font-size:15px;line-height:1.6;color:#374151;margin:0 0 16px;">
            Hi <strong>${from_name}</strong>,
          </p>
          <p style="font-size:15px;line-height:1.6;color:#374151;margin:0 0 20px;">
            Thank you for contacting me through my portfolio. I have received your message and will get back to you shortly.
          </p>
          <div style="background-color:#f9fafb;border-left:4px solid #6366f1;padding:16px;border-radius:6px;margin:0 0 24px;">
            <p style="margin:0 0 6px;font-size:12px;font-weight:600;text-transform:uppercase;letter-spacing:0.05em;color:#6b7280;">Your message:</p>
            <p style="margin:0;font-size:14px;color:#1f2937;white-space:pre-wrap;font-style:italic;">${message}</p>
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

    return { ok: true };
  } catch (err) {
    console.error("[Contact form] Nodemailer error:", err);
    return { ok: false, error: "Failed to send message. Please email me directly at chiranthanns24056@gmail.com" };
  }
}
