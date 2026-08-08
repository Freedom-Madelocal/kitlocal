# Social Inbox — Feasibility and Requirements (no build yet)

Answer: yes for Instagram and Facebook Pages, partly for TikTok. The blockers are not
code — they are platform approval, business verification, and per-seller token custody.

## What each platform actually allows

| Platform | Read comments | Reply to comments | Read DMs | Reply to DMs | Gate |
| --- | --- | --- | --- | --- | --- |
| Instagram (professional account) | Yes | Yes | Yes | Yes, 7-day window after the user's last message | Meta app review + business verification |
| Facebook Page | Yes | Yes | Yes (Messenger) | Yes, 7-day window | Same Meta app review |
| TikTok | Only with audited API access | Only with audited access | No public API | No | TikTok audit; DMs never |

Key limits to design around:
- **Instagram requires a professional (Business or Creator) account.** Personal accounts
  have no messaging or comment API at all. Many market sellers are on personal accounts,
  so the connect flow must detect this and tell them how to switch.
- **The 7-day reply window** is a hard Meta rule. Sellers can reply to a DM only within
  7 days of the buyer's most recent message. Past that, the reply fails and the UI must
  say why rather than showing a silent error.
- **TikTok has no DM API, publicly or privately.** No amount of approval unlocks it.
  Treat TikTok as comments-only, and only after audit — ship it as a visible
  "coming soon" tile so sellers don't think the feature is broken.
- Neither Meta nor TikTok offers a per-user connector in this workspace, so the OAuth
  app, consent flow, and per-seller token storage are ours to build and maintain.

## What you have to do outside the code

These are the real timeline, and none of them can be shortcut:

1. **Create one Meta developer app** covering both Instagram and Facebook Page.
2. **Complete Meta Business Verification** for the MadeLocal legal entity (company
   documents, domain verification). Typically a few days, sometimes longer.
3. **Pass Meta App Review** for the advanced permissions: Instagram comment and
   message management, Page engagement, and Page messaging. Review requires a screen
   recording of the real flow, a written use-case description, and a privacy policy and
   data-deletion URL on the app's domain. Expect one or two rejection rounds; plan
   two to four weeks from submission.
4. **Apply for TikTok API access** separately, for comment management only.
5. **Publish a privacy policy and data-deletion endpoint.** Meta requires both, and
   the deletion endpoint must actually delete the seller's stored tokens and cached
   messages on request.

Until step 3 clears, only accounts you add as testers on the Meta app can connect. That
is enough to demo the real flow to MadeLocal, but not to onboard sellers.

## What we build, when you give the word

Chosen: connections live in a **separate Command Center backend**, so social tokens never
touch the MadeLocal database. That means enabling a backend for this app before any live
wiring.

**Phase 1 — Inbox on mock data (no approvals needed).** A fourth tab, Inbox, alongside
Marketing, Calendar, and Expenses. Unified stream of comments and DMs across platforms,
platform filter chips, unread count, a reply box inline on each thread, and a Connections
setup screen with one tile per platform showing connected or not-connected state. Built in
the existing neumorphic style. This is fully demoable and doubles as the screen recording
Meta's review requires.

**Phase 2 — Live Instagram and Facebook.** Meta OAuth connect flow, encrypted per-seller
token storage, webhook endpoint so new comments and DMs arrive without polling, and real
send-reply calls. Gated on approvals from the list above.

**Phase 3 — TikTok comments.** Only if audit access is granted; the tile stays
"coming soon" until then.

## Technical notes

- Tokens are stored server-side only, encrypted at rest, in tables with row-level
  security scoped to the seller. No provider token ever reaches the browser.
- All provider calls run in server functions; replies go out server-side so tokens are
  never exposed to client code.
- Meta webhooks land on a public endpoint under `api/public/` with signature verification
  before any write, so unverified callers cannot inject fake messages.
- Long-lived Page tokens still need periodic refresh; a scheduled refresh job prevents
  connections silently dying after ~60 days.
- Message and comment bodies are cached locally so the inbox loads fast and survives a
  provider outage, with a retention window rather than storing buyer conversations forever.
- Rate limits are per Page and per app; the sync job needs backoff so one busy seller
  doesn't degrade everyone.

## Honest cost read

Phase 1 is straightforward. Phase 2 is the largest single piece of work in this project
so far — OAuth custody, webhooks, token refresh, and reply-window edge cases — plus the
approval calendar you don't control. If the goal is to show MadeLocal that this is
credible, Phase 1 alone does that, and it's also the artifact Meta will ask for.

## Recommendation

Start Phase 1 only. Submit the Meta app for verification in parallel, using the Phase 1
build as the review recording. Decide on Phase 2 once verification clears.
