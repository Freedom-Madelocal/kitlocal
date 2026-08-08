import { useMemo, useState } from "react";
import { CornerDownLeft, Info, MessageSquare, Send, AtSign } from "lucide-react";
import {
  DM_REPLY_WINDOW_HOURS,
  lastCustomerMessage,
  platformMeta,
  quickReplies,
  relativeTime,
  replyWindowClosed,
  type InboxThread,
} from "@/lib/social-inbox-data";
import { PlatformIcon } from "./PlatformIcon";

export function ThreadDetail({
  thread,
  onSent,
}: {
  thread: InboxThread;
  /** Records the reply locally so the demo shows it in the transcript. */
  onSent: (threadId: string, text: string) => void;
}) {
  const [draft, setDraft] = useState("");
  const closed = replyWindowClosed(thread);
  const meta = platformMeta(thread.platform);
  const last = lastCustomerMessage(thread);
  const suggestions = quickReplies[thread.kind];

  const hoursLeft = useMemo(() => {
    if (thread.kind !== "dm" || !last) return null;
    return Math.max(0, Math.round((DM_REPLY_WINDOW_HOURS - last.hoursAgo) / 24));
  }, [thread.kind, last]);

  const send = () => {
    const text = draft.trim();
    if (!text || closed) return;
    onSent(thread.id, text);
    setDraft("");
  };

  return (
    <div className="neu-card p-5 md:p-6 flex flex-col gap-5">
      {/* Who and where */}
      <header className="flex items-start gap-3">
        <div className="neu-inset h-12 w-12 grid place-items-center shrink-0 text-sm font-semibold">
          {thread.initials}
        </div>
        <div className="min-w-0 flex-1">
          <div className="font-display text-xl font-semibold truncate">{thread.author}</div>
          <div className="flex items-center gap-2 text-xs text-muted-foreground mt-0.5">
            <PlatformIcon platform={thread.platform} className="h-3.5 w-3.5" />
            <span className="truncate">{meta.label}</span>
            <span aria-hidden>·</span>
            <span className="inline-flex items-center gap-1">
              {thread.kind === "dm" ? (
                <MessageSquare className="h-3 w-3" />
              ) : (
                <AtSign className="h-3 w-3" />
              )}
              {thread.kind === "dm" ? "Message" : "Comment"}
            </span>
          </div>
        </div>
      </header>

      {thread.postTitle && (
        <div className="neu-inset p-3 text-xs text-muted-foreground">
          On your post: <span className="text-foreground font-medium">{thread.postTitle}</span>
        </div>
      )}

      {/* Transcript */}
      <div className="flex flex-col gap-3">
        {thread.messages.map((m) => (
          <div
            key={m.id}
            className={m.from === "you" ? "flex justify-end" : "flex justify-start"}
          >
            <div className="max-w-[85%]">
              <div
                className={
                  m.from === "you"
                    ? "neu-card-sm bg-primary/10 px-4 py-3 text-sm"
                    : "neu-card-sm px-4 py-3 text-sm"
                }
              >
                {m.text}
              </div>
              <div
                className={
                  m.from === "you"
                    ? "text-[11px] text-muted-foreground mt-1 text-right"
                    : "text-[11px] text-muted-foreground mt-1"
                }
              >
                {m.from === "you" ? "You" : thread.handle} · {relativeTime(m.hoursAgo)}
              </div>
            </div>
          </div>
        ))}
      </div>

      {/* Reply */}
      {closed ? (
        <div className="neu-inset p-4 flex items-start gap-3 text-xs">
          <Info className="h-4 w-4 text-accent shrink-0 mt-0.5" />
          <p className="text-muted-foreground">
            <span className="text-foreground font-medium">Reply window closed.</span>{" "}
            {meta.label} only allows a reply within 7 days of the customer's last message.
            To reach {thread.author} now, comment on one of their posts or wait for them to
            message again.
          </p>
        </div>
      ) : (
        <div className="flex flex-col gap-3">
          {hoursLeft !== null && hoursLeft <= 3 && (
            <div className="text-[11px] font-medium text-accent">
              {hoursLeft === 0 ? "Less than a day" : `${hoursLeft} days`} left to reply
            </div>
          )}

          <div className="flex flex-wrap gap-2">
            {suggestions.map((s) => (
              <button
                key={s}
                onClick={() => setDraft(s)}
                className="neu-pressable px-3 py-1.5 text-[11px] font-medium rounded-full text-left max-w-full truncate"
              >
                {s}
              </button>
            ))}
          </div>

          <textarea
            value={draft}
            onChange={(e) => setDraft(e.target.value)}
            onKeyDown={(e) => {
              if (e.key === "Enter" && (e.metaKey || e.ctrlKey)) send();
            }}
            rows={3}
            placeholder={
              thread.kind === "dm"
                ? `Message ${thread.author}…`
                : `Reply to ${thread.handle}…`
            }
            className="neu-inset w-full resize-none bg-transparent px-4 py-3 text-sm outline-none placeholder:text-muted-foreground/70"
            aria-label="Your reply"
          />

          <div className="flex items-center justify-between gap-3">
            <span className="text-[11px] text-muted-foreground inline-flex items-center gap-1">
              <CornerDownLeft className="h-3 w-3" /> Cmd + Enter to send
            </span>
            <button
              onClick={send}
              disabled={!draft.trim()}
              className="neu-pressable bg-primary text-primary-foreground hover:bg-primary/90 disabled:opacity-40 px-5 py-2.5 text-sm font-semibold rounded-xl inline-flex items-center gap-2"
              style={{ boxShadow: "var(--shadow-neu-sm)" }}
            >
              <Send className="h-3.5 w-3.5" />
              Send reply
            </button>
          </div>
        </div>
      )}
    </div>
  );
}
