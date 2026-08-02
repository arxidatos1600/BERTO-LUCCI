import { NextRequest, NextResponse } from "next/server";
import { supabase } from "@/lib/supabase";
import { rateLimit, getClientIp, isSameOrigin } from "@/lib/rate-limit";

export const runtime = "nodejs";

interface ChatPostBody {
  name?: unknown;
  email?: unknown;
  message?: unknown;
  pageUrl?: unknown;
  productHandle?: unknown;
  locale?: unknown;
  hp?: unknown;
}

const NAME_MAX = 80;
const EMAIL_MAX = 200;
const MESSAGE_MAX = 2000;

/** POST /api/chat — a visitor message into the contact/chat inbox. */
export async function POST(request: NextRequest) {
  if (!isSameOrigin(request)) {
    return NextResponse.json({ error: "Invalid origin." }, { status: 403 });
  }

  const ip = getClientIp(request);
  const { allowed } = rateLimit(`chat:post:${ip}`, 5, 60_000);
  if (!allowed) {
    return NextResponse.json(
      { error: "Too many requests. Please try again shortly." },
      { status: 429 }
    );
  }

  let body: ChatPostBody;
  try {
    body = await request.json();
  } catch {
    return NextResponse.json({ error: "Invalid JSON body." }, { status: 400 });
  }

  // Honeypot: real visitors never fill this hidden field. Fake success, skip the insert.
  if (typeof body.hp === "string" && body.hp.trim().length > 0) {
    return NextResponse.json({ success: true });
  }

  const message = typeof body.message === "string" ? body.message.trim() : "";
  if (!message || message.length > MESSAGE_MAX) {
    return NextResponse.json(
      { error: `message is required and must be at most ${MESSAGE_MAX} characters.` },
      { status: 400 }
    );
  }

  const name = typeof body.name === "string" ? body.name.trim() : "";
  const email = typeof body.email === "string" ? body.email.trim() : "";
  const pageUrl = typeof body.pageUrl === "string" ? body.pageUrl.trim() : "";
  const productHandle = typeof body.productHandle === "string" ? body.productHandle.trim() : "";
  const locale = typeof body.locale === "string" ? body.locale.trim() : "";

  if (name.length > NAME_MAX) {
    return NextResponse.json(
      { error: `name must be at most ${NAME_MAX} characters.` },
      { status: 400 }
    );
  }
  if (email.length > EMAIL_MAX) {
    return NextResponse.json(
      { error: `email must be at most ${EMAIL_MAX} characters.` },
      { status: 400 }
    );
  }

  try {
    // Raw table INSERT is no longer possible for anon (see the
    // harden_public_write_rls_with_security_definer_rpcs migration) — this
    // RPC is the only write path left. Args are p_-prefixed to match the
    // Postgres function's parameter names exactly.
    const { error } = await supabase.rpc("submit_chat_message", {
      p_name: name || null,
      p_email: email || null,
      p_message: message,
      p_page_url: pageUrl || null,
      p_product_handle: productHandle || null,
      p_locale: locale || null,
      p_client_ip: ip,
    });

    if (error) {
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

    return NextResponse.json({ success: true });
  } catch (err) {
    console.error("[api/chat:POST] failed to save message", { err });
    return NextResponse.json(
      { error: "Could not send your message right now. Please try again." },
      { status: 500 }
    );
  }
}
