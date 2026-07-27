import { marketRevenueTotal } from "@/lib/mock-data";

export function ProfitSummary({
  cogs,
  overhead,
  addedRevenue = 0,
  madeLocalRevenue = 0,
}: {
  cogs: number;
  overhead: number;
  addedRevenue?: number;
  madeLocalRevenue?: number;
}) {
  const markets = marketRevenueTotal();
  const revenue = markets + addedRevenue + madeLocalRevenue;
  const netProfit = revenue - cogs - overhead;
  const margin = revenue > 0 ? (netProfit / revenue) * 100 : 0;

  const fmt = (n: number) => `$${n.toFixed(2)}`;

  return (
    <section className="neu-card p-6 md:p-8 flex flex-col gap-5">
      <div className="flex items-center justify-between gap-6 flex-wrap">
        <div className="min-w-0 flex-1">
          <div className="text-[11px] md:text-xs uppercase tracking-[0.14em] text-accent font-semibold">
            Profit summary
          </div>
          <h2 className="font-display text-3xl md:text-5xl font-semibold mt-2 leading-tight">
            You kept <span className="text-primary">{fmt(netProfit)}</span>
          </h2>
          <p className="text-sm md:text-base text-muted-foreground mt-2">
            After <span className="font-medium text-foreground">{fmt(cogs)}</span> in ingredients & packaging and{" "}
            <span className="font-medium text-foreground">{fmt(overhead)}</span> in business expenses.
          </p>
        </div>
        <div className="neu-inset bg-primary/95 text-primary-foreground px-6 py-5 rounded-2xl flex flex-col items-center shrink-0">
          <div className="font-display text-3xl md:text-4xl font-bold">{margin.toFixed(1)}%</div>
          <div className="text-[11px] uppercase tracking-wider mt-1 opacity-80">margin</div>
        </div>
      </div>
      <div className="grid grid-cols-3 gap-2 md:gap-3 pt-4 border-t border-border/60">
        <BreakdownCell label="Markets" value={fmt(markets)} />
        <BreakdownCell label="Manual sources" value={fmt(addedRevenue)} />
        <BreakdownCell
          label="MadeLocal"
          value={fmt(madeLocalRevenue)}
          dim={madeLocalRevenue === 0}
        />
      </div>
    </section>
  );
}

function BreakdownCell({ label, value, dim }: { label: string; value: string; dim?: boolean }) {
  return (
    <div className="flex flex-col gap-0.5">
      <div className="text-[10px] md:text-[11px] uppercase tracking-wider text-muted-foreground">
        {label}
      </div>
      <div
        className={
          "font-display text-lg md:text-xl font-semibold " +
          (dim ? "text-muted-foreground" : "text-foreground")
        }
      >
        {value}
      </div>
    </div>
  );
}
