import { marketRevenueTotal } from "@/lib/mock-data";

export function ProfitSummary({ cogs, overhead }: { cogs: number; overhead: number }) {
  const revenue = marketRevenueTotal();
  const netProfit = revenue - cogs - overhead;
  const margin = revenue > 0 ? (netProfit / revenue) * 100 : 0;

  return (
    <section className="neu-card p-6 md:p-8 flex items-center justify-between gap-6 flex-wrap">
      <div className="min-w-0 flex-1">
        <div className="text-[11px] md:text-xs uppercase tracking-[0.14em] text-accent font-semibold">
          Profit summary
        </div>
        <h2 className="font-display text-3xl md:text-5xl font-semibold mt-2 leading-tight">
          You kept{" "}
          <span className="text-primary">${netProfit.toFixed(2)}</span>
        </h2>
        <p className="text-sm md:text-base text-muted-foreground mt-2">
          After <span className="font-medium text-foreground">${cogs.toFixed(2)}</span> in ingredients & packaging and{" "}
          <span className="font-medium text-foreground">${overhead.toFixed(2)}</span> in business expenses.
        </p>
      </div>
      <div className="neu-inset bg-primary/95 text-primary-foreground px-6 py-5 rounded-2xl flex flex-col items-center shrink-0">
        <div className="font-display text-3xl md:text-4xl font-bold">{margin.toFixed(1)}%</div>
        <div className="text-[11px] uppercase tracking-wider mt-1 opacity-80">margin</div>
      </div>
    </section>
  );
}
