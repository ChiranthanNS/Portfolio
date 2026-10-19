"use client";

import { useState, type FormEvent } from "react";
import { Loader2, Send } from "lucide-react";
import { toast } from "sonner";

export function FeedbackForm({
  projectSlug,
  projectTitle,
}: {
  projectSlug: string;
  projectTitle: string;
}) {
  const [sending, setSending] = useState(false);

  async function handleSubmit(e: FormEvent<HTMLFormElement>) {
    e.preventDefault();
    const form = e.currentTarget;
    setSending(true);

    const { sendContactMessage } = await import("../app/actions/send-email");
    const fd = new FormData(form);
    fd.set("message", `[Feedback on: ${projectTitle}]\n\n${fd.get("message") as string}`);
    const result = await sendContactMessage(fd);
    setSending(false);

    if (result.ok) {
      toast.success("Feedback sent — thank you!");
      form.reset();
    } else {
      toast.error(result.error ?? "Something went wrong.");
    }
  }

  return (
    <div>
      <h3 className="font-heading mb-1 text-lg font-bold tracking-[-0.02em]">
        Leave feedback
      </h3>
      <p className="text-muted-foreground mb-6 text-sm">
        Have a question or thought about {projectTitle}? Send it over.
      </p>
      <form onSubmit={handleSubmit} className="space-y-4">
        {/* Honeypot */}
        <input
          type="text"
          name="_trap"
          className="hidden"
          tabIndex={-1}
          autoComplete="off"
        />
        <div className="grid gap-4 sm:grid-cols-2">
          <div>
            <label htmlFor={`fb-name-${projectSlug}`} className="mb-1 block font-mono text-xs">
              Name
            </label>
            <input
              id={`fb-name-${projectSlug}`}
              name="name"
              required
              maxLength={100}
              className="border-border bg-surface-2 focus:ring-primary w-full rounded-xl border px-4 py-2.5 text-sm outline-none ring-offset-2 focus:ring-2"
            />
          </div>
          <div>
            <label htmlFor={`fb-email-${projectSlug}`} className="mb-1 block font-mono text-xs">
              Email
            </label>
            <input
              id={`fb-email-${projectSlug}`}
              name="email"
              type="email"
              required
              maxLength={200}
              className="border-border bg-surface-2 focus:ring-primary w-full rounded-xl border px-4 py-2.5 text-sm outline-none ring-offset-2 focus:ring-2"
            />
          </div>
        </div>
        <div>
          <label htmlFor={`fb-msg-${projectSlug}`} className="mb-1 block font-mono text-xs">
            Message
          </label>
          <textarea
            id={`fb-msg-${projectSlug}`}
            name="message"
            required
            minLength={10}
            maxLength={2000}
            rows={4}
            className="border-border bg-surface-2 focus:ring-primary w-full resize-none rounded-xl border px-4 py-2.5 text-sm outline-none ring-offset-2 focus:ring-2"
          />
        </div>
        <button
          type="submit"
          disabled={sending}
          className="bg-primary text-primary-foreground hover:bg-primary/90 inline-flex items-center gap-2 rounded-full px-6 py-2.5 text-sm font-medium transition-colors disabled:opacity-60"
        >
          {sending ? (
            <Loader2 className="size-4 animate-spin" />
          ) : (
            <Send className="size-4" />
          )}
          {sending ? "Sending…" : "Send feedback"}
        </button>
      </form>
    </div>
  );
}
