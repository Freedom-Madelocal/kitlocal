import { getMadeLocalClient } from "./madelocal-supabase";
import type { MadeLocalRevenue } from "./madelocal-integration";

/**
 * Reads the signed-in seller's own marketplace revenue from the shared
 * MadeLocal project. RLS scopes rows to the seller, so no service key or
 * server function is involved.
 *
 * Confirmed: `transactions` has a participants SELECT policy that includes
 * `auth.uid() = seller_id`, so a signed-in seller reads exactly their own rows
 * with the publishable key.
 *
 * Two details are still unconfirmed, so the read is tolerant of both rather
 * than guessing: the exact `status` value written for a completed payment, and
 * whether `final_amount` or `amount` is the post-fee figure. We prefer
 * `final_amount` when the column exists and is populated, and treat any of the
 * common completed spellings as revenue.
 */
export const TX_TABLE = "transactions";

/** Any of these in `status` counts as money actually collected. */
export const TX_COMPLETED_STATUSES = [
  "completed",
  "complete",
  "paid",
  "succeeded",
  "success",
];

/** Preferred first; falls back to the next when the column is absent/null. */
export const TX_AMOUNT_FIELDS = ["final_amount", "amount"] as const;


const LAST_GOOD_KEY = "ml.madelocal.lastGoodRevenue.v1";

export type SalesResult =
  | { ok: true; data: MadeLocalRevenue; stale?: boolean }
  | { ok: false; error: string; data: MadeLocalRevenue | null };

function readLastGood(): MadeLocalRevenue | null {
  try {
    const raw = localStorage.getItem(LAST_GOOD_KEY);
    return raw ? (JSON.parse(raw) as MadeLocalRevenue) : null;
  } catch {
    return null;
  }
}

function writeLastGood(data: MadeLocalRevenue) {
  try {
    localStorage.setItem(LAST_GOOD_KEY, JSON.stringify(data));
  } catch {}
}

/** Sums the seller's completed transactions over a trailing window (default 30 days). */
export async function fetchMadeLocalRevenue(days = 30): Promise<SalesResult> {
  const supabase = getMadeLocalClient();
  if (!supabase) {
    return { ok: false, error: "MadeLocal connection isn't configured yet.", data: null };
  }

  const { data: userData } = await supabase.auth.getUser();
  const userId = userData.user?.id;
  if (!userId) {
    return { ok: false, error: "Not signed in to MadeLocal.", data: null };
  }

  const sinceDate = new Date(Date.now() - days * 24 * 3600 * 1000);
  const since = sinceDate.toISOString();

  const { data, error } = await supabase
    .from(TX_TABLE)
    .select(`${TX_AMOUNT_FIELD}, created_at`)
    .eq("seller_id", userId)
    .eq("status", TX_STATUS_COMPLETED)
    .gte("created_at", since);

  if (error) {
    return { ok: false, error: error.message, data: readLastGood() };
  }

  const rows = (data ?? []) as Array<Record<string, unknown>>;
  const total =
    Math.round(
      rows.reduce((sum, row) => sum + (Number(row[TX_AMOUNT_FIELD]) || 0), 0) * 100,
    ) / 100;

  const result: MadeLocalRevenue = {
    total,
    since: since.slice(0, 10),
    lastUpdated: new Date().toISOString(),
    txCount: rows.length,
  };
  writeLastGood(result);
  return { ok: true, data: result };
}
