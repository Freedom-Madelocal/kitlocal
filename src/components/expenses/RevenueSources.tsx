import { useEffect, useMemo, useState } from "react";
import { Plus, Trash2, Wallet, DollarSign, Landmark, Store, X } from "lucide-react";
import { cn } from "@/lib/utils";
import { toast } from "sonner";

export type Cadence = "day" | "week" | "month";

export type RevenueSource = {
  id: string;
  name: string;
  preset?: "venmo" | "zelle" | "paypal" | "madelocal" | "custom";
};

export type RevenueEntry = {
  id: string;
  sourceId: string;
  amount: number;
  cadence: Cadence;
  date: string; // ISO date
  note?: string;
};

const PRESETS: RevenueSource[] = [
  { id: "venmo", name: "Venmo", preset: "venmo" },
  { id: "zelle", name: "Zelle", preset: "zelle" },
  { id: "paypal", name: "PayPal", preset: "paypal" },
  { id: "madelocal", name: "MadeLocal", preset: "madelocal" },
];

const SOURCES_KEY = "ml.revenueSources.v1";
const ENTRIES_KEY = "ml.revenueEntries.v1";

function loadSources(): RevenueSource[] {
  try {
    const raw = localStorage.getItem(SOURCES_KEY);
    if (raw) return JSON.parse(raw);
  } catch {}
  return [PRESETS[0], PRESETS[3]]; // default: Venmo + MadeLocal enabled
}
function loadEntries(): RevenueEntry[] {
  try {
    const raw = localStorage.getItem(ENTRIES_KEY);
    if (raw) return JSON.parse(raw);
  } catch {}
  return [];
}

function iconFor(preset?: RevenueSource["preset"]) {
  switch (preset) {
    case "venmo":
      return Wallet;
    case "zelle":
      return Landmark;
    case "paypal":
      return DollarSign;
    case "madelocal":
      return Store;
    default:
      return DollarSign;
  }
}

function fmtDate(iso: string) {
  const d = new Date(iso);
  return d.toLocaleDateString(undefined, { month: "short", day: "numeric" });
}

type Props = {
  onTotalChange?: (total: number) => void;
};

