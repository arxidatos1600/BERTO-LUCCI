import { createClient } from "@supabase/supabase-js";

/**
 * Shared Supabase client for the storefront's backend features (reviews,
 * newsletter, chat). Uses the public anon/publishable key — safe to expose
 * to the client, since this key can no longer write to those 3 tables at
 * all (anon/authenticated hold zero raw table grants on them). Writes go
 * exclusively through SECURITY DEFINER RPCs (submit_review,
 * submit_chat_message, submit_newsletter_signup — see the
 * harden_public_write_rls_with_security_definer_rpcs migration), which
 * also enforce a DB-level rate limit no direct caller can route around.
 * Never import the service_role key here; it must stay server-only and
 * out of this file entirely.
 */
export const supabase = createClient(
  process.env.NEXT_PUBLIC_SUPABASE_URL!,
  process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY!
);
