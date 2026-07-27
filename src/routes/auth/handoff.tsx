import { createFileRoute, redirect } from "@tanstack/react-router";

/**
 * MadeLocal → kitlocal handoff endpoint (Mechanism 2 stub).
 *
 * Inert today. When steps 4–8 of the CTO build sequence execute, this route
 * will:
 *   1. Read `?code=` from the query string.
 *   2. POST it to a Supabase Edge Function on the madelocal project
 *      (`redeem-handoff-code`) which returns a session `{ access_token, refresh_token }`.
 *   3. Call `supabase.auth.setSession(...)` and redirect to `/`.
 *
 * Mechanism 1 (shared cookie on `.buymadelocal.com`) is the preferred path
 * and skips this route entirely — the browser already has the session.
 */
export const Route = createFileRoute("/auth/handoff")({
  beforeLoad: ({ search }) => {
    const code = (search as Record<string, unknown>)?.code;
    if (typeof code === "string" && code.length > 0) {
      // eslint-disable-next-line no-console
      console.info("[madelocal handoff] received code (stub, not exchanged)", {
        len: code.length,
      });
    }
    throw redirect({ to: "/" });
  },
  component: () => null,
});
