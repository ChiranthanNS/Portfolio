import assert from "assert";
import {
  escapeHtml,
  sanitizeHeader,
  formatHtmlParagraph,
  isDisposableEmail,
} from "../src/lib/security/sanitize.ts";
import { hashIdentifier } from "../src/lib/security/rate-limit.ts";
import nextConfig from "../next.config.ts";

let testsPassed = 0;
let testsFailed = 0;

function runTest(name: string, fn: () => void) {
  try {
    fn();
    console.log(`  PASS: ${name}`);
    testsPassed++;
  } catch (err: unknown) {
    console.error(`  FAIL: ${name}`);
    console.error(`     Error: ${err instanceof Error ? err.message : String(err)}`);
    testsFailed++;
  }
}

console.log("\n=== RUNNING SECURITY TEST SUITE ===\n");

// 1. HTML Escaping / XSS Prevention Tests
console.log("[1] HTML Escaping & XSS Sanitization Tests:");

runTest("Escapes script tags and angle brackets", () => {
  const input = '<script>alert("xss")</script>';
  const output = escapeHtml(input);
  assert.strictEqual(output, '&lt;script&gt;alert(&quot;xss&quot;)&lt;&#x2F;script&gt;');
  assert(!output.includes("<script>"));
});

runTest("Escapes double and single quotes", () => {
  const input = 'Hello "world" & \'everyone\'';
  const output = escapeHtml(input);
  assert.strictEqual(output, 'Hello &quot;world&quot; &amp; &#x27;everyone&#x27;');
});

runTest("formatHtmlParagraph converts newlines to <br /> after escaping", () => {
  const input = 'Line 1\n<b>Line 2</b>\r\nLine 3';
  const output = formatHtmlParagraph(input);
  assert.strictEqual(output, 'Line 1<br />&lt;b&gt;Line 2&lt;&#x2F;b&gt;<br />Line 3');
});

// 2. Email Header Injection / CRLF Prevention Tests
console.log("\n[2] Email Header Injection / CRLF Sanitization Tests:");

runTest("Strips carriage return and newline from header", () => {
  const input = "Attacker\r\nBcc: target@victim.com\r\nSubject: Spoofed";
  const output = sanitizeHeader(input);
  assert(!output.includes("\r"));
  assert(!output.includes("\n"));
  assert.strictEqual(output, "Attacker Bcc: target@victim.com Subject: Spoofed");
});

runTest("Strips null bytes and control characters", () => {
  const input = "Test\x00User\x1fName";
  const output = sanitizeHeader(input);
  assert.strictEqual(output, "Test User Name");
});

runTest("Strips quotes that could break RFC 5322 display names", () => {
  const input = 'Chiranthan "Admin" N S';
  const output = sanitizeHeader(input);
  assert(!output.includes('"'));
  assert.strictEqual(output, "Chiranthan Admin N S");
});

// 3. Disposable Email Domain Blocking Tests
console.log("\n[3] Disposable Email Domain Detection Tests:");

runTest("Detects common burner domains (mailinator.com)", () => {
  assert.strictEqual(isDisposableEmail("spammer@mailinator.com"), true);
});

runTest("Detects 10minutemail.com", () => {
  assert.strictEqual(isDisposableEmail("fake@10minutemail.com"), true);
});

runTest("Detects temp-mail.org", () => {
  assert.strictEqual(isDisposableEmail("test@temp-mail.org"), true);
});

runTest("Detects yopmail.com", () => {
  assert.strictEqual(isDisposableEmail("bot@yopmail.com"), true);
});

runTest("Allows legitimate personal and corporate domains", () => {
  assert.strictEqual(isDisposableEmail("chiranthan@gmail.com"), false);
  assert.strictEqual(isDisposableEmail("recruiter@apple.com"), false);
  assert.strictEqual(isDisposableEmail("developer@outlook.com"), false);
  assert.strictEqual(isDisposableEmail("engineer@proton.me"), false);
  assert.strictEqual(isDisposableEmail("student@vvce.ac.in"), false);
});

runTest("Case insensitive domain matching", () => {
  assert.strictEqual(isDisposableEmail("SPAM@MAILINATOR.COM"), true);
  assert.strictEqual(isDisposableEmail("user@GMAIL.COM"), false);
});

// 4. IP Privacy & Hashing Tests
console.log("\n[4] Privacy-Preserving IP Hashing Tests:");

runTest("Produces consistent 32-character SHA-256 HMAC hash", () => {
  const hash1 = hashIdentifier("192.168.1.1");
  const hash2 = hashIdentifier("192.168.1.1");
  assert.strictEqual(hash1, hash2);
  assert.strictEqual(hash1.length, 32);
  assert(!hash1.includes("192.168"));
});

runTest("Different IPs produce different hashes", () => {
  const hashA = hashIdentifier("203.0.113.195");
  const hashB = hashIdentifier("203.0.113.196");
  assert.notStrictEqual(hashA, hashB);
});

