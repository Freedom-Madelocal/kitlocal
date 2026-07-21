export type Seller = {
  id: string;
  name: string;
  handle: string;
  category: string;
  initials: string;
};

export const sellers: Seller[] = [
  { id: "wildflower", name: "Wildflower Sourdough Co.", handle: "@wildflowerbakes", category: "Artisan Bakery", initials: "WS" },
  { id: "meadow", name: "Meadow & Vine Farm", handle: "@meadowvine", category: "Produce & Preserves", initials: "MV" },
  { id: "hivebar", name: "Hive Bar Provisions", handle: "@hivebar", category: "Honey & Snacks", initials: "HB" },
];

export type MarketItemSales = {
  item: string;
  sold: number;
  revenue: number;
};

export type Market = {
  id: string;
  name: string;
  location: string;
  date: string; // ISO
  startTime: string;
  endTime: string;
  boothFee: number;
  adminEmail: string;
  weather: { temp: number; condition: string; icon: "sun" | "cloud" | "rain" };
  lastVisitSales: MarketItemSales[];
  prepSuggestions: { item: string; qty: number; unit: string; note?: string }[];
};

const today = new Date();
function daysFromNow(n: number) {
  const d = new Date(today);
  d.setDate(d.getDate() + n);
  d.setHours(9, 0, 0, 0);
  return d.toISOString();
}

export const markets: Market[] = [
  {
    id: "downtown-sat",
    name: "Downtown Farmers Market",
    location: "Main St. Plaza",
    date: daysFromNow(2),
    startTime: "9:00 AM",
    endTime: "1:00 PM",
    boothFee: 45,
    adminEmail: "manager@downtownmarket.org",
    weather: { temp: 72, condition: "Sunny", icon: "sun" },
    lastVisitSales: [
      { item: "Sourdough Loaf", sold: 38, revenue: 342 },
      { item: "Focaccia Pan", sold: 17, revenue: 204 },
      { item: "Rosemary Rolls (6pk)", sold: 22, revenue: 176 },
      { item: "Fig Jam Jar", sold: 24, revenue: 216 },
    ],
    prepSuggestions: [
      { item: "Sourdough Loaf", qty: 45, unit: "loaves", note: "+18% for sunny weekend" },
      { item: "Focaccia Pan", qty: 20, unit: "pans" },
      { item: "Rosemary Rolls (6pk)", qty: 26, unit: "packs" },
      { item: "Fig Jam Jar", qty: 30, unit: "jars", note: "Restock preserves" },
    ],
  },
  {
    id: "riverside-pop",
    name: "Riverside Pop-Up",
    location: "River Walk",
    date: daysFromNow(5),
    startTime: "4:00 PM",
    endTime: "8:00 PM",
    boothFee: 30,
    adminEmail: "events@riversidepopup.co",
    weather: { temp: 65, condition: "Partly Cloudy", icon: "cloud" },
    lastVisitSales: [
      { item: "Sourdough Loaf", sold: 22, revenue: 198 },
      { item: "Cinnamon Twist", sold: 30, revenue: 150 },
    ],
    prepSuggestions: [
      { item: "Sourdough Loaf", qty: 25, unit: "loaves" },
      { item: "Cinnamon Twist", qty: 36, unit: "twists", note: "Evening crowd favorite" },
      { item: "Focaccia Pan", qty: 10, unit: "pans" },
    ],
  },
  {
    id: "harvest-fest",
    name: "Harvest Fest",
    location: "Old Mill Grounds",
    date: daysFromNow(9),
    startTime: "10:00 AM",
    endTime: "5:00 PM",
    boothFee: 75,
    adminEmail: "vendors@harvestfest.org",
    weather: { temp: 58, condition: "Light Rain", icon: "rain" },
    lastVisitSales: [
      { item: "Sourdough Loaf", sold: 50, revenue: 450 },
      { item: "Focaccia Pan", sold: 28, revenue: 336 },
      { item: "Fig Jam Jar", sold: 42, revenue: 378 },
    ],
    prepSuggestions: [
      { item: "Sourdough Loaf", qty: 55, unit: "loaves" },
      { item: "Focaccia Pan", qty: 30, unit: "pans" },
      { item: "Fig Jam Jar", qty: 45, unit: "jars" },
      { item: "Apple Butter Jar", qty: 24, unit: "jars", note: "Seasonal add-on" },
    ],
  },
  {
    id: "downtown-sat-2",
    name: "Downtown Farmers Market",
    location: "Main St. Plaza",
    date: daysFromNow(16),
    startTime: "9:00 AM",
    endTime: "1:00 PM",
    boothFee: 45,
    adminEmail: "manager@downtownmarket.org",
    weather: { temp: 68, condition: "Sunny", icon: "sun" },
    lastVisitSales: [
      { item: "Sourdough Loaf", sold: 40, revenue: 360 },
      { item: "Focaccia Pan", sold: 18, revenue: 216 },
    ],
    prepSuggestions: [
      { item: "Sourdough Loaf", qty: 44, unit: "loaves" },
      { item: "Focaccia Pan", qty: 20, unit: "pans" },
    ],
  },
  {
    id: "night-market",
    name: "Night Market Series",
    location: "Warehouse District",
    date: daysFromNow(12),
    startTime: "6:00 PM",
    endTime: "10:00 PM",
    boothFee: 60,
    adminEmail: "hello@nightmarketseries.com",
    weather: { temp: 60, condition: "Clear", icon: "sun" },
    lastVisitSales: [
      { item: "Focaccia Slices", sold: 65, revenue: 325 },
      { item: "Cinnamon Twist", sold: 48, revenue: 240 },
    ],
    prepSuggestions: [
      { item: "Focaccia Slices", qty: 80, unit: "slices" },
      { item: "Cinnamon Twist", qty: 50, unit: "twists" },
      { item: "Sourdough Loaf", qty: 20, unit: "loaves" },
    ],
  },
];

