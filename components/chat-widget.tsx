"use client";

import * as React from "react";
import { Check, Loader2, MessageCircle, Send, X } from "lucide-react";
import { cn } from "@/lib/utils";
import type { Lang } from "@/lib/i18n";
import { useLang } from "./lang-provider";
import { Button } from "./ui/button";
import { Input } from "./ui/input";

const NAME_MAX = 80;
const EMAIL_MAX = 200;
const MESSAGE_MAX = 2000;

/**
 * Not core marketing copy, so per house convention this is a short hardcoded
 * fallback rather than a new lib/i18n.ts key — covers any non-2xx response
 * (429 rate-limit or 5xx) without leaking the backend's English-only error
 * text to a Greek-reading visitor.
 */
const FALLBACK_ERROR: Record<Lang, string> = {
  en: "Something went wrong. Please try again in a moment.",
  gr: "Κάτι πήγε στραβά. Δοκιμάστε ξανά σε λίγο.",
};

type Status = "idle" | "sending" | "success";

interface ChatWidgetProps {
  /** Pass the current product handle when mounting on a PDP, e.g. from params.handle. */
  productHandle?: string;
}

/**
 * Floating contact widget, fixed bottom-right, site-wide. A real message to
 * the Berto Lucci team (POST /api/chat) styled as a chat popover — NOT a live
 * or AI chatbot, which `reachNote` says outright. Quick-reply chips only
 * pre-fill the composer; there is no order-lookup backend behind them.
 */