// 5. HTTP Security Configuration Tests
console.log("\n[5] Next.js Security Configuration Tests:");

runTest("next.config.ts disables poweredByHeader", () => {
  assert.strictEqual(nextConfig.poweredByHeader, false);
});

runTest("next.config.ts configures headers function", async () => {
  assert(typeof nextConfig.headers === "function");
  const headers = await nextConfig.headers!();
  assert(Array.isArray(headers));
  assert(headers.length > 0);
  
  const rootHeaders = headers[0]?.headers;
  assert(Array.isArray(rootHeaders));
  
  const headerKeys = rootHeaders.map((h) => h.key);
  assert(headerKeys.includes("Content-Security-Policy"));
  assert(headerKeys.includes("X-Content-Type-Options"));
  assert(headerKeys.includes("X-Frame-Options"));
  assert(headerKeys.includes("Referrer-Policy"));
  assert(headerKeys.includes("Permissions-Policy"));
  assert(headerKeys.includes("Strict-Transport-Security"));
});

// 6. Server-Side Zod Schema Validation Tests
console.log("\n[6] Server-Side Input Validation & Injection Tests:");

import { z } from "zod";

const testSchema = z.object({
  from_name: z
    .string()
    .trim()
    .min(2, "Name must be at least 2 characters")
    .max(100, "Name cannot exceed 100 characters")
    .refine((val) => !/[\r\n\t\x00-\x1f\x7f]/.test(val), "Name contains invalid characters"),
  from_email: z
    .string()
    .trim()
    .toLowerCase()
    .min(5, "Email is too short")
    .max(254, "Email address is too long")
    .email("Please provide a valid email address")
    .refine((val) => !/[\r\n\t\x00-\x1f\x7f]/.test(val), "Email contains invalid characters")
    .refine((val) => !isDisposableEmail(val), "Disposable email rejected"),
  message: z
    .string()
    .trim()
    .min(10, "Message must be at least 10 characters")
    .max(2000, "Message cannot exceed 2000 characters"),
  _trap: z.string().optional(),
});

runTest("Valid submission passes schema", () => {
  const result = testSchema.safeParse({
    from_name: "Chiranthan N S",
    from_email: "recruiter@company.com",
    message: "Hello Chiranthan, we are interested in your AI/ML projects!",
    _trap: "",
  });
  assert.strictEqual(result.success, true);
});

runTest("Legitimate international names pass schema", () => {
  const internationalNames = ["José Müller", "René d'Aubigné", "Björn Håkan", "चिन्मय"];
  for (const name of internationalNames) {
    const res = testSchema.safeParse({
      from_name: name,
      from_email: "test@domain.com",
      message: "Testing international names support.",
      _trap: "",
    });
    assert.strictEqual(res.success, true, `Expected ${name} to pass`);
  }
});

runTest("Rejects CRLF in name (header injection attempt)", () => {
  const result = testSchema.safeParse({
    from_name: "Attacker\r\nBcc: target@test.com",
    from_email: "attacker@domain.com",
    message: "Valid message content here.",
    _trap: "",
  });
  assert.strictEqual(result.success, false);
});

runTest("Rejects CRLF in email (header injection attempt)", () => {
  const result = testSchema.safeParse({
    from_name: "Attacker",
    from_email: "attacker@domain.com\r\nBcc: victim@test.com",
    message: "Valid message content here.",
    _trap: "",
  });
  assert.strictEqual(result.success, false);
});

runTest("Rejects disposable email address in schema", () => {
  const result = testSchema.safeParse({
    from_name: "Bot User",
    from_email: "spammer@10minutemail.com",
    message: "This is spam from disposable email.",
    _trap: "",
  });
  assert.strictEqual(result.success, false);
  assert(result.error?.issues.some((i) => i.message.includes("Disposable email rejected")));
});

runTest("Rejects excessively long name (>100 chars)", () => {
  const result = testSchema.safeParse({
    from_name: "A".repeat(101),
    from_email: "user@domain.com",
    message: "Valid message content here.",
    _trap: "",
  });
  assert.strictEqual(result.success, false);
});

runTest("Rejects excessively long message (>2000 chars)", () => {
  const result = testSchema.safeParse({
    from_name: "Valid User",
    from_email: "user@domain.com",
    message: "M".repeat(2001),
    _trap: "",
  });
  assert.strictEqual(result.success, false);
});

runTest("Rejects too-short message (<10 chars)", () => {
  const result = testSchema.safeParse({
    from_name: "Valid User",
    from_email: "user@domain.com",
    message: "Hi!",
    _trap: "",
  });
  assert.strictEqual(result.success, false);
});

console.log("\n------------------------------------------------");
console.log(`TOTAL TESTS: ${testsPassed + testsFailed} | PASSED: ${testsPassed} | FAILED: ${testsFailed}`);
console.log("------------------------------------------------\n");

if (testsFailed > 0) {
  process.exit(1);
}
