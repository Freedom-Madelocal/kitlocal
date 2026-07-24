import { useMemo, useState } from "react";
import { ShieldCheck } from "lucide-react";
import { ReceiptDropzone } from "./ReceiptDropzone";
import { LineItemAllocator } from "./LineItemAllocator";
import { ProfitSummary } from "./ProfitSummary";
import { ExpenseHistory } from "./ExpenseHistory";
import { sampleReceipt, type ReceiptLineItem } from "@/lib/mock-data";
import { cn } from "@/lib/utils";

const steps = [
  { n: 1, label: "Upload or take a photo" },
  { n: 2, label: "Review the items" },
  { n: 3, label: "Save your costs" },
] as const;

export function ExpensesView() {
  const [items, setItems] = useState<ReceiptLineItem[]>(sampleReceipt.items);
  const [vendor, setVendor] = useState<string>(sampleReceipt.vendor);
  const [step, setStep] = useState<1 | 2 | 3>(1);

  const totals = useMemo(() => {
    const cogs = items.filter((i) => i.category === "cogs").reduce((s, i) => s + i.amount, 0);
    const overhead = items.filter((i) => i.category === "overhead").reduce((s, i) => s + i.amount, 0);
    return { cogs, overhead };
  }, [items]);

  const onScan = (filename: string) => {
    setVendor(`Extracted from ${filename}`);
    setItems(sampleReceipt.items.map((i) => ({ ...i })));
    setStep(2);
  };

  return (
    <div className="flex flex-col gap-8">
      <header>
        <h1 className="font-display text-4xl md:text-5xl font-semibold tracking-tight">
          Expenses & true profit
        </h1>
        <p className="text-sm md:text-base text-muted-foreground mt-2">
          See what you earned after ingredients, packaging, and business expenses.
        </p>
      </header>

      <ProfitSummary cogs={totals.cogs} overhead={totals.overhead} />

      {/* Add a receipt */}
      <section className="neu-card p-5 md:p-7 flex flex-col gap-5">
        <div className="flex items-start justify-between gap-4 flex-wrap">
          <div className="min-w-0">
            <h2 className="font-display text-2xl md:text-3xl font-semibold">Add a receipt</h2>
            <p className="text-sm text-muted-foreground mt-1">
              Add a photo or file, review the items, then save your costs.
            </p>
          </div>
          <ol className="flex items-center gap-2 md:gap-3 flex-wrap">
            {steps.map((s, i) => {
              const active = step === s.n;
              const done = step > s.n;
              return (
                <li key={s.n} className="flex items-center gap-2 md:gap-3">
                  <div
                    className={cn(
                      "h-7 w-7 rounded-full grid place-items-center text-xs font-semibold shrink-0",
                      active
                        ? "bg-primary text-primary-foreground"
                        : done
                          ? "bg-primary/20 text-primary"
                          : "neu-inset text-muted-foreground",
                    )}
                  >
                    {s.n}
                  </div>
                  <span
                    className={cn(
                      "text-xs md:text-sm font-medium",
                      active ? "text-foreground" : "text-muted-foreground",
                    )}
                  >
                    {s.label}
                  </span>
                  {i < steps.length - 1 && (
                    <span className="hidden md:inline-block h-px w-6 bg-border" />
                  )}
                </li>
              );
            })}
          </ol>
        </div>

        <ReceiptDropzone onScan={onScan} />

        <div className="flex items-center gap-2 text-xs text-muted-foreground border-t border-border/60 pt-4">
          <ShieldCheck className="h-4 w-4 text-primary" />
          You review every item before it affects profit.
        </div>

        {step >= 2 && (
          <LineItemAllocator
            vendor={vendor}
            items={items}
            onToggle={(id) =>
              setItems((prev) =>
                prev.map((i) =>
                  i.id === id ? { ...i, category: i.category === "cogs" ? "overhead" : "cogs" } : i,
                ),
              )
            }
          />
        )}
      </section>

      <ExpenseHistory />
    </div>
  );
}