export default function ChatWidget({ productHandle }: ChatWidgetProps) {
  const { lang, t: dict } = useLang();
  const t = dict.chat;

  const uid = React.useId();
  const panelId = `chat-widget-panel-${uid}`;

  const [open, setOpen] = React.useState(false);
  const [name, setName] = React.useState("");
  const [email, setEmail] = React.useState("");
  const [message, setMessage] = React.useState("");
  const [hp, setHp] = React.useState("");
  const [status, setStatus] = React.useState<Status>("idle");
  const [error, setError] = React.useState(false);

  const launcherRef = React.useRef<HTMLButtonElement>(null);
  const panelRef = React.useRef<HTMLDivElement>(null);
  const textareaRef = React.useRef<HTMLTextAreaElement>(null);
  const hasOpenedRef = React.useRef(false);

  // Focus the composer on open; return focus to the launcher on close. Guarded
  // by hasOpenedRef so a page load (open starts false) never steals focus.
  React.useEffect(() => {
    if (open) {
      hasOpenedRef.current = true;
      textareaRef.current?.focus();
    } else if (hasOpenedRef.current) {
      launcherRef.current?.focus();
    }
  }, [open]);

  // Clear transient submit state on close so reopening always starts fresh.
  // Drafted text (name/email/message) is intentionally left alone.
  React.useEffect(() => {
    if (!open) {
      setStatus("idle");
      setError(false);
    }
  }, [open]);

  // Escape and outside-click close the popover (it's not a blocking modal).
  React.useEffect(() => {
    if (!open) return;
    function onKey(e: KeyboardEvent) {
      if (e.key === "Escape") setOpen(false);
    }
    function onPointerDown(e: MouseEvent) {
      const target = e.target as Node;
      if (panelRef.current?.contains(target)) return;
      if (launcherRef.current?.contains(target)) return;
      setOpen(false);
    }
    document.addEventListener("keydown", onKey);
    document.addEventListener("mousedown", onPointerDown);
    return () => {
      document.removeEventListener("keydown", onKey);
      document.removeEventListener("mousedown", onPointerDown);
    };
  }, [open]);

  function updateMessage(value: string) {
    setMessage(value);
    if (status === "success") setStatus("idle");
  }

  function applyQuickReply(label: string) {
    updateMessage(label);
    requestAnimationFrame(() => {
      const el = textareaRef.current;
      if (!el) return;
      el.focus();
      el.setSelectionRange(el.value.length, el.value.length);
    });
  }

  async function onSubmit(e: React.FormEvent) {
    e.preventDefault();
    if (status === "sending" || !message.trim()) return;
    setStatus("sending");
    setError(false);
    try {
      const res = await fetch("/api/chat", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          name: name.trim(),
          email: email.trim(),
          message: message.trim(),
          pageUrl: window.location.href,
          productHandle: productHandle ?? "",
          locale: lang,
          hp,
        }),
      });
      if (!res.ok) throw new Error("chat_send_failed");
      setStatus("success");
      setName("");
      setEmail("");
      setMessage("");
      setHp("");
    } catch {
      setStatus("idle");
      setError(true);
    }
  }

  const quickReplies = [
    { key: "trackOrder", label: t.quickReplies.trackOrder },
    { key: "sizingHelp", label: t.quickReplies.sizingHelp },
    { key: "shippingReturns", label: t.quickReplies.shippingReturns },
  ];

  return (
    // DOM order [launcher, panel] + flex-col-reverse: the launcher anchors to
    // the bottom of this box and the panel stacks above it, so the gap adapts
    // automatically to the panel's height (no manual offset math). Position
    // clears the mobile UtilityBar (fixed bottom-0, h-14, z-40, md:hidden) with
    // 24px to spare; z-40 keeps this in the same persistent-chrome tier as the
    // navbar (z-40) and that bar, and below true modals — cart Sheet / checkout
    // Dialog — at z-50, so a modal always wins if both are ever open at once.
    <div className="fixed bottom-20 right-4 z-40 flex flex-col-reverse items-end gap-3 md:bottom-6 md:right-6">
      <button
        ref={launcherRef}
        type="button"
        onClick={() => setOpen((v) => !v)}
        aria-expanded={open}
        aria-haspopup="dialog"
        aria-controls={panelId}
        aria-label={open ? t.closeLabel : t.openLabel}
        className="btn-sheen flex h-14 w-14 shrink-0 items-center justify-center rounded-full bg-primary text-primary-foreground shadow-[0_18px_40px_-16px_hsl(var(--navy)/0.55)] transition-transform duration-300 hover:-translate-y-0.5 hover:shadow-[0_22px_50px_-16px_hsl(var(--navy)/0.6)] focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring focus-visible:ring-offset-2 active:scale-95"
      >
        <span className="relative flex h-5 w-5 items-center justify-center">
          <MessageCircle
            className={cn(
              "absolute h-5 w-5 transition-all duration-300 motion-reduce:transition-none",
              open ? "rotate-45 scale-0 opacity-0" : "rotate-0 scale-100 opacity-100"
            )}
          />
          <X
            className={cn(
              "absolute h-5 w-5 transition-all duration-300 motion-reduce:transition-none",
              open ? "rotate-0 scale-100 opacity-100" : "-rotate-45 scale-0 opacity-0"
            )}
          />
        </span>
      </button>

      {open && (
        <div
          ref={panelRef}
          id={panelId}
          role="dialog"
          aria-label="Chat"
          className="chat-widget-panel animate-fade-up motion-reduce:animate-none relative flex w-[min(24rem,calc(100vw_-_2rem))] flex-col overflow-hidden border border-border bg-card shadow-[0_28px_60px_-24px_hsl(var(--navy)/0.5)]"
        >
          <button
            type="button"
            onClick={() => setOpen(false)}
            className="absolute right-2.5 top-2.5 p-1.5 opacity-70 transition-opacity hover:opacity-100 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring focus-visible:ring-offset-2"
          >
            <X className="h-4 w-4" />
            <span className="sr-only">{t.closeLabel}</span>
          </button>

          <div className="thin-scroll flex-1 overflow-y-auto p-5 pt-6">
            <p className="eyebrow-gold">{dict.about.contact.eyebrow}</p>
            <p className="mt-2 pr-6 font-serif text-[15px] leading-relaxed text-foreground">
              {t.greeting}
            </p>

            <div className="mt-4 flex flex-wrap gap-2">
              {quickReplies.map((q) => (
                <button
                  key={q.key}
                  type="button"
                  disabled={status === "sending"}
                  onClick={() => applyQuickReply(q.label)}
                  className="chip-beige transition-colors hover:border-accent hover:bg-[hsl(var(--foreground)/0.08)] focus-visible:outline-none focus-visible:ring-1 focus-visible:ring-ring disabled:cursor-not-allowed disabled:opacity-50"
                >
                  {q.label}
                </button>
              ))}
            </div>

            <form onSubmit={onSubmit} className="mt-5 space-y-3">
              {/* Honeypot — never labelled or shown. Real visitors never see or
                  fill this; a bot that autofills every field trips it and the
                  API silently no-ops (see app/api/chat/route.ts). */}
              <input
                type="text"
                name="hp"
                value={hp}
                onChange={(e) => setHp(e.target.value)}
                tabIndex={-1}
                autoComplete="off"
                aria-hidden="true"
                className="absolute -left-[9999px] top-0 h-px w-px overflow-hidden opacity-0"
              />

              <textarea
                ref={textareaRef}
                required
                value={message}
                onChange={(e) => updateMessage(e.target.value)}
                maxLength={MESSAGE_MAX}
                rows={4}
                disabled={status === "sending"}
                placeholder={t.inputPlaceholder}
                aria-label={t.inputPlaceholder}
                className="flex w-full resize-none border border-input bg-card px-3 py-2.5 text-sm leading-relaxed transition-colors placeholder:text-muted-foreground focus-visible:outline-none focus-visible:ring-1 focus-visible:ring-ring disabled:cursor-not-allowed disabled:opacity-50"
              />

              <Input
                value={name}
                onChange={(e) => setName(e.target.value)}
                maxLength={NAME_MAX}
                disabled={status === "sending"}
                placeholder={dict.reviews.nameLabel}
                aria-label={dict.reviews.nameLabel}
              />

              <Input
                type="email"
                value={email}
                onChange={(e) => setEmail(e.target.value)}
                maxLength={EMAIL_MAX}
                disabled={status === "sending"}
                placeholder={dict.login.emailLabel}
                aria-label={dict.login.emailLabel}
              />

              {status === "success" && (
                <p role="status" className="flex items-center gap-1.5 text-xs text-foreground">
                  <Check className="h-3.5 w-3.5 shrink-0 text-accent" /> {t.sentConfirmation}
                </p>
              )}
              {error && (
                <p role="alert" className="text-xs text-destructive">
                  {FALLBACK_ERROR[lang]}
                </p>
              )}

              <div className="flex items-end justify-between gap-4 pt-1">
                <p className="text-[11px] leading-relaxed text-muted-foreground">{t.reachNote}</p>
                <Button
                  type="submit"
                  variant="accent"
                  size="icon"
                  aria-label={t.sendLabel}
                  disabled={status === "sending" || !message.trim()}
                  className="btn-sheen shrink-0"
                >
                  {status === "sending" ? (
                    <Loader2 className="h-4 w-4 animate-spin" />
                  ) : (
                    <Send className="h-4 w-4" />
                  )}
                </Button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
}
