"use server";

import { z } from "zod";
import { headers } from "next/headers";
import { checkRateLimit } from "../../lib/security/rate-limit";

// Ultra-reliable validation: removes restrictions that might block legitimate users/tests
const contactSchema = z.object({
  from_name: z
    .string({ required_error: "Name is required" })
    .trim()
    .min(1, "Name is required"),
  from_email: z
    .string({ required_error: "Email is required" })
    .trim()
    .toLowerCase()
    .email("Please provide a valid email address"),
  message: z
    .string({ required_error: "Message is required" })
    .trim()
    .min(1, "Message is required"),
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
    const headersList = await headers();
    const rateLimit = await checkRateLimit(headersList);

    if (!rateLimit.success) {
      return {
        ok: false,
        error: "Too many requests. Please wait a few minutes.",
        statusCode: 429,
      };
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
        error: parsed.error.issues[0]?.message ?? "Invalid input.",
        statusCode: 400,
      };
    }

    const { from_name, from_email, message } = parsed.data;
    const toEmail = "chiranthanns24056@gmail.com";

    // 4. Bulletproof fetch to FormSubmit
    const res = await fetch(`https://formsubmit.co/ajax/${toEmail}`, {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
        "Accept": "application/json",
        "User-Agent": "Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/120.0.0.0 Safari/537.36",
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

    const errorText = await res.text();
    console.error(`[Contact Action] FormSubmit Error: ${res.status} - ${errorText}`);
    throw new Error(`FormSubmit responded with ${res.status}`);
  } catch (err: unknown) {
    console.error(`[Contact Action] Critical Failure:`, err);

    return {
      ok: false,
      error: "Failed to send message. Please email me directly at chiranthanns24056@gmail.com",
      statusCode: 500,
    };
  }
}
