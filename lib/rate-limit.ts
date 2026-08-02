/**
 * Hardening helpers shared by the public write endpoints (reviews,
 * newsletter, chat POST routes): a rate limiter and an origin check.
 * Defense-in-depth against naive bot abuse, layered on top of the honeypot
 * field and the DB CHECK constraints.
 *
 * The rate limiter is best-effort only: counters live per serverless-instance
 * (reset on cold start, not shared across regions or concurrent instances).
 * That is enough to blunt a simple flood from one client, but is not a hard
 * guarantee. If traffic grows enough to need one, swap this for a shared
 * store (Upstash Redis, Vercel KV) — same call sites, new implementation.
 */

interface Bucket {
  count: number;
  resetAt: number;
}

const buckets = new Map<string, Bucket>();

// Prevents unbounded memory growth on a long-lived warm instance.
const MAX_TRACKED_KEYS = 5000;

export interface RateLimitResult {
  allowed: boolean;
  remaining: number;
}

/** Fixed-window limiter: `limit` requests per `windowMs` per key. */
export function rateLimit(key: string, limit = 5, windowMs = 60_000): RateLimitResult {
  const now = Date.now();
  const existing = buckets.get(key);

  if (!existing || existing.resetAt <= now) {
    if (buckets.size >= MAX_TRACKED_KEYS) buckets.clear();
    buckets.set(key, { count: 1, resetAt: now + windowMs });
    return { allowed: true, remaining: limit - 1 };
  }

  if (existing.count >= limit) {
    return { allowed: false, remaining: 0 };
  }

  existing.count += 1;
  return { allowed: true, remaining: limit - existing.count };
}

/**
 * Best-effort client IP from the standard proxy header Vercel sets.
 *
 * Uses the LAST entry in `x-forwarded-for`, not the first: each hop in a
 * proxy chain appends the IP it saw the request arrive from, so the final
 * entry is the one Vercel's own edge observed directly. The first entry (or
 * any earlier one) can be set by the client itself in the original request
 * and is not trustworthy for rate-limiting. Re-verify this against Vercel's
 * current documented proxy behavior once this is actually deployed.
 */
export function getClientIp(request: Request): string {
  const forwarded = request.headers.get("x-forwarded-for");
  if (forwarded) {
    const hops = forwarded.split(",").map((h) => h.trim()).filter(Boolean);
    if (hops.length > 0) return hops[hops.length - 1]!;
  }
  return request.headers.get("x-real-ip") ?? "unknown";
}

/**
 * Rejects a request whose `Origin` header, when present, doesn't match this
 * site's own origin — blocks plain cross-site `<form>`/`fetch` abuse of these
 * public endpoints. Requests with no Origin header (same-site navigations,
 * some non-browser clients) are allowed through: this is a coarse filter,
 * not a CSRF token, and there's no session cookie on these routes for a
 * token to protect in the first place.
 */
export function isSameOrigin(request: Request): boolean {
  const origin = request.headers.get("origin");
  if (!origin) return true;
  try {
    return new URL(origin).host === new URL(request.url).host;
  } catch {
    return false;
  }
}
