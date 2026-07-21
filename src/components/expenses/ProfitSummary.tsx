import { TrendingUp, Package, Building2, DollarSign } from "lucide-react";
import { marketRevenueTotal } from "@/lib/mock-data";

export function ProfitSummary({ cogs, overhead }: { cogs: number; overhead: number }) {
  const revenue = marketRevenueTotal();
  const netProfit = revenue - cogs - overhead;
  const margin = revenue > 0 ? (netProfit / revenue) * 100 : 0;

  const cards = [
    { label: "Total Revenue", value: revenue, icon: DollarSign, tone: "text-primary" },
    { label: "COGS", value: cogs, icon: Package, tone: "text-foreground" },
    { label: "Overhead", value: overhead, icon: Building2, tone: "text-foreground" },
  ];

  return (
    <section className="neu-card p-5 md:p-6 flex flex-col gap-5">
      <div className="flex items-start justify-between gap-3 flex-wrap">
        <div>
          <h2 className="font-display text-lg md:text-xl font-semibold">True Profit</h2>
          <p className="text-xs text-muted-foreground">Across all tracked markets & receipts</p>
        </div>
        <div className="neu-inset px-4 py-2 flex items-center gap-2">
          <TrendingUp className="h-4 w-4 text-primary" />
          <span className="font-display text-2xl font-bold text-primary">{margin.toFixed(1)}%</span>
          <span className="text-[11px] text-muted-foreground uppercase tracking-wider">margin</span>
        </div>
      </div>

      <div className="grid grid-cols-1 sm:grid-cols-3 gap-3">
        {cards.map((c) => {
          const Icon = c.icon;
          return (
            <div key={c.label} className="neu-inset p-4">
              <div className="flex items-center gap-2 text-[11px] text-muted-foreground uppercase tracking-wider">
                <Icon className="h-3.5 w-3.5" /> {c.label}
              </div>
              <div className={`mt-2 font-display text-2xl font-bold ${c.tone}`}>
                ${c.value.toFixed(2)}
              </div>
            </div>
          );
        })}
      </div>

      <div className="neu-inset p-4 flex items-center justify-between">
        <div>
          <div className="text-[11px] text-muted-foreground uppercase tracking-wider">Net True Profit</div>
          <div className="font-display text-3xl font-bold text-primary mt-1">
            ${netProfit.toFixed(2)}
          </div>
        </div>
        <div className="text-xs text-muted-foreground text-right max-w-[180px]">
          Revenue minus cost of goods sold and overhead — the number that actually pays you.
        </div>
      </div>
    </section>
  );
}
