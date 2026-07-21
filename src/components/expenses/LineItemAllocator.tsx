import type { ReceiptLineItem } from "@/lib/mock-data";
import { cn } from "@/lib/utils";

export function LineItemAllocator({
  vendor,
  items,
  onToggle,
}: {
  vendor: string;
  items: ReceiptLineItem[];
  onToggle: (id: string) => void;
}) {
  const total = items.reduce((s, i) => s + i.amount, 0);
  return (
    <section className="neu-card p-5 md:p-6 flex flex-col gap-4">
      <div>
        <h2 className="font-display text-lg font-semibold">Extracted Line Items</h2>
        <p className="text-xs text-muted-foreground truncate">{vendor}</p>
      </div>

      <div className="flex flex-col gap-2.5">
        {items.map((it) => (
          <div key={it.id} className="neu-inset p-3 flex items-center gap-3">
            <div className="min-w-0 flex-1">
              <div className="text-sm font-medium truncate">{it.description}</div>
              <div className="text-xs text-muted-foreground">${it.amount.toFixed(2)}</div>
            </div>
            <div className="neu-card-sm p-1 flex items-center gap-1 shrink-0">
              {(["cogs", "overhead"] as const).map((c) => (
                <button
                  key={c}
                  onClick={() => it.category !== c && onToggle(it.id)}
                  className={cn(
                    "text-[11px] font-medium px-2.5 py-1 rounded-md transition-all capitalize",
                    it.category === c
                      ? c === "cogs"
                        ? "neu-inset text-primary"
                        : "neu-inset text-accent"
                      : "text-muted-foreground",
                  )}
                >
                  {c === "cogs" ? "COGS" : "Overhead"}
                </button>
              ))}
            </div>
          </div>
        ))}
      </div>

      <div className="border-t border-border/60 pt-3 flex items-center justify-between text-sm">
        <span className="text-muted-foreground">Receipt total</span>
        <span className="font-display text-lg font-semibold">${total.toFixed(2)}</span>
      </div>
    </section>
  );
}
