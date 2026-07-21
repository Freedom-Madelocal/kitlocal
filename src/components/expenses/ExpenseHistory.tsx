import { format } from "date-fns";
import { pastReceipts } from "@/lib/mock-data";

export function ExpenseHistory() {
  return (
    <section className="neu-card p-5 md:p-6 flex flex-col gap-3">
      <div>
        <h2 className="font-display text-lg font-semibold">Recent Receipts</h2>
        <p className="text-xs text-muted-foreground">Everything you've scanned this month.</p>
      </div>

      <div className="flex flex-col gap-2.5">
        {pastReceipts.map((r) => {
          const cogs = r.items.filter((i) => i.category === "cogs").reduce((s, i) => s + i.amount, 0);
          const overhead = r.items.filter((i) => i.category === "overhead").reduce((s, i) => s + i.amount, 0);
          return (
            <div key={r.id} className="neu-inset p-4 flex items-center gap-4">
              <div className="neu-card-sm h-12 w-12 shrink-0 grid place-items-center flex-col">
                <div className="text-[9px] uppercase text-muted-foreground">{format(new Date(r.date), "MMM")}</div>
                <div className="font-display text-lg font-bold text-primary leading-none">
                  {format(new Date(r.date), "d")}
                </div>
              </div>
              <div className="min-w-0 flex-1">
                <div className="font-semibold text-sm truncate">{r.vendor}</div>
                <div className="text-[11px] text-muted-foreground mt-0.5">
                  <span className="text-primary font-medium">${cogs.toFixed(2)} COGS</span>
                  {" · "}
                  <span className="text-accent font-medium">${overhead.toFixed(2)} Overhead</span>
                </div>
              </div>
              <div className="font-display text-lg font-semibold shrink-0">${r.total.toFixed(2)}</div>
            </div>
          );
        })}
      </div>
    </section>
  );
}
