import { NextRequest, NextResponse } from "next/server";
import { supabase } from "@/lib/supabase";
import { rateLimit, getClientIp, isSameOrigin } from "@/lib/rate-limit";

export const runtime = "nodejs";

interface ReviewPostBody {
  productHandle?: unknown;
  authorName?: unknown;
  rating?: unknown;
  title?: unknown;
  body?: unknown;
  hp?: unknown;
}

interface ReviewRecord {
  id: string;
  productHandle: string;
  authorName: string;
  rating: number;
  title: string | null;
  body: string;
  createdAt: string;
}

// Raw row shape returned by the submit_review RPC (setof reviews, so it also
// carries `approved` — unused here). supabase-js can't infer this without a
// generated Database type on the client, so it comes back as `unknown`;
// cast through this instead of widening with `any`.
interface SubmitReviewRow {
  id: string;
  product_handle: string;
  author_name: string;
  rating: number;
  title: string | null;
  body: string;
  approved: boolean;
  created_at: string;
}

type RatingDistribution = Record<1 | 2 | 3 | 4 | 5, number>;

const RATING_MIN = 1;
const RATING_MAX = 5;
const AUTHOR_NAME_MAX = 80;
const TITLE_MAX = 120;
const BODY_MAX = 2000;

function emptyDistribution(): RatingDistribution {
  return { 1: 0, 2: 0, 3: 0, 4: 0, 5: 0 };
}

/** GET /api/reviews?handle=<product-handle> — approved reviews + aggregate rating. */
export async function GET(request: NextRequest) {
  const handle = request.nextUrl.searchParams.get("handle")?.trim();

  if (!handle) {
    return NextResponse.json(
      { error: "Missing required query parameter: handle" },
      { status: 400 }
    );
  }

  try {
    const { data, error } = await supabase
      .from("reviews")
      .select("id, product_handle, author_name, rating, title, body, created_at")
      .eq("product_handle", handle)
      .eq("approved", true)
      .order("created_at", { ascending: false });

    if (error) throw error;

    const rows = data ?? [];
    const distribution = emptyDistribution();
    let sum = 0;

    for (const row of rows) {
      const rating = row.rating as number;
      sum += rating;
      if (rating === 1 || rating === 2 || rating === 3 || rating === 4 || rating === 5) {
        distribution[rating] += 1;
      }
    }

    const count = rows.length;
    const average = count > 0 ? Math.round((sum / count) * 10) / 10 : 0;

    const reviews: ReviewRecord[] = rows.map((row) => ({
      id: row.id,
      productHandle: row.product_handle,
      authorName: row.author_name,
      rating: row.rating,
      title: row.title,
      body: row.body,
      createdAt: row.created_at,
    }));

    return NextResponse.json({
      reviews,
      aggregate: { average, count, distribution },
    });
  } catch (err) {
    console.error("[api/reviews:GET] failed to load reviews", { handle, err });
    return NextResponse.json(
      { error: "Could not load reviews right now. Please try again." },
      { status: 500 }
    );
  }
}

/** POST /api/reviews — submit a review for a product. */
export async function POST(request: NextRequest) {
  if (!isSameOrigin(request)) {
    return NextResponse.json({ error: "Invalid origin." }, { status: 403 });
  }

  const ip = getClientIp(request);
  const { allowed } = rateLimit(`reviews:post:${ip}`, 5, 60_000);
  if (!allowed) {
    return NextResponse.json(
      { error: "Too many requests. Please try again shortly." },
      { status: 429 }
    );
  }

  let body: ReviewPostBody;
  try {
    body = await request.json();
  } catch {
    return NextResponse.json({ error: "Invalid JSON body." }, { status: 400 });
  }

  // Honeypot: real visitors never fill this hidden field. Fake success, skip the insert.
  if (typeof body.hp === "string" && body.hp.trim().length > 0) {
    return NextResponse.json({ success: true });
  }

  const productHandle = typeof body.productHandle === "string" ? body.productHandle.trim() : "";
  const authorName = typeof body.authorName === "string" ? body.authorName.trim() : "";
  const rating = body.rating;
  const title = typeof body.title === "string" ? body.title.trim() : undefined;
  const reviewBody = typeof body.body === "string" ? body.body.trim() : "";

  if (!productHandle) {
    return NextResponse.json({ error: "Missing productHandle." }, { status: 400 });
  }
  if (!authorName || authorName.length > AUTHOR_NAME_MAX) {
    return NextResponse.json(
      { error: `authorName is required and must be at most ${AUTHOR_NAME_MAX} characters.` },
      { status: 400 }
    );
  }
  if (
    typeof rating !== "number" ||
    !Number.isInteger(rating) ||
    rating < RATING_MIN ||
    rating > RATING_MAX
  ) {
    return NextResponse.json(
      { error: "rating must be an integer between 1 and 5." },
      { status: 400 }
    );
  }
  if (title !== undefined && title.length > TITLE_MAX) {
    return NextResponse.json(
      { error: `title must be at most ${TITLE_MAX} characters.` },
      { status: 400 }
    );
  }
  if (!reviewBody || reviewBody.length > BODY_MAX) {
    return NextResponse.json(
      { error: `body is required and must be at most ${BODY_MAX} characters.` },
      { status: 400 }
    );
  }

  try {
    // Raw table INSERT is no longer possible for anon (see the
    // harden_public_write_rls_with_security_definer_rpcs migration) — this
    // RPC is the only write path left, and it hardcodes approved = false
    // itself as a second, caller-proof guarantee on top of this route's
    // own validation. Args are p_-prefixed to match the Postgres function's
    // parameter names exactly (required to avoid a plpgsql ambiguity
    // between the parameter names and the table's own column names).
    const { data, error } = await supabase
      .rpc("submit_review", {
        p_product_handle: productHandle,
        p_author_name: authorName,
        p_rating: rating,
        p_title: title || null,
        p_body: reviewBody,
        p_client_ip: ip,
      })
      .single();

    if (error) {
      // DB-level rate limit tripped — a real, shared bound a direct caller
      // (bypassing this route entirely) can't route around, unlike the
      // in-memory limiter above.
      if (error.code === "RLIMT") {
        return NextResponse.json(
          { error: "Too many requests. Please try again shortly." },
          { status: 429 }
        );
      }
      throw error;
    }

    const row = data as SubmitReviewRow;
    const review: ReviewRecord = {
      id: row.id,
      productHandle: row.product_handle,
      authorName: row.author_name,
      rating: row.rating,
      title: row.title,
      body: row.body,
      createdAt: row.created_at,
    };

    return NextResponse.json({ success: true, review });
  } catch (err) {
    console.error("[api/reviews:POST] failed to insert review", { productHandle, err });
    return NextResponse.json(
      { error: "Could not submit your review right now. Please try again." },
      { status: 500 }
    );
  }
}
