import { useCallback, useEffect, useState } from "react";
import type { PlatformKey } from "./social-inbox-data";

/**
 * Phase 1 connection state. Simulated locally so the connect flow is
 * demoable before the Meta app clears review. Phase 2 replaces this with
 * real OAuth plus server-side, encrypted per-seller token storage — no
 * provider token ever belongs in the browser.
 */
export type ConnectionState = {
  connected: boolean;
  accountLabel?: string;
  connectedAt?: string;
};

export type ConnectionMap = Partial<Record<PlatformKey, ConnectionState>>;

const STORAGE_KEY = "madelocal.social-connections.v1";

const simulatedAccount: Record<PlatformKey, string> = {
  instagram: "@wildflowerbakes",
  facebook: "Wildflower Sourdough Co.",
  tiktok: "@wildflowerbakes",
};

function read(): ConnectionMap {
  if (typeof window === "undefined") return {};
  try {
    const raw = window.localStorage.getItem(STORAGE_KEY);
    return raw ? (JSON.parse(raw) as ConnectionMap) : {};
  } catch {
    return {};
  }
}

export function useSocialConnections() {
  const [connections, setConnections] = useState<ConnectionMap>({});
  const [connecting, setConnecting] = useState<PlatformKey | null>(null);

  useEffect(() => {
    setConnections(read());
  }, []);

  const persist = useCallback((next: ConnectionMap) => {
    setConnections(next);
    try {
      window.localStorage.setItem(STORAGE_KEY, JSON.stringify(next));
    } catch {
      /* storage unavailable — state still lives in memory for this session */
    }
  }, []);

  const connect = useCallback(
    (platform: PlatformKey) => {
      setConnecting(platform);
      // Stands in for the OAuth round-trip so the flow feels real in a demo.
      window.setTimeout(() => {
        setConnecting(null);
        persist({
          ...read(),
          [platform]: {
            connected: true,
            accountLabel: simulatedAccount[platform],
            connectedAt: new Date().toISOString(),
          },
        });
      }, 900);
    },
    [persist],
  );

  const disconnect = useCallback(
    (platform: PlatformKey) => {
      const next = { ...read() };
      delete next[platform];
      persist(next);
    },
    [persist],
  );

  const isConnected = useCallback(
    (platform: PlatformKey) => Boolean(connections[platform]?.connected),
    [connections],
  );

  return { connections, connecting, connect, disconnect, isConnected };
}
