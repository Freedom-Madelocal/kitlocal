# MadeLocal Seller Command Center — Build Plan

A mobile-first, neumorphic dashboard for local food producers with three feature tabs, powered entirely by mock data (no backend needed).

## Design System

Update `src/styles.css` with the warm, grounded palette:
- `--background`: warm cream `#fdfbf7`
- `--primary`: deep forest green `#1b4332`
- `--accent`: amber `#d97706`
- `--foreground`: slate
- Neumorphic tokens: `--shadow-neu` (dual light/dark drop shadows), `--shadow-neu-inset`, `--shadow-neu-sm`
- `Inter` (body) + `Fraunces` (display) via `<link>` in `__root.tsx`
- Add `@utility neu-card`, `neu-inset`, `neu-pressable` for reusable neumorphic surfaces

## Routes

Single dashboard route with tab-based navigation (tabs preserve state in URL search param `?tab=`):
- `src/routes/index.tsx` — replaces placeholder, renders the dashboard shell
- Header component: seller profile switcher ("Wildflower Sourdough Co." dropdown with 2-3 mock sellers) + quick action buttons (New Post, Add Expense)
- Desktop: left icon sidebar. Mobile: bottom nav bar. Both neumorphic.
- Update `__root.tsx` head metadata (title/description/og — app-specific, no more "Lovable App")

## Feature 1: Marketing Hub (`src/components/marketing/`)

- `PostAnalyzer.tsx` — Input for URL or draft text + "Analyze Post" button. On click, simulates analysis (setTimeout ~800ms) and renders:
- `ReportCard.tsx` — Hook Score gauge (e.g., 85/100), Engagement Potential badge, two columns: Key Positives (green checks) and Missed Opportunities (amber alerts). Mock analysis picks from preset responses.
- `ContentNudges.tsx` — Widget listing AI-suggested nudges tied to upcoming markets from mock calendar data. Each nudge has a "One-Click Draft Post" button that opens a Dialog showing generated caption + hashtags with a Copy button.

## Feature 2: Market Calendar (`src/components/calendar/`)

- `MarketCalendar.tsx` — Weekly/monthly toggle. Monthly = grid with market chips on event days; Weekly = agenda list. Uses `date-fns` (already common in shadcn) — install if missing.
- `MarketDetailDrawer.tsx` — Shadcn Sheet opens on market click, contains three sections:
  - **Historical Sales Recap** — small table of last visit's item sales + revenue
  - **Smart Prep Estimator** — item list with suggested quantities, weather badge (e.g., "☀️ 72°F, sunny — +10% demand"), editable inputs
  - **Quick-Comms** — Tabs for Email/SMS, pre-filled templates (electricity request, late arrival, booth check) with To/Subject/Body pre-populated
- Mock data: 6-8 markets across next 4 weeks (Downtown Farmers Market, Riverside Pop-up, etc.)

## Feature 3: Expenses & Profit (`src/components/expenses/`)

- `ReceiptDropzone.tsx` — Drag-drop area (visual only; accepts file, shows filename, simulates OCR)
- `LineItemAllocator.tsx` — Table of extracted items with a toggle (Switch/SegmentedControl) per row: **COGS** vs **Overhead**. Running totals update live.
- `ProfitSummary.tsx` — Card with Total Revenue, Total COGS, Overhead, Net Profit ($ + margin %). Uses mock revenue from calendar sales + user's allocations.
- `ExpenseHistory.tsx` — Recent receipts table

## Mock Data (`src/lib/mock-data.ts`)

Single source with:
- `sellers` (3 profiles)
- `markets` (upcoming + past with sales history)
- `posts` (sample analyses)
- `receipts` (sample OCR line items)
- `weather` (per-market forecast)

## Technical Details

- All UI state via React state / URL search params — no persistence needed
- Uses existing shadcn: Tabs, Card, Dialog, Sheet, Badge, Button, Input, Table, Switch, Dropdown, Progress
- Fonts loaded via `<link>` in `__root.tsx` head
- Fully responsive: sidebar collapses to bottom nav <768px; drawers become full-screen on mobile
- No backend, no Lovable Cloud — pure frontend with mock data

## File Additions
```
src/routes/index.tsx                       (rewrite)
src/routes/__root.tsx                       (head metadata + fonts)
src/styles.css                              (palette + neumorphic tokens/utilities)
src/lib/mock-data.ts
src/components/layout/AppShell.tsx
src/components/layout/Header.tsx
src/components/layout/SideNav.tsx
src/components/layout/BottomNav.tsx
src/components/marketing/{PostAnalyzer,ReportCard,ContentNudges,DraftPostDialog}.tsx
src/components/calendar/{MarketCalendar,MarketDetailDrawer,PrepEstimator,QuickComms}.tsx
src/components/expenses/{ReceiptDropzone,LineItemAllocator,ProfitSummary,ExpenseHistory}.tsx
```
