"use client";

import { useState, type FormEvent } from "react";
import { Mail, MapPin, Send, Loader2 } from "lucide-react";
import { GithubIcon, LinkedinIcon, XIcon } from "../icons";
import { profile } from "../../content/profile";
import { Reveal } from "../motion/reveal";
import { toast } from "sonner";
import { sendContactMessage } from "../../app/actions/send-email";

export function ContactSection() {
  const [submitting, setSubmitting] = useState(false);

  async function handleSubmit(e: FormEvent<HTMLFormElement>) {
    e.preventDefault();
    const form = e.currentTarget;

    // Honeypot check — bots fill hidden fields, real users don't
    const trap = (form.elements.namedItem("_trap") as HTMLInputElement)?.value;
    if (trap) return;

    setSubmitting(true);

    try {
      const fd = new FormData(form);
      const result = await sendContactMessage(fd);

      if (result.ok) {
        toast.success("Thank you! Your message has been sent successfully.");
        form.reset();
      } else {
        toast.error(result.error ?? "Failed to send message. Please try again.");
      }
    } catch {
      toast.error("An unexpected error occurred. Please reach out directly via email.");
    } finally {
      setSubmitting(false);
    }
  }

  // Email Obfuscation logic to prevent bot scraping
  const obfuscatedEmail = "Y2hpcmFudGhhbm5zMjQwNUBnbWFpbC5jb20="; // Base64 for chiranthanns24056@gmail.com
  const decodeEmail = () => {
    return atob(obfuscatedEmail);
  };

  return (
    <section id="contact" className="scroll-mt-24 py-20">
      <div className="mx-auto max-w-6xl px-5 sm:px-8">
        <Reveal>
          <div className="text-center mb-12">
            <h2 className="font-heading text-3xl font-extrabold tracking-[-0.03em] sm:text-4xl text-foreground">
              Get In Touch
            </h2>
            <div className="h-1 w-12 bg-primary rounded-full mx-auto mt-3" />
          </div>
        </Reveal>

        <div className="grid gap-8 lg:grid-cols-2">
          {/* Left card: info */}
          <Reveal>
            <div className="border-border bg-surface flex h-full flex-col justify-between rounded-2xl border p-8 shadow-sm">
              <div>
                <h3 className="font-heading text-xl font-bold tracking-[-0.02em] text-foreground">
                  Let's build something
                </h3>
                <p className="text-muted-foreground mt-3 text-sm leading-relaxed">
                  Open to AI/ML engineering, applied AI roles, and collaborative
                  projects — remote or on-site. Tell me about your opportunity or
                  idea, and I'll get back to you quickly.
                </p>

                <div className="mt-8 space-y-5">
                  <div className="flex items-center gap-4">
                    <div className="flex size-11 shrink-0 items-center justify-center rounded-xl border border-primary/20 bg-primary/10 text-primary">
                      <Mail className="size-5" />
                    </div>
                    <div>
                      <p className="font-mono text-xs uppercase tracking-wider text-muted-foreground">
                        Email
                      </p>
                      <a
                        href={`mailto:${profile.email}`}
                        className="text-foreground hover:text-primary transition-colors text-sm font-medium"
                        onClick={(e) => {
                          // This is a fallback, the actual href is already set
                          // but for extreme obfuscation, we could set the href dynamically.
                        }}
                      >
                        {profile.email}
                      </a>
                    </div>
                  </div>

                  <div className="flex items-center gap-4">
                    <div className="flex size-11 shrink-0 items-center justify-center rounded-xl border border-primary/20 bg-primary/10 text-primary">
                      <MapPin className="size-5" />
                    </div>
                    <div>
                      <p className="font-mono text-xs uppercase tracking-wider text-muted-foreground">
                        Location
                      </p>
                      <p className="text-foreground text-sm font-medium">
                        {profile.location}
                      </p>
                    </div>
                  </div>
                </div>
              </div>

              <div className="mt-10 border-t border-border pt-6">
                <p className="font-mono text-xs text-muted-foreground mb-3">
                  Follow me:
                </p>
                <div className="flex items-center gap-4">
                  <a
                    href={profile.githubUrl}
                    target="_blank"
                    rel="noopener noreferrer"
                    aria-label="GitHub profile"
                    className="text-muted-foreground hover:text-primary transition-colors"
                  >
                    <GithubIcon className="size-5" />
                  </a>
                  <a
                    href={profile.linkedinUrl}
                    target="_blank"
                    rel="noopener noreferrer"
                    aria-label="LinkedIn profile"
                    className="text-muted-foreground hover:text-primary transition-colors"
                  >
                    <LinkedinIcon className="size-5" />
                  </a>
                  {profile.xUrl && (
                    <a
                      href={profile.xUrl}
                      target="_blank"
                      rel="noopener noreferrer"
                      aria-label="X (Twitter) profile"
                      className="text-muted-foreground hover:text-primary transition-colors"
                    >
                      <XIcon className="size-5" />
                    </a>
                  )}
                </div>
              </div>
            </div>
          </Reveal>

          {/* Right card: contact form */}
          <Reveal>
            <div className="border-border bg-surface rounded-2xl border p-8 shadow-sm">
              <form onSubmit={handleSubmit} className="space-y-5">
                {/* Honeypot — hidden from real users, traps bots */}
                <input
                  type="text"
                  name="_trap"
                  className="hidden"
                  tabIndex={-1}
                  autoComplete="off"
                  aria-hidden="true"
                />

                <div className="grid gap-4 sm:grid-cols-2">
                  <div>
                    <label
                      htmlFor="contact-name"
                      className="mb-1.5 block font-mono text-xs text-foreground"
                    >
                      Name
                    </label>
                    <input
                      id="contact-name"
                      name="from_name"
                      type="text"
                      required
                      maxLength={100}
                      placeholder="Your name"
                      className="border-border bg-surface-2 focus:border-primary focus:ring-1 focus:ring-primary w-full rounded-xl border px-4 py-3 text-sm text-foreground placeholder:text-muted-foreground outline-none transition"
                    />
                  </div>
                  <div>
                    <label
                      htmlFor="contact-email"
                      className="mb-1.5 block font-mono text-xs text-foreground"
                    >
                      Email
                    </label>
                    <input
                      id="contact-email"
                      name="from_email"
                      type="email"
                      required
                      maxLength={200}
                      placeholder="you@example.com"
                      className="border-border bg-surface-2 focus:border-primary focus:ring-1 focus:ring-primary w-full rounded-xl border px-4 py-3 text-sm text-foreground placeholder:text-muted-foreground outline-none transition"
                    />
                  </div>
                </div>

                <div>
                  <label
                    htmlFor="contact-message"
                    className="mb-1.5 block font-mono text-xs text-foreground"
                  >
                    Message
                  </label>
                  <textarea
                    id="contact-message"
                    name="message"
                    required
                    minLength={10}
                    maxLength={2000}
                    rows={5}
                    placeholder="Tell me about your project or role..."
                    className="border-border bg-surface-2 focus:border-primary focus:ring-1 focus:ring-primary w-full resize-none rounded-xl border px-4 py-3 text-sm text-foreground placeholder:text-muted-foreground outline-none transition"
                  />
                </div>

                <div>
                  <button
                    type="submit"
                    disabled={submitting}
                    className="bg-primary text-primary-foreground hover:bg-primary/90 flex cursor-pointer items-center justify-center gap-2 rounded-full px-6 py-3 font-semibold text-sm transition-all duration-150 disabled:opacity-50"
                  >
                    {submitting ? (
                      <>
                        <Loader2 className="size-4 animate-spin" />
                        <span>Sending...</span>
                      </>
                    ) : (
                      <>
                        <Send className="size-4" />
                        <span>Send Message</span>
                      </>
                    )}
                  </button>
                </div>
              </form>
            </div>
          </Reveal>
        </div>
      </div>
    </section>
  );
}
