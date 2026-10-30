import { NextResponse } from "next/server";
import nodemailer from "nodemailer";

export const dynamic = "force-dynamic";

export async function GET() {
  const gmailUser = (
    process.env.GMAIL_USER?.trim() ||
    process.env.CONTACT_OWNER_EMAIL?.trim() ||
    "chiranthanns24056@gmail.com"
  ).replace(/["'\s]/g, "");

  const rawPass = process.env.GMAIL_APP_PASSWORD || "";
  const cleanPass = rawPass.replace(/["'\s-]/g, "");

  const diagnostic = {
    userConfigured: Boolean(gmailUser),
    userMasked: gmailUser
      ? gmailUser.slice(0, 3) + "***@" + gmailUser.split("@")[1]
      : null,
    passwordLength: cleanPass.length,
    passwordHasQuotes: rawPass.includes('"') || rawPass.includes("'"),
    passwordHasSpaces: rawPass.includes(" "),
    passwordHasDashes: rawPass.includes("-"),
    environment: process.env.VERCEL_ENV || process.env.NODE_ENV || "unknown",
  };

  if (!cleanPass || cleanPass.length < 8) {
    return NextResponse.json({
      status: "error",
      message: "GMAIL_APP_PASSWORD is missing or too short in environment variables.",
      diagnostic,
    });
  }

  try {
    const transporter = nodemailer.createTransport({
      host: "smtp.gmail.com",
      port: 465,
      secure: true,
      auth: {
        user: gmailUser,
        pass: cleanPass,
      },
      connectionTimeout: 8000,
      greetingTimeout: 8000,
      socketTimeout: 8000,
    });

    await transporter.verify();

    return NextResponse.json({
      status: "success",
      message: "Gmail SMTP authentication succeeded! Your email system is 100% operational.",
      diagnostic,
    });
  } catch (err: unknown) {
    const error = err as { message?: string; code?: string; response?: string };
    return NextResponse.json(
      {
        status: "failed",
        message: "Gmail SMTP authentication failed.",
        diagnostic,
        smtpError: {
          message: error.message,
          code: error.code,
          response: error.response,
        },
      },
      { status: 500 },
    );
  }
}
