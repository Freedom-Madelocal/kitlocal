import { useCallback, useEffect, useState } from "react";
import { marketRevenueTotal } from "./mock-data";
import { isMadeLocalConfigured } from "./madelocal-supabase";
import { useMadeLocalSession } from "./madelocal-session";
import { fetchMadeLocalRevenue } from "./madelocal-sales";

/**
 * MadeLocal integration adapter.
 *
 * Live mode is driven by whether the shared MadeLocal project credentials are
 * present (VITE_MADELOCAL_SUPABASE_URL / _ANON_KEY). With them set, connection
 * status is the real session and revenue comes from `transactions`. Without
 * them, the mock adapter keeps the demo interactive.
 */

export const MADELOCAL_LIVE = isMadeLocalConfigured;

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

export type MadeLocalRevenueState = {
  status: MadeLocalConnectionStatus;
  data: MadeLocalRevenue | null;
  live: boolean;
  stale: boolean;
  error: string | null;
  accountLabel: string | null;
  connect: () => void;
  disconnect: () => void;
  refresh: () => void;
};

/**
 * Reads MadeLocal revenue for the signed-in seller.
 * Live: session-derived status + real `transactions` sum.
 * Demo (no credentials): simulated connection with mock numbers.
 */
export function useMadeLocalRevenue(): MadeLocalRevenueState {
  const session = useMadeLocalSession();
  const live = session.configured;

  const [status, setStatus] = useState<MadeLocalConnectionStatus>(() =>
    isMadeLocalConfigured ? "connecting" : getStoredConnectionStatus(),
  );
  const [data, setData] = useState<MadeLocalRevenue | null>(() =>
    isMadeLocalConfigured || getStoredConnectionStatus() !== "connected"
      ? null
      : getMockMadeLocalRevenue(),
  );
  const [stale, setStale] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const load = useCallback(async () => {
    const result = await fetchMadeLocalRevenue(30);
    if (result.ok) {
      setData(result.data);
      setStale(false);
      setError(null);
      setStatus("connected");
    } else {
      setError(result.error);
      setData(result.data);
      setStale(Boolean(result.data));
      setStatus(result.data ? "connected" : "error");
    }
  }, []);

  // Live path: status follows the session, revenue follows the signed-in user.
  useEffect(() => {
    if (!live) return;
    if (session.loading) {
      setStatus("connecting");
      return;
    }
    if (!session.user) {
      setStatus("disconnected");
      setData(null);
      setStale(false);
      setError(null);
      return;
    }
    void load();
  }, [live, session.loading, session.user?.id, load]);

  // Demo path: simulated connection persisted locally.
  useEffect(() => {
    if (live) return;
    setStoredConnectionStatus(status);
    if (status === "connected") setData(getMockMadeLocalRevenue());
    else if (status === "disconnected") setData(null);
  }, [live, status]);

  return {
    status,
    data,
    live,
    stale,
    error,
    accountLabel: session.user?.email ?? null,
    connect: () => {
      if (live) {
        // Live: the session is the connection — send them to sign in.
        if (typeof window !== "undefined") window.location.assign("/auth");
        return;
      }
      setStatus("connecting");
      setTimeout(() => setStatus("connected"), 700);
    },
    disconnect: () => setStatus("disconnected"),
    refresh: () => {
      if (live) {
        if (session.user) void load();
        return;
      }
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
