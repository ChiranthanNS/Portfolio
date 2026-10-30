/**
 * Common disposable / temporary email domains to prevent automated spam
 * from temporary burner inboxes.
 */
const disposableDomainsSet = new Set<string>([
  "mailinator.com",
  "10minutemail.com",
  "guerrillamail.com",
  "tempmail.com",
  "temp-mail.org",
  "throwawaymail.com",
  "yopmail.com",
  "sharklasers.com",
  "getairmail.com",
  "dispostable.com",
  "mytemp.email",
  "trashmail.com",
  "nada.ltd",
  "inboxkitten.com",
  "burnermail.io",
  "tempmailo.com",
  "crazymailing.com",
  "mohmal.com",
  "emailondeck.com",
  "generator.email",
  "tempinbox.com",
  "dropmail.me",
  "fakeinbox.com",
]);

/**
 * Escapes characters with special meaning in HTML to prevent XSS / HTML injection
 * inside rendered HTML email bodies and web interfaces.
 */
export function escapeHtml(str: string): string {
  return str
    .replace(/&/g, "&amp;")
    .replace(/</g, "&lt;")
    .replace(/>/g, "&gt;")
    .replace(/"/g, "&quot;")
    .replace(/'/g, "&#x27;")
    .replace(/\//g, "&#x2F;");
}

/**
 * Formats multi-line plain text for HTML emails safely by escaping HTML entities first,
 * then converting newlines to <br /> tags.
 */
export function formatHtmlParagraph(text: string): string {
  return escapeHtml(text).replace(/(?:\r\n|\r|\n)/g, "<br />");
}

/**
 * Sanitizes header fields (name, subject) by stripping CR, LF, and control characters
 * to prevent CRLF Email Header Injection attacks.
 */
export function sanitizeHeader(str: string): string {
  // Remove CRLF, control characters (ASCII 0-31 and 127), and double quotes
  return str.replace(/[\r\n\t\x00-\x1f\x7f"]/g, " ").replace(/\s+/g, " ").trim();
}

/**
 * Validates whether an email domain is in the disposable/temporary email blocklist.
 */
export function isDisposableEmail(email: string): boolean {
  if (!email || !email.includes("@")) return false;
  const parts = email.split("@");
  const domain = parts[parts.length - 1]?.toLowerCase().trim();
  if (!domain) return false;

  return disposableDomainsSet.has(domain);
}