export type PostAnalysis = {
  hookScore: number;
  engagement: "Low" | "Moderate" | "High" | "Very High";
  positives: string[];
  missed: string[];
  summary: string;
};

export function analyzePostMock(input: string): PostAnalysis {
  const len = input.trim().length;
  const seed = (len + input.charCodeAt(0 || 0)) % 3;
  const base: PostAnalysis[] = [
    {
      hookScore: 85,
      engagement: "High",
      summary: "Strong opening visual, warm story-driven caption.",
      positives: [
        "Great visual of sourdough scoring — captures craft in first frame",
        "Personal voice builds trust with local audience",
        "Uses vertical format optimized for Reels/TikTok",
      ],
      missed: [
        "Missing a clear market call-to-action (where + when to buy)",
        "No location tag — Instagram surfaces local content faster with it",
        "Hashtags too broad — add #YourCityEats and #FarmersMarket + city",
      ],
    },
    {
      hookScore: 62,
      engagement: "Moderate",
      summary: "Solid content, but the first 2 seconds don't stop the scroll.",
      positives: [
        "Good behind-the-scenes energy",
        "Product benefit clearly stated",
      ],
      missed: [
        "Hook is buried — lead with the finished loaf or a surprising fact",
        "Caption is too long without a payoff in the first line",
        "No urgency — mention limited quantities or market date",
      ],
    },
    {
      hookScore: 91,
      engagement: "Very High",
      summary: "Excellent hook and clear CTA. Ready to boost.",
      positives: [
        "Attention-grabbing first frame with steam + score sound",
        "Explicit market call-to-action with time and booth number",
        "Uses trending audio without drowning your voice",
      ],
      missed: [
        "Consider a follow-up story with the sold-out reveal for FOMO",
      ],
    },
  ];
  return base[seed];
}

export type NudgeSuggestion = {
  id: string;
  marketId: string;
  daysAway: number;
  message: string;
  draftCaption: string;
  hashtags: string[];
};

