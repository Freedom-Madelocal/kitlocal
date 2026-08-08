import { useMemo, useState } from "react";
import { AtSign, Inbox, MessageSquare, Settings2 } from "lucide-react";
import { cn } from "@/lib/utils";
import {
  inboxThreads,
  platforms,
  relativeTime,
  replyWindowClosed,
  threadHoursAgo,
  type InboxThread,
  type PlatformKey,
} from "@/lib/social-inbox-data";
import { useSocialConnections } from "@/lib/social-connections";
import { ConnectionsPanel } from "./ConnectionsPanel";
import { ThreadDetail } from "./ThreadDetail";
import { PlatformIcon } from "./PlatformIcon";

type Filter = "all" | "unread" | PlatformKey;

export function InboxView() {
  const { connections, connecting, connect, disconnect } = useSocialConnections();
  const [threads, setThreads] = useState<InboxThread[]>(inboxThreads);
  const [filter, setFilter] = useState<Filter>("all");
  const [selectedId, setSelectedId] = useState<string | null>(null);
  const [showSetup, setShowSetup] = useState(false);

  const connectedPlatforms = useMemo(
    () => platforms.filter((p) => connections[p.key]?.connected).map((p) => p.key),
    [connections],
  );
  const anyConnected = connectedPlatforms.length > 0;

  // Only show conversations from accounts the seller actually connected.
  const visible = useMemo(
    () =>
      threads
        .filter((t) => connectedPlatforms.includes(t.platform))
        .sort((a, b) => threadHoursAgo(a) - threadHoursAgo(b)),
    [threads, connectedPlatforms],
  );

  const filtered = useMemo(
    () =>
      visible.filter((t) => {
        if (filter === "all") return true;
        if (filter === "unread") return t.unread;
        return t.platform === filter;
      }),
    [visible, filter],
  );

  const unreadCount = visible.filter((t) => t.unread).length;
  const selected = filtered.find((t) => t.id === selectedId) ?? filtered[0] ?? null;

  const openThread = (id: string) => {
    setSelectedId(id);
    setThreads((prev) => prev.map((t) => (t.id === id ? { ...t, unread: false } : t)));
  };

  const handleSent = (threadId: string, text: string) => {
    setThreads((prev) =>
      prev.map((t) =>
        t.id === threadId
          ? {
              ...t,
              unread: false,
              messages: [
                ...t.messages,
                { id: `${threadId}-r${t.messages.length}`, from: "you" as const, text, hoursAgo: 0 },
              ],
            }
          : t,
      ),
    );
  };

  const filterChips: { key: Filter; label: string }[] = [
    { key: "all", label: "All" },
    { key: "unread", label: `Unread${unreadCount ? ` (${unreadCount})` : ""}` },
    ...connectedPlatforms.map((key) => ({
      key: key as Filter,
      label: platforms.find((p) => p.key === key)!.label,
    })),
  ];

  return (
    <div className="flex flex-col gap-8">
      <header className="flex items-start justify-between gap-4 flex-wrap">
        <div>
          <h1 className="font-display text-4xl md:text-5xl font-semibold tracking-tight">Inbox</h1>
          <p className="text-sm md:text-base text-muted-foreground mt-2">
            {anyConnected
              ? unreadCount > 0
                ? `${unreadCount} new ${unreadCount === 1 ? "message" : "messages"} waiting on a reply.`
                : "You're all caught up."
              : "Connect an account to see comments and messages here."}
          </p>
        </div>
        {anyConnected && (
          <button
            onClick={() => setShowSetup((v) => !v)}
            className="neu-pressable px-4 py-2.5 text-sm font-medium rounded-xl inline-flex items-center gap-2 shrink-0"
          >
            <Settings2 className="h-4 w-4" />
            {showSetup ? "Hide accounts" : "Manage accounts"}
          </button>
        )}
      </header>

      {(!anyConnected || showSetup) && (
        <ConnectionsPanel
          connections={connections}
          connecting={connecting}
          connect={connect}
          disconnect={disconnect}
        />
      )}

      {anyConnected && (
        <>
          <div className="flex flex-wrap gap-2">
            {filterChips.map((chip) => (
              <button
                key={chip.key}
                onClick={() => setFilter(chip.key)}
                className={cn(
                  "px-4 py-2 rounded-full text-xs font-semibold transition-all",
                  filter === chip.key ? "neu-inset text-primary" : "neu-pressable text-foreground/80",
                )}
              >
                {chip.label}
              </button>
            ))}
          </div>

          {filtered.length === 0 ? (
            <div className="neu-card p-10 text-center">
              <Inbox className="h-8 w-8 mx-auto text-muted-foreground" />
              <p className="text-sm text-muted-foreground mt-3">Nothing here right now.</p>
            </div>
          ) : (
            <div className="grid gap-6 lg:grid-cols-[minmax(0,22rem)_1fr] items-start">
              {/* Thread list */}
              <div className="flex flex-col gap-3">
                {filtered.map((t) => {
                  const preview = t.messages[t.messages.length - 1];
                  const active = selected?.id === t.id;
                  return (
                    <button
                      key={t.id}
                      onClick={() => openThread(t.id)}
                      className={cn(
                        "text-left p-4 transition-all",
                        active ? "neu-inset" : "neu-card",
                      )}
                    >
                      <div className="flex items-start gap-3">
                        <div className="neu-inset h-10 w-10 grid place-items-center shrink-0 text-xs font-semibold">
                          {t.initials}
                        </div>
                        <div className="min-w-0 flex-1">
                          <div className="flex items-center gap-2">
                            <span className="font-semibold text-sm truncate">{t.author}</span>
                            {t.unread && (
                              <span className="h-2 w-2 rounded-full bg-accent shrink-0" aria-label="Unread" />
                            )}
                          </div>
                          <p className="text-xs text-muted-foreground mt-1 line-clamp-2">
                            {preview.from === "you" ? "You: " : ""}
                            {preview.text}
                          </p>
                          <div className="flex items-center gap-2 mt-2 text-[11px] text-muted-foreground">
                            <PlatformIcon platform={t.platform} className="h-3 w-3" />
                            {t.kind === "dm" ? (
                              <MessageSquare className="h-3 w-3" />
                            ) : (
                              <AtSign className="h-3 w-3" />
                            )}
                            <span>{relativeTime(threadHoursAgo(t))}</span>
                            {replyWindowClosed(t) && (
                              <span className="text-accent font-medium">Reply window closed</span>
                            )}
                          </div>
                        </div>
                      </div>
                    </button>
                  );
                })}
              </div>

              {/* Selected conversation */}
              {selected && <ThreadDetail thread={selected} onSent={handleSent} />}
            </div>
          )}
        </>
      )}
    </div>
  );
}
