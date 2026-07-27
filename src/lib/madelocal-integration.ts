import { useEffect, useState } from "react";
import { marketRevenueTotal } from "./mock-data";

/**
 * MadeLocal integration adapter.
 *
 * TODO (CTO 8-step sequence, steps 4–8) — do not enable until confirmed:
 *   1. `transactions.status` value for a Stripe-completed order
 *   2. RLS on `transactions` includes `seller_id = auth.uid()`
 *   3. `amount` vs `final_amount` for post-fee revenue
 *   4. `transactions.seller_id` is indexed
 *   5. refund/void columns to exclude
 *
 * When gates clear, swap `useMadeLocalRevenue` internals to call a
 * `createServerFn` (`getMySales`) against the shared Supabase project —
 * same return shape, so callers do not change.
 */

export const MADELOCAL_LIVE = false;

export type MadeLocalConnectionStatus =
  | "disconnected"
  | "connecting"
  | "connected"
  | "error";

export type MadeLocalRevenue = {
  total: number;
  since: string; // ISO date
  lastUpdated: string; // ISO datetime
  txCount: number;
};

const CONN_KEY = "ml.madelocal.connection.v1";

export function getStoredConnectionStatus(): MadeLocalConnectionStatus {
  try {
    const v = localStorage.getItem(CONN_KEY);
    if (v === "connected" || v === "connecting" || v === "error") return v;
  } catch {}
  return "disconnected";
}

export function setStoredConnectionStatus(s: MadeLocalConnectionStatus) {
  try {
    localStorage.setItem(CONN_KEY, s);
  } catch {}
}

export function getMockMadeLocalRevenue(): MadeLocalRevenue {
  // Believable figure derived from mock market data — ~28% of market sales
  // simulates online orders through the MadeLocal marketplace.
  const total = Math.round(marketRevenueTotal() * 0.28 * 100) / 100;
  const since = new Date(Date.now() - 30 * 24 * 3600 * 1000)
    .toISOString()
    .slice(0, 10);
  return {
    total,
    since,
    lastUpdated: new Date().toISOString(),
    txCount: 14,
  };
}

/**
 * Reads MadeLocal revenue for the signed-in seller.
 * Today: returns mock data when the user has "connected" (simulated).
 * Later: swaps to a `createServerFn` query against `transactions`.
 */
export function useMadeLocalRevenue(): {
  status: MadeLocalConnectionStatus;
  data: MadeLocalRevenue | null;
  connect: () => void;
  disconnect: () => void;
  refresh: () => void;
} {
  const [status, setStatus] = useState<MadeLocalConnectionStatus>(() =>
    getStoredConnectionStatus(),
  );
  const [data, setData] = useState<MadeLocalRevenue | null>(() =>
    getStoredConnectionStatus() === "connected" ? getMockMadeLocalRevenue() : null,
  );

  useEffect(() => {
    setStoredConnectionStatus(status);
    if (status === "connected") {
      setData(getMockMadeLocalRevenue());
    } else if (status === "disconnected") {
      setData(null);
    }
  }, [status]);

  return {
    status,
    data,
    connect: () => {
      setStatus("connecting");
      // Simulate handshake — in live mode this will kick off the shared-cookie
      // check or Mechanism 2 code exchange via /auth/handoff.
      setTimeout(() => setStatus("connected"), 700);
    },
    disconnect: () => setStatus("disconnected"),
    refresh: () => {
      if (status === "connected") setData(getMockMadeLocalRevenue());
    },
  };
}

export function formatRelative(iso: string): string {
  const diff = Date.now() - new Date(iso).getTime();
  const mins = Math.floor(diff / 60000);
  if (mins < 1) return "just now";
  if (mins < 60) return `${mins}m ago`;
  const hrs = Math.floor(mins / 60);
  if (hrs < 24) return `${hrs}h ago`;
  return `${Math.floor(hrs / 24)}d ago`;
}
