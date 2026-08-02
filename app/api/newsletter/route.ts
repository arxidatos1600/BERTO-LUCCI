import { NextRequest, NextResponse } from "next/server";
import { supabase } from "@/lib/supabase";
import { rateLimit, getClientIp, isSameOrigin } from "@/lib/rate-limit";

export const runtime = "nodejs";

interface NewsletterPostBody {
  email?: unknown;
  locale?: unknown;
}

// Same shape as the DB CHECK constraint on newsletter_signups.email.
const EMAIL_RE = /^[^@\s]+@[^@\s]+\.[^@\s]+$/;

// Postgres unique_violation — thrown when the email already exists.
const UNIQUE_VIOLATION = "23505";

/** POST /api/newsletter — subscribe an email address. */
export async function POST(request: NextRequest) {
  if (!isSameOrigin(request)) {
    return NextResponse.json({ error: "Invalid origin." }, { status: 403 });
  }

  const ip = getClientIp(request);
  const { allowed } = rateLimit(`newsletter:post:${ip}`, 5, 60_000);
  if (!allowed) {
    return NextResponse.json(
      { error: "Too many requests. Please try again shortly." },
      { status: 429 }
    );
  }

  let body: NewsletterPostBody;
  try {
    body = await request.json();
  } catch {
    return NextResponse.json({ error: "Invalid JSON body." }, { status: 400 });
  }

  // Normalised to lower case so "Foo@x.com" and "foo@x.com" dedupe as the
  // same subscriber against the DB's unique constraint.
  const email = typeof body.email === "string" ? body.email.trim().toLowerCase() : "";
  const locale = typeof body.locale === "string" && body.locale.trim() ? body.locale.trim() : null;

  if (!email || !EMAIL_RE.test(email)) {
    return NextResponse.json({ error: "A valid email address is required." }, { status: 400 });
  }

  try {
    // Raw table INSERT is no longer possible for anon (see the
    // harden_public_write_rls_with_security_definer_rpcs migration) — this
    // RPC is the only write path left. Args are p_-prefixed to match the
    // Postgres function's parameter names exactly.
    const { error } = await supabase.rpc("submit_newsletter_signup", {
      p_email: email,
      p_locale: locale,
      p_client_ip: ip,
    });

    if (error && error.code !== UNIQUE_VIOLATION) {
      // DB-level rate limit tripped — bounds a direct caller too, not just
      // requests that go through the in-memory limiter above.
      if (error.code === "RLIMT") {
        return NextResponse.json(
          { error: "Too many requests. Please try again shortly." },
          { status: 429 }
        );
      }
      throw error;
    }

    // Either just inserted, or already subscribed (unique violation) — both
    // read as success to the caller so resubscribing never errors the form.
    return NextResponse.json({ success: true });
  } catch (err) {
    console.error("[api/newsletter:POST] failed to save signup", { err });
    return NextResponse.json(
      { error: "Could not sign you up right now. Please try again." },
      { status: 500 }
    );
  }
}
