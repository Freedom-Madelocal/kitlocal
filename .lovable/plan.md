# Finish shared auth and sign in with a MadeLocal user

Goal: sign into kitlocal with your real MadeLocal account, confirm the session is the same identity MadeLocal uses, and read your own revenue rows.

Important constraint: kitlocal has no backend wiring at all today (no Supabase client, no auth files, no session code). The MadeLocal Supabase project is not created by Lovable Cloud — so instead of enabling Cloud (which would make a brand-new, empty database), kitlocal connects directly to the existing MadeLocal project. That keeps one user table, one session, one source of sales truth.

## What gets built

### 1. Client for the shared MadeLocal project
- Install `@supabase/supabase-js`.
- `src/lib/madelocal-supabase.ts` — a browser client pointed at the MadeLocal project URL + publishable (anon) key, with session persistence.
- Session storage is configured as a cookie scoped to `.buymadelocal.com` (Secure, SameSite=Lax, path `/`) instead of localStorage. This is the piece that makes Mechanism 1 work: once kitlocal is served from `kit.buymadelocal.com`, a session created on `app.buymadelocal.com` is already present here, with no redirect or code exchange.
- On the lovable.app preview the cookie domain silently falls back to host-only, so preview still works — it just won't inherit the MadeLocal session. That's expected, and why step 2 exists.

### 2. Sign-in route for testing (`/auth`)
- Email + password form authenticating against the shared MadeLocal project, so you can enter kitlocal as your real MadeLocal user today, on preview, before DNS is done.
- On success: redirect to `/`. Errors render inline (wrong password, unconfirmed email, network).
- A small "Signed in as <email> · Sign out" affordance in the header, driven by the live session — not a static label.

### 3. Session plumbing
- One `onAuthStateChange` subscriber in `__root.tsx` that invalidates the router on identity changes only (`SIGNED_IN` / `SIGNED_OUT` / `USER_UPDATED`).
- `useMadeLocalSession()` hook exposing `{ user, loading }`.
- The MadeLocal revenue source stops being a "Simulate connection" toggle: its status is now derived from the real session. Signed in = connected. Signed out = "Sign in with MadeLocal".

### 4. Real revenue read
Once you paste the three answers, `src/lib/madelocal-sales.ts` reads your own rows directly through the authenticated client (RLS scopes it to you):
`from("transactions").select("<amount field>, created_at").eq("seller_id", user.id).eq("status", "<confirmed value>")`, summed per period and fed into `useMadeLocalRevenue()` — same return shape, so `RevenueSources` and `ProfitSummary` need no further change. `MADELOCAL_LIVE` flips to `true`; the simulate affordance is deleted.

Last-good value is cached so a transient database blip shows the previous number with a stale marker rather than a blank card.

### 5. Domain cutover (Mechanism 1)
- Point `kit.buymadelocal.com` at kitlocal in project settings and publish.
- Add `https://kit.buymadelocal.com` to the MadeLocal project's Auth redirect allow-list.
- In the MadeLocal repo (separate change, not this build): switch its Supabase client to the same `.buymadelocal.com` cookie storage, and add the "Open Command Center" button on the seller profile. Until MadeLocal also writes the shared cookie, the `/auth` form from step 2 stays as the entry path.

### 6. Test pass
Verified end to end in a real browser against the preview: sign in with your MadeLocal credentials, confirm the header shows your account, confirm the MadeLocal source reads Connected, confirm the revenue figure matches what your MadeLocal dashboard shows for the same window, then sign out and confirm the source drops back to disconnected and no revenue rows leak.

## What I need from you

1. The MadeLocal project **URL and publishable/anon key** (both are already public in the madelocal repo — paste them in chat, no secure form needed).
2. The three confirmations: `transactions.status` value for a Stripe-completed order; whether a seller-side `SELECT` policy (`seller_id = auth.uid()`) exists on `transactions`; `amount` vs `final_amount`.
3. Confirmation that your MadeLocal login is email/password (if your account was created via Google sign-in, the form in step 2 won't work for you and we go straight to the handoff route instead).

## Technical notes

- No Lovable Cloud enablement, no service-role key, no Edge Functions. All reads are client-side through the user's own session under RLS, which is both simpler and safer here.
- No `_authenticated/` gate is added: kitlocal stays a single-view app and the sign-in prompt renders inline where it matters, so a signed-out visitor still sees the demo instead of being bounced.
- `/auth/handoff` stays as an inert stub. If the cookie approach hits a snag on the real subdomains, Mechanism 2 is still available without a routing change.

## Files

- `src/lib/madelocal-supabase.ts` (new), `src/lib/madelocal-session.ts` (new), `src/lib/madelocal-sales.ts` (new, step 4)
- `src/routes/auth/index.tsx` (new), `src/routes/__root.tsx` (edit)
- `src/lib/madelocal-integration.ts` (edit — session-driven status, live revenue)
- `src/components/layout/Header.tsx`, `src/components/expenses/RevenueSources.tsx` (edit)