export function nudgesForUpcomingMarkets(): NudgeSuggestion[] {
  return markets.slice(0, 3).map((m, idx) => {
    const days = Math.max(1, Math.ceil((new Date(m.date).getTime() - Date.now()) / 86400000));
    const drafts = [
      `Fresh crumb, hot ovens 🔥 — we're bringing sourdough, focaccia, and jam to ${m.name} in ${days} days. Come say hi at ${m.location}, ${m.startTime}–${m.endTime}. First 20 loaves get a rosemary garnish on the house.`,
      `Behind the counter this week: 45 loaves proofing, 30 jars of fig jam labeled by hand. See you at ${m.name} — ${m.location}, ${m.startTime}. Bring a tote 🍞`,
      `Neighbors — save the date. ${m.name} in ${days} days. Preorder ends midnight tomorrow, link in bio.`,
    ];
    return {
      id: `nudge-${m.id}`,
      marketId: m.id,
      daysAway: days,
      message: `You have ${m.name} in ${days} day${days === 1 ? "" : "s"} — post a 15-second reel showing your ${idx === 0 ? "bake prep" : idx === 1 ? "packaging routine" : "market setup"}!`,
      draftCaption: drafts[idx % drafts.length],
      hashtags: ["#SourdoughLife", "#FarmersMarket", "#SupportLocal", "#ArtisanBakery", `#${m.location.replace(/\s+/g, "")}`],
    };
  });
}

export type ReceiptLineItem = {
  id: string;
  description: string;
  amount: number;
  category: "cogs" | "overhead";
};

export type Receipt = {
  id: string;
  vendor: string;
  date: string;
  total: number;
  items: ReceiptLineItem[];
};

export const sampleReceipt: Receipt = {
  id: "r-2025-07-14",
  vendor: "Millwright Restaurant Supply",
  date: new Date().toISOString(),
  total: 168.75,
  items: [
    { id: "li-1", description: "50lb Organic Flour", amount: 42.0, category: "cogs" },
    { id: "li-2", description: "Kosher Salt (25lb bag)", amount: 14.25, category: "cogs" },
    { id: "li-3", description: "Packaging Labels (500ct)", amount: 18.5, category: "cogs" },
    { id: "li-4", description: "Kraft Paper Bags", amount: 22.0, category: "cogs" },
    { id: "li-5", description: "Fuel — Van", amount: 25.0, category: "overhead" },
    { id: "li-6", description: "Booth Insurance (monthly)", amount: 47.0, category: "overhead" },
  ],
};

export const pastReceipts: Receipt[] = [
  {
    id: "r-2025-07-07",
    vendor: "Grain Mill Co-op",
    date: daysFromNow(-7),
    total: 214.5,
    items: [
      { id: "a1", description: "Whole Wheat Flour 25lb", amount: 68, category: "cogs" },
      { id: "a2", description: "Rye Berries 10lb", amount: 42, category: "cogs" },
      { id: "a3", description: "Delivery Fee", amount: 12, category: "overhead" },
      { id: "a4", description: "Yeast — bulk", amount: 92.5, category: "cogs" },
    ],
  },
  {
    id: "r-2025-06-28",
    vendor: "City Farmers Market — Booth Fee",
    date: daysFromNow(-14),
    total: 90,
    items: [{ id: "b1", description: "Booth rental (2 wks)", amount: 90, category: "overhead" }],
  },
  {
    id: "r-2025-06-20",
    vendor: "Costco Business",
    date: daysFromNow(-21),
    total: 132.4,
    items: [
      { id: "c1", description: "Butter (bulk)", amount: 58, category: "cogs" },
      { id: "c2", description: "Sugar 50lb", amount: 34.4, category: "cogs" },
      { id: "c3", description: "Cleaning Supplies", amount: 40, category: "overhead" },
    ],
  },
];

export function marketRevenueTotal(): number {
  return markets.reduce(
    (s, m) => s + m.lastVisitSales.reduce((a, i) => a + i.revenue, 0),
    0,
  );
}
