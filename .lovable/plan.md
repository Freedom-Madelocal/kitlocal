# Wire option A: shared backend, two frontends

Decision: keep one MadeLocal backend behind both apps. kitlocal authenticates against it and reads the seller's own `transactions` rows under RLS. No OAuth server, no second identity mapping, no service-role key.

The client code for this already exists in kitlocal (`madelocal-supabase.ts`, `madelocal-session.ts`, `madelocal-sales.ts`, `/auth`). It is dormant only because the two connection values are not set. This plan turns it on and tests it.

## Steps

### 1. Add the two connection values
From MadeLocal's environment config (not from here), copy:
- backend URL → `VITE_MADELOCAL_SUPABASE_URL`
- publishable/anon key → `VITE_MADELOCAL_SUPABASE_ANON_KEY`

Both are public by design and belong in the app environment. With them present, `isMadeLocalConfigured` flips true, `MADELOCAL_LIVE` turns on, the "Simulate connection" affordance disappears, and MadeLocal's status becomes session-derived.

### 2. Confirm the three data facts
`madelocal-sales.ts` currently assumes `status = "completed"` and `final_amount`. Verify against the live database and correct if needed:
- the `status` value written for a completed Stripe payment
- that a seller-side `SELECT` policy exists on `transactions` (`seller_id = auth.uid()`) — without it every read returns zero rows and the card will show $0.00 rather than an error
- `amount` vs `final_amount` as the post-fee figure

If the seller-side policy is missing, that is a change in the MadeLocal project, not here. It is the one blocker that kitlocal cannot work around.

### 3. Signup metadata parity
MadeLocal requires `full_name` in signup metadata. kitlocal does not create accounts — sign-up stays on MadeLocal — so nothing to add. `displayNameFor()` already prefers `business_name`, then `full_name`, then email.

### 4. Test pass in a real browser
Sign in on the preview with the real MadeLocal account, then confirm:
- header shows the MadeLocal display name with a working Sign out
- the MadeLocal revenue source reads Connected, not "Sign in with MadeLocal"
- the revenue figure matches the MadeLocal dashboard for the same 30-day window
- sign out drops the source back to disconnected and clears the figure

If the sum is off, it is step 2's field/status assumption — corrected there, not by patching the UI.

### 5. Domain cutover
- Point `kit.buymadelocal.com` at this project and publish.
- Add `https://kit.buymadelocal.com` to the MadeLocal project's auth redirect allow-list.
- On the MadeLocal side (separate change): switch its client to the same `.buymadelocal.com` cookie session storage and add the "Open Command Center" button on the seller profile. Once both write the shared cookie, the seller crosses over already signed in and the `/auth` form becomes a fallback only.

## Also fixing

A hydration warning from `new Date()` evaluated during render in the calendar/mock data. Moves the time-dependent read behind hydration so the console is clean for the auth test.

## Technical notes

- Reads are client-side through the user's own session under RLS. No server functions, no admin client, no Edge Functions.
- No `_authenticated/` gate: kitlocal stays one view, and a signed-out visitor still sees the demo with an inline sign-in prompt where it matters.
- `/auth/handoff` stays an inert stub in case the shared cookie hits a snag on the real subdomains.

## What I need from you

The backend URL and publishable key, pasted in chat. The three data confirmations can follow — I will wire and test with the current assumptions and correct them when you have the answers.