export function RevenueSources({ onTotalChange }: Props) {
  const [sources, setSources] = useState<RevenueSource[]>(loadSources);
  const [entries, setEntries] = useState<RevenueEntry[]>(loadEntries);
  const [addingSource, setAddingSource] = useState(false);
  const [customName, setCustomName] = useState("");

  // form
  const [entrySourceId, setEntrySourceId] = useState<string>("");
  const [amount, setAmount] = useState("");
  const [cadence, setCadence] = useState<Cadence>("week");
  const [date, setDate] = useState(() => new Date().toISOString().slice(0, 10));

  useEffect(() => {
    localStorage.setItem(SOURCES_KEY, JSON.stringify(sources));
  }, [sources]);
  useEffect(() => {
    localStorage.setItem(ENTRIES_KEY, JSON.stringify(entries));
  }, [entries]);

  useEffect(() => {
    if (!entrySourceId && sources[0]) setEntrySourceId(sources[0].id);
  }, [sources, entrySourceId]);

  const total = useMemo(() => entries.reduce((s, e) => s + e.amount, 0), [entries]);
  useEffect(() => {
    onTotalChange?.(total);
  }, [total, onTotalChange]);

  const availablePresets = PRESETS.filter((p) => !sources.some((s) => s.id === p.id));

  const addPreset = (p: RevenueSource) => {
    setSources((prev) => [...prev, p]);
    toast.success(`${p.name} added`);
  };

  const addCustom = () => {
    const name = customName.trim();
    if (!name) return;
    const id = `custom-${Date.now()}`;
    setSources((prev) => [...prev, { id, name, preset: "custom" }]);
    setCustomName("");
    setAddingSource(false);
    toast.success(`${name} added`);
  };

  const removeSource = (id: string) => {
    setSources((prev) => prev.filter((s) => s.id !== id));
    setEntries((prev) => prev.filter((e) => e.sourceId !== id));
  };

  const addEntry = () => {
    const amt = parseFloat(amount);
    if (!entrySourceId || !amt || amt <= 0) {
      toast.error("Add an amount and pick a source");
      return;
    }
    const entry: RevenueEntry = {
      id: `e-${Date.now()}`,
      sourceId: entrySourceId,
      amount: amt,
      cadence,
      date,
    };
    setEntries((prev) => [entry, ...prev]);
    setAmount("");
    toast.success(`Logged $${amt.toFixed(2)}`);
  };

  const removeEntry = (id: string) => setEntries((prev) => prev.filter((e) => e.id !== id));

  const sourceById = (id: string) => sources.find((s) => s.id === id);

  const perSource = useMemo(() => {
    const map = new Map<string, number>();
    for (const e of entries) map.set(e.sourceId, (map.get(e.sourceId) ?? 0) + e.amount);
    return map;
  }, [entries]);

  return (
    <section className="neu-card p-5 md:p-7 flex flex-col gap-6">
      <div className="flex items-start justify-between gap-4 flex-wrap">
        <div className="min-w-0">
          <h2 className="font-display text-2xl md:text-3xl font-semibold">Revenue sources</h2>
          <p className="text-sm text-muted-foreground mt-1">
            Track earnings from every payment app. Totals feed into your true profit above.
          </p>
        </div>
        <div className="neu-inset px-5 py-3 rounded-2xl text-right">
          <div className="text-[11px] uppercase tracking-wider text-muted-foreground">Total revenue</div>
          <div className="font-display text-2xl md:text-3xl font-semibold text-primary">
            ${total.toFixed(2)}
          </div>
        </div>
      </div>

      {/* Source chips */}
      <div className="flex flex-wrap gap-2">
        {sources.map((s) => {
          const Icon = iconFor(s.preset);
          const subtotal = perSource.get(s.id) ?? 0;
          return (
            <div
              key={s.id}
              className="neu-card-sm px-3 py-2 flex items-center gap-2 text-sm"
            >
              <Icon className="h-4 w-4 text-primary" />
              <span className="font-medium">{s.name}</span>
              <span className="text-muted-foreground text-xs">
                ${subtotal.toFixed(2)}
              </span>
              <button
                onClick={() => removeSource(s.id)}
                aria-label={`Remove ${s.name}`}
                className="ml-1 text-muted-foreground hover:text-destructive transition-colors"
              >
                <X className="h-3.5 w-3.5" />
              </button>
            </div>
          );
        })}
        {sources.length === 0 && (
          <span className="text-sm text-muted-foreground">No sources yet — add one below.</span>
        )}
      </div>

      {/* Add source */}
      <div className="flex flex-col gap-3">
        <div className="text-xs font-semibold uppercase tracking-wider text-muted-foreground">
          Add a source
        </div>
        <div className="flex flex-wrap gap-2">
          {availablePresets.map((p) => {
            const Icon = iconFor(p.preset);
            return (
              <button
                key={p.id}
                onClick={() => addPreset(p)}
                className="neu-pressable px-3 py-2 flex items-center gap-2 text-sm font-medium"
              >
                <Icon className="h-4 w-4 text-primary" />
                {p.name}
                <Plus className="h-3.5 w-3.5 text-muted-foreground" />
              </button>
            );
          })}
          {!addingSource ? (
            <button
              onClick={() => setAddingSource(true)}
              className="neu-pressable px-3 py-2 flex items-center gap-2 text-sm font-medium"
            >
              <Plus className="h-4 w-4 text-primary" /> Custom
            </button>
          ) : (
            <div className="neu-inset flex items-center gap-2 pl-3 pr-1 py-1 rounded-lg">
              <input
                autoFocus
                value={customName}
                onChange={(e) => setCustomName(e.target.value)}
                onKeyDown={(e) => e.key === "Enter" && addCustom()}
                placeholder="Source name"
                className="bg-transparent outline-none text-sm w-40"
              />
              <button
                onClick={addCustom}
                className="text-xs font-semibold text-primary px-2 py-1 rounded-md hover:bg-primary/10"
              >
                Add
              </button>
              <button
                onClick={() => {
                  setAddingSource(false);
                  setCustomName("");
                }}
                aria-label="Cancel"
                className="text-muted-foreground p-1"
              >
                <X className="h-3.5 w-3.5" />
              </button>
            </div>
          )}
        </div>
        <p className="text-xs text-muted-foreground">
          Manual entry today. Direct integrations with Venmo, Zelle, PayPal, Stripe, and MadeLocal coming soon.
        </p>
      </div>

      {/* Log revenue */}
      <div className="neu-inset p-4 md:p-5 rounded-2xl flex flex-col gap-3">
        <div className="text-xs font-semibold uppercase tracking-wider text-muted-foreground">
          Log revenue
        </div>
        <div className="grid grid-cols-1 md:grid-cols-[minmax(0,1fr)_120px_140px_140px_auto] gap-2 md:gap-3">
          <select
            value={entrySourceId}
            onChange={(e) => setEntrySourceId(e.target.value)}
            className="neu-card-sm bg-background px-3 py-2.5 text-sm outline-none"
          >
            {sources.length === 0 && <option value="">Add a source first</option>}
            {sources.map((s) => (
              <option key={s.id} value={s.id}>
                {s.name}
              </option>
            ))}
          </select>
          <div className="neu-card-sm bg-background flex items-center px-3 py-2.5 text-sm">
            <span className="text-muted-foreground mr-1">$</span>
            <input
              type="number"
              inputMode="decimal"
              min="0"
              step="0.01"
              value={amount}
              onChange={(e) => setAmount(e.target.value)}
              placeholder="0.00"
              className="bg-transparent outline-none w-full"
            />
          </div>
          <div className="neu-card-sm bg-background flex items-center px-1 py-1 text-xs">
            {(["day", "week", "month"] as const).map((c) => (
              <button
                key={c}
                onClick={() => setCadence(c)}
                className={cn(
                  "flex-1 px-2 py-1.5 rounded-md capitalize transition-colors",
                  cadence === c
                    ? "bg-primary text-primary-foreground font-semibold"
                    : "text-muted-foreground hover:text-foreground",
                )}
              >
                {c}
              </button>
            ))}
          </div>
          <input
            type="date"
            value={date}
            onChange={(e) => setDate(e.target.value)}
            className="neu-card-sm bg-background px-3 py-2.5 text-sm outline-none"
          />
          <button
            onClick={addEntry}
            disabled={sources.length === 0}
            className="neu-pressable px-4 py-2.5 text-sm font-semibold text-primary flex items-center justify-center gap-1.5 disabled:opacity-50"
          >
            <Plus className="h-4 w-4" /> Add
          </button>
        </div>
      </div>

      {/* Entries */}
      {entries.length > 0 && (
        <div className="flex flex-col gap-2">
          <div className="text-xs font-semibold uppercase tracking-wider text-muted-foreground">
            Recent revenue
          </div>
          <ul className="flex flex-col gap-2">
            {entries.slice(0, 8).map((e) => {
              const src = sourceById(e.sourceId);
              const Icon = iconFor(src?.preset);
              return (
                <li
                  key={e.id}
                  className="neu-card-sm px-4 py-3 flex items-center gap-3"
                >
                  <div className="h-9 w-9 rounded-full neu-inset grid place-items-center shrink-0">
                    <Icon className="h-4 w-4 text-primary" />
                  </div>
                  <div className="min-w-0 flex-1">
                    <div className="text-sm font-medium truncate">
                      {src?.name ?? "Removed source"}
                    </div>
                    <div className="text-xs text-muted-foreground">
                      {fmtDate(e.date)} · per {e.cadence}
                    </div>
                  </div>
                  <div className="font-display text-lg font-semibold text-primary shrink-0">
                    ${e.amount.toFixed(2)}
                  </div>
                  <button
                    onClick={() => removeEntry(e.id)}
                    aria-label="Remove entry"
                    className="text-muted-foreground hover:text-destructive p-1 shrink-0"
                  >
                    <Trash2 className="h-4 w-4" />
                  </button>
                </li>
              );
            })}
          </ul>
        </div>
      )}
    </section>
  );
}
