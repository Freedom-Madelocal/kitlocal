import { useMemo, useState } from "react";
import { ReceiptDropzone } from "./ReceiptDropzone";
import { LineItemAllocator } from "./LineItemAllocator";
import { ProfitSummary } from "./ProfitSummary";
import { ExpenseHistory } from "./ExpenseHistory";
import { sampleReceipt, type ReceiptLineItem } from "@/lib/mock-data";

export function ExpensesView() {
  const [items, setItems] = useState<ReceiptLineItem[]>(sampleReceipt.items);
  const [vendor, setVendor] = useState<string>(sampleReceipt.vendor);
  const [scanned, setScanned] = useState(true);

  const totals = useMemo(() => {
    const cogs = items.filter((i) => i.category === "cogs").reduce((s, i) => s + i.amount, 0);
    const overhead = items.filter((i) => i.category === "overhead").reduce((s, i) => s + i.amount, 0);
    return { cogs, overhead };
  }, [items]);

  const onScan = (filename: string) => {
    setVendor(`Extracted from ${filename}`);
    setItems(sampleReceipt.items.map((i) => ({ ...i })));
    setScanned(true);
  };

  return (
    <div className="flex flex-col gap-6">
      <div>
        <h1 className="text-2xl md:text-3xl font-display font-semibold">Expenses & True Profit</h1>
        <p className="text-sm text-muted-foreground mt-1">
          Drop a receipt, split cost of goods from overhead, and watch your margin.
        </p>
      </div>

      <ProfitSummary cogs={totals.cogs} overhead={totals.overhead} />

      <div className="grid gap-6 lg:grid-cols-2">
        <ReceiptDropzone onScan={onScan} />
        {scanned && (
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
      </div>

      <ExpenseHistory />
    </div>
  );
}
