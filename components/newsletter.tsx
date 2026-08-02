"use client";

import * as React from "react";
import { ArrowRight, Check, Loader2 } from "lucide-react";
import { Button } from "./ui/button";
import { useLang } from "./lang-provider";

const GENERIC_ERROR: Record<"en" | "gr", string> = {
  en: "Something went wrong. Please try again.",
  gr: "Κάτι πήγε στραβά. Δοκιμάστε ξανά.",
};

/** Newsletter sign-up on a navy band. Posts to /api/newsletter. */
export function Newsletter() {
  const { lang, t: dict } = useLang();
  const t = dict.newsletter;
  const [email, setEmail] = React.useState("");
  const [done, setDone] = React.useState(false);
  const [submitting, setSubmitting] = React.useState(false);
  const [error, setError] = React.useState(false);

  async function submit(e: React.FormEvent) {
    e.preventDefault();
    if (!email.trim() || submitting) return;
    setSubmitting(true);
    setError(false);
    try {
      const res = await fetch("/api/newsletter", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ email: email.trim(), locale: lang }),
      });
      const data = await res.json().catch(() => null);
      if (!res.ok || !data?.success) throw new Error("newsletter_signup_failed");
      setDone(true);
    } catch {
      setError(true);
    } finally {
      setSubmitting(false);
    }
  }

  return (
    <section className="on-dark relative bg-primary text-primary-foreground">
      <div className="hairline-gold absolute inset-x-0 top-0" />
      <div className="container grid items-center gap-10 py-16 md:grid-cols-2 md:py-20">
        <div className="reveal">
          <p className="eyebrow-gold">{t.eyebrow}</p>
          <h2 className="text-silver txt-depth-dark mt-3 font-display text-4xl font-medium leading-[1.15] tracking-[0.01em] md:text-[2.9rem]">
            {t.title}
          </h2>
          <div className="mt-4 h-px w-16 bg-gradient-to-r from-[hsl(var(--cream)/0.55)] to-transparent" />
          <p className="mt-4 max-w-md text-sm leading-relaxed text-[hsl(var(--cream)/0.78)]">
            {t.subtitle}
          </p>
        </div>
        <div className="reveal">
          {done ? (
            <p role="status" className="flex items-center gap-2.5 font-serif text-lg text-[hsl(var(--cream))]">
              <Check className="h-5 w-5 text-accent" /> {t.success}
            </p>
          ) : (
            <form onSubmit={submit} className="flex flex-col gap-3 sm:flex-row">
              <input
                type="email"
                required
                disabled={submitting}
                value={email}
                onChange={(e) => setEmail(e.target.value)}
                placeholder={t.placeholder}
                aria-label={t.placeholder}
                className="h-12 flex-1 border border-[hsl(var(--cream)/0.3)] bg-transparent px-4 text-sm text-[hsl(var(--cream))] placeholder:text-[hsl(var(--cream)/0.5)] focus:border-accent focus:outline-none disabled:opacity-60"
              />
              <Button type="submit" size="lg" variant="accent" disabled={submitting} className="btn-sheen shrink-0">
                {submitting ? <Loader2 className="h-4 w-4 animate-spin" /> : <>{t.button} <ArrowRight className="h-4 w-4" /></>}
              </Button>
            </form>
          )}
          {error && (
            <p role="alert" className="mt-2 text-xs text-destructive">
              {GENERIC_ERROR[lang]}
            </p>
          )}
          <p className="mt-3 text-xs text-[hsl(var(--cream)/0.55)]">{t.note}</p>
        </div>
      </div>
    </section>
  );
}
