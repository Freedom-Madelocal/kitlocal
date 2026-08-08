/**
 * Phase 1 mock data for the Social Inbox.
 *
 * Nothing here talks to Meta or TikTok yet — the shapes deliberately mirror
 * what the real APIs return so the live wiring in Phase 2 can drop in behind
 * the same types:
 *  - Instagram / Facebook: comments + DMs, replies allowed only inside the
 *    7-day window after the customer's last message.
 *  - TikTok: comments only, and only with audited access. No DM API exists.
 */

export type PlatformKey = "instagram" | "facebook" | "tiktok";

export type PlatformMeta = {
  key: PlatformKey;
  label: string;
  /** What the platform lets us do once connected. */
  supports: { comments: boolean; dms: boolean };
  /** Phase 1: TikTok stays unavailable until audited access is granted. */
  availability: "available" | "coming-soon";
  connectNote: string;
  requirement?: string;
};

export const platforms: PlatformMeta[] = [
  {
    key: "instagram",
    label: "Instagram",
    supports: { comments: true, dms: true },
    availability: "available",
    connectNote: "Comments and DMs, with replies.",
    requirement: "Needs a professional (Business or Creator) account.",
  },
  {
    key: "facebook",
    label: "Facebook Page",
    supports: { comments: true, dms: true },
    availability: "available",
    connectNote: "Page comments and Messenger, with replies.",
    requirement: "You'll pick which Page to connect.",
  },
  {
    key: "tiktok",
    label: "TikTok",
    supports: { comments: true, dms: false },
    availability: "coming-soon",
    connectNote: "Comments only — TikTok has no messaging API.",
    requirement: "Waiting on TikTok API access approval.",
  },
];

export function platformMeta(key: PlatformKey): PlatformMeta {
  return platforms.find((p) => p.key === key) ?? platforms[0];
}

export type InboxMessage = {
  id: string;
  /** "them" = the customer, "you" = the seller. */
  from: "them" | "you";
  text: string;
  /** Hours ago, resolved to a real date at read time. */
  hoursAgo: number;
};

export type InboxThread = {
  id: string;
  kind: "comment" | "dm";
  platform: PlatformKey;
  author: string;
  handle: string;
  initials: string;
  /** Comments only: the post the comment landed on. */
  postTitle?: string;
  unread: boolean;
  messages: InboxMessage[];
};

/** Meta's hard limit: a DM reply is only allowed within 7 days. */
export const DM_REPLY_WINDOW_HOURS = 24 * 7;

export function lastCustomerMessage(thread: InboxThread): InboxMessage | undefined {
  return [...thread.messages].reverse().find((m) => m.from === "them");
}

export function threadHoursAgo(thread: InboxThread): number {
  return Math.min(...thread.messages.map((m) => m.hoursAgo));
}

/** DMs go stale after 7 days; comment replies have no window. */
export function replyWindowClosed(thread: InboxThread): boolean {
  if (thread.kind !== "dm") return false;
  const last = lastCustomerMessage(thread);
  if (!last) return false;
  return last.hoursAgo > DM_REPLY_WINDOW_HOURS;
}

export function relativeTime(hoursAgo: number): string {
  if (hoursAgo < 1) return "just now";
  if (hoursAgo < 24) return `${Math.round(hoursAgo)}h ago`;
  const days = Math.round(hoursAgo / 24);
  if (days < 7) return `${days}d ago`;
  const weeks = Math.round(days / 7);
  return `${weeks}w ago`;
}

export const inboxThreads: InboxThread[] = [
  {
    id: "t1",
    kind: "dm",
    platform: "instagram",
    author: "Dana Whitfield",
    handle: "@danacooks",
    initials: "DW",
    unread: true,
    messages: [
      {
        id: "t1m1",
        from: "them",
        text: "Hi! Will you have the rosemary rolls at the Saturday market? I'd love to grab two packs.",
        hoursAgo: 2,
      },
    ],
  },
  {
    id: "t2",
    kind: "comment",
    platform: "instagram",
    author: "Marcus Lee",
    handle: "@marcuseats",
    initials: "ML",
    postTitle: "This week's bake: fig & walnut sourdough",
    unread: true,
    messages: [
      {
        id: "t2m1",
        from: "them",
        text: "That crumb is unreal 😍 do you ship or is it market only?",
        hoursAgo: 4,
      },
    ],
  },
  {
    id: "t3",
    kind: "dm",
    platform: "facebook",
    author: "Priya Raman",
    handle: "Priya Raman",
    initials: "PR",
    unread: true,
    messages: [
      {
        id: "t3m1",
        from: "them",
        text: "Do you take custom orders for a birthday next month? Looking for two focaccia pans.",
        hoursAgo: 9,
      },
      {
        id: "t3m2",
        from: "you",
        text: "We do! Let me check the calendar and get back to you today.",
        hoursAgo: 8,
      },
      {
        id: "t3m3",
        from: "them",
        text: "Perfect, thank you! Saturday the 14th if that works.",
        hoursAgo: 7,
      },
    ],
  },
  {
    id: "t4",
    kind: "comment",
    platform: "facebook",
    author: "Downtown Farmers Market",
    handle: "Downtown Farmers Market",
    initials: "DM",
    postTitle: "See you Saturday at Main St. Plaza!",
    unread: false,
    messages: [
      {
        id: "t4m1",
        from: "them",
        text: "Shared to our page — booth 12 this week, load-in opens at 7:30am.",
        hoursAgo: 20,
      },
    ],
  },
  {
    id: "t5",
    kind: "comment",
    platform: "tiktok",
    author: "hungryinaustin",
    handle: "@hungryinaustin",
    initials: "HA",
    postTitle: "60 seconds of sourdough shaping",
    unread: false,
    messages: [
      {
        id: "t5m1",
        from: "them",
        text: "Which market are you at this weekend? Coming to find you.",
        hoursAgo: 30,
      },
    ],
  },
  {
    id: "t6",
    kind: "dm",
    platform: "instagram",
    author: "Cole Baxter",
    handle: "@colebax",
    initials: "CB",
    unread: false,
    messages: [
      {
        id: "t6m1",
        from: "them",
        text: "Any chance you'll do the jalapeño cheddar again? Been thinking about it since spring.",
        hoursAgo: 24 * 11,
      },
    ],
  },
];

/** Canned suggestions so the reply box is never a blank page. */
export const quickReplies: Record<InboxThread["kind"], string[]> = {
  comment: [
    "Thank you! 🙌",
    "Market only for now — we're at Downtown Farmers Market this Saturday, 9–1.",
    "Yes! Come say hi at booth 12.",
  ],
  dm: [
    "Yes, we'll have those on Saturday — I'll set some aside for you.",
    "Custom orders work best with a week's notice. What date are you thinking?",
    "Thanks for reaching out! We're at Main St. Plaza, 9–1 this Saturday.",
  ],
};
