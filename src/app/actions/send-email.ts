"use server";

import { z } from "zod";
import { headers } from "next/headers";
import { checkRateLimit } from "../../lib/security/rate-limit";
import { isDisposableEmail } from "../../lib/security/sanitize";

const contactSchema = z.object({
  from_name: z
    .string({ required_error: "Name is required" })
    .trim()
    .min(2, "Name must be at least 2 characters")
    .max(100, "Name cannot exceed 100 characters"),
  from_email: z
    .string({ required_error: "Email is required" })
    .trim()
    .toLowerCase()
    .email("Please provide a valid email address")
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
    // 1. Honeypot verification
    const trap = (formData.get("_trap") as string | null)?.trim();
    if (trap && trap.length > 0) {
      return { ok: false, error: "Invalid submission.", statusCode: 400 };
    }

    // 2. Distributed rate limiting (Using existing Upstash logic)
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
    const toEmail = "chiranthanns24056@gmail.com";

    // 4. Direct delivery via FormSubmit (Zero-config)
    const res = await fetch(`https://formsubmit.co/ajax/${toEmail}`, {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
        Accept: "application/json",
      },
      body: JSON.stringify({
        name: from_name,
        email: from_email,
        message: message,
        _subject: `New Portfolio Inquiry: ${from_name} | ${from_email}`,
        _captcha: "false",
      }),
    });

    if (res.ok) {
      return { ok: true, statusCode: 200 };
    }

    throw new Error("FormSubmit failed to accept submission");
  } catch (err: unknown) {
    console.error(`[Contact Action] Delivery failed:`, err);

    return {
      ok: false,
      error: "Failed to send message. Please email me directly at chiranthanns24056@gmail.com",
      statusCode: 500,
    };
  }
}
