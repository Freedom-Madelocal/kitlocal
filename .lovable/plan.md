# MadeLocal integration — build plan (mock-first UI, live wiring gated)

CTO's clarifications accepted. Corrections baked in: `transactions` table (not `sales`/`orders`), `get-seller-analytics` is engagement-only and won't be used for revenue, production domain is `buymadelocal.com` so we plan for Mechanism 1 on that root, and RevenueSources' `localStorage` architecture needs a real state upgrade for the MadeLocal chip. This plan follows the CTO's 8-step sequence and only executes steps 1–3 in this build; steps 4–8 are queued behind three confirmations.

## Scope of THIS build (steps 1–3, mock-first, no live data)

Everything here ships behind a feature flag and preserves today's demo. No Supabase enablement in this repo yet, no secrets requested yet, no server code that assumes a live `transactions` schema.

### 1. Feature flag + connection state model

- `src/lib/madelocal-integration.ts` — single source of truth:
  - `MADELOCAL_LIVE = false` constant (flip to `true` when creds land).
  - Types: `MadeLocalConnectionStatus = "disconnected" | "connecting" | "connected" | "error"`.
  - Mock adapter: `getMockMadeLocalRevenue()` returns `{ total, since, lastUpdated, txCount }` derived from `mock-data.ts` so the UI has believable numbers immediately.
  - `useMadeLocalRevenue()` hook — reads mock today, will switch to a `createServerFn` query in step 7. Same return shape either way, so components never change again.

### 2. RevenueSources: promote MadeLocal from manual chip to connected source

Change `src/components/expenses/RevenueSources.tsx`:
- MadeLocal preset becomes a **special-case source**, not a normal chip. When present it renders a distinct "connected source" row above the manual chips.
- The row shows: MadeLocal wordmark/icon, connection status pill (Not connected / Connected / Syncing / Error), the current period total, "Last updated Xm ago", and either a **Connect MadeLocal** button (disconnected) or a **Refresh** / **Disconnect** menu (connected).
- Manual "Log revenue" form disables the MadeLocal option in the source dropdown with helper text: "MadeLocal revenue is pulled from your account automatically."
- Existing localStorage-backed `RevenueEntry` records tagged to MadeLocal are preserved but marked read-only and clearly labeled "Manual (legacy)" — no data loss, no confusion.
- `onTotalChange` still fires a single number to `ExpensesView`, but its internals now sum: manual entries (localStorage, unchanged) + `useMadeLocalRevenue().total` (mock today).

While `MADELOCAL_LIVE = false`, the Connect button opens a small dialog that says "Coming soon — connects to your MadeLocal seller account" and offers a **Simulate connection** toggle so the connected-state UI is reviewable now.

### 3. ProfitSummary: accept MadeLocal server total as a distinct input

Change `src/components/expenses/ProfitSummary.tsx`:
- New prop `madeLocalRevenue?: number` (separate from `addedRevenue`).
- Compute: `revenue = marketRevenue + addedRevenue + madeLocalRevenue`.
- Add a one-line breakdown under the headline: "Markets · Manual sources · MadeLocal" with each subtotal, so it is obvious where the number comes from and where MadeLocal will start plugging in.
- `ExpensesView` passes both values in.

### 4. Handoff scaffolding (UI only, no cookies yet)

- `src/routes/auth/handoff.tsx` — server route stub that reads a `?code=` param and today just logs + redirects to `/`. Wired in but inert. Adding it now avoids a late routing change and keeps Mechanism 2 available if the domain plan slips.
- No Supabase client wired, no session code. Documented TODO block referencing the CTO's 8-step sequence.

### 5. What is NOT in this build

Deferred to a follow-up plan behind the three CTO gates:
- Enabling Lovable Cloud / connecting to the existing MadeLocal Supabase project.
- Writing `getMySales()` against `transactions`.
- Cookie-domain configuration on `.buymadelocal.com`.
- The "Open Command Center" button in the madelocal repo (that PR lives in the other codebase).
- Removing the feature flag.

## Confirmations required before steps 4–8

I will not start those until you paste back:

1. `transactions.status` value for a Stripe-completed order (`completed`? `paid`? `succeeded`?). Also confirm whether cash orders should count and at what status.
2. RLS on `transactions`: is there a `SELECT` policy of the shape `seller_id = auth.uid()`? If only buyer-side policies exist today, MadeLocal will need to add the seller-side one before kitlocal can read anything.
3. Revenue field: `amount` (gross) or `final_amount` (post-platform-fee)? Which one should feed "true profit"? My recommendation is `final_amount` so kitlocal shows what the seller actually received, but call it.

Two smaller ones while you're in the dashboard:

4. Is `transactions.seller_id` indexed? A seller list without an index will be slow once volume grows; adding one is a one-line migration on the MadeLocal side.
5. Any soft-delete / refund columns (`refunded_at`, `voided`) we should exclude from the sum?

## Follow-up build (step 4–8, drafted for approval later)

For visibility, not for execution now:

- Enable Lovable Cloud on kitlocal **pointed at the existing MadeLocal project ref `kygqkcnrxxsauibhlvno`** (URL + publishable key are public; service role via secure secret form).
- Configure both apps' Supabase clients to persist session in a cookie scoped to `.buymadelocal.com` (`Secure`, `SameSite=Lax`). kitlocal lives at e.g. `kit.buymadelocal.com`, madelocal at `app.buymadelocal.com`.
- `src/lib/madelocal-sales.functions.ts` → `getMySales({ since, until })` — `createServerFn` + `requireSupabaseAuth`, `context.supabase.from("transactions").select("final_amount, created_at").eq("seller_id", context.userId).eq("status", <confirmed>)`.
- Swap `useMadeLocalRevenue()` from mock adapter to the server fn via TanStack Query with a stale time + last-good fallback so a Supabase blip shows the previous number with a stale badge instead of a blank card.
- Delete the "Simulate connection" affordance, flip `MADELOCAL_LIVE = true`.
- MadeLocal-side PR (separate repo, not in this build): add the "Open Command Center" button on Profile, switch the Supabase client to domain-scoped cookie storage, add kitlocal origin to Auth redirect allow-list.

## Files this build touches

- `src/lib/madelocal-integration.ts` (new)
- `src/components/expenses/RevenueSources.tsx` (edit — connected MadeLocal row, disable in manual dropdown, preserve legacy entries)
- `src/components/expenses/ProfitSummary.tsx` (edit — new prop + breakdown line)
- `src/components/expenses/ExpensesView.tsx` (edit — thread MadeLocal total through)
- `src/routes/auth/handoff.tsx` (new — inert stub)
- No changes to routing gates, no `_authenticated/` layout, no Supabase files.

Ready to build steps 1–3 on your go-ahead. Confirmations 1–3 can come after — they only block the follow-up build.
