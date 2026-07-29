import { useState } from "react";
import { Sparkles, CalendarDays, Receipt, Menu, X } from "lucide-react";
import { cn } from "@/lib/utils";
import { Header } from "./Header";
import { MarketingHub } from "@/components/marketing/MarketingHub";
import { CalendarView } from "@/components/calendar/CalendarView";
import { ExpensesView } from "@/components/expenses/ExpensesView";
import { sellers, type Seller } from "@/lib/mock-data";

export type TabKey = "marketing" | "calendar" | "expenses";

const tabs = [
  { key: "marketing" as const, label: "Marketing Hub", icon: Sparkles },
  { key: "calendar" as const, label: "Market Calendar", icon: CalendarDays },
  { key: "expenses" as const, label: "Expenses & Profit", icon: Receipt },
];

export function AppShell() {
  const [tab, setTab] = useState<TabKey>("marketing");
  const seller: Seller = sellers[0];
  const [mobileNavOpen, setMobileNavOpen] = useState(false);

  return (
    <div className="min-h-screen w-full bg-background text-foreground">
      <div className="flex min-h-screen">
        {/* Desktop side rail */}
        <aside className="hidden md:flex w-64 shrink-0 flex-col gap-4 border-r border-border/40 px-5 py-6">
          <BrandMark />
          <nav className="mt-4 flex flex-col gap-3">
            {tabs.map((t) => {
              const Icon = t.icon;
              const active = tab === t.key;
              return (
                <button
                  key={t.key}
                  onClick={() => setTab(t.key)}
                  className={cn(
                    "flex items-center gap-3 rounded-2xl px-4 py-3 text-left text-sm font-medium transition-all",
                    active
                      ? "neu-inset text-primary"
                      : "neu-pressable text-foreground/80 hover:text-primary",
                  )}
                >
                  <Icon className="h-4 w-4 shrink-0" />
                  <span className="truncate">{t.label}</span>
                </button>
              );
            })}
          </nav>
          <div className="mt-auto text-xs text-muted-foreground px-2">
            MadeLocal · v1.0
          </div>
        </aside>

        {/* Main */}
        <div className="flex-1 flex flex-col min-w-0">
          <Header
            seller={seller}

            mobileButton={
              <button
                className="md:hidden neu-pressable h-10 w-10 grid place-items-center"
                onClick={() => setMobileNavOpen((v) => !v)}
                aria-label="Toggle navigation"
              >
                {mobileNavOpen ? <X className="h-4 w-4" /> : <Menu className="h-4 w-4" />}
              </button>
            }
          />

          <main className="flex-1 px-4 md:px-8 py-6 md:py-8 pb-28 md:pb-10 max-w-6xl w-full mx-auto">
            {tab === "marketing" && <MarketingHub seller={seller} />}
            {tab === "calendar" && <CalendarView />}
            {tab === "expenses" && <ExpensesView />}
          </main>
        </div>
      </div>

      {/* Mobile bottom nav */}
      <nav className="md:hidden fixed bottom-4 left-4 right-4 z-30 neu-card p-2 flex justify-around">
        {tabs.map((t) => {
          const Icon = t.icon;
          const active = tab === t.key;
          return (
            <button
              key={t.key}
              onClick={() => setTab(t.key)}
              className={cn(
                "flex-1 flex flex-col items-center gap-1 rounded-xl py-2.5 text-[11px] font-medium transition-all",
                active ? "neu-inset text-primary" : "text-foreground/70",
              )}
            >
              <Icon className="h-4 w-4" />
              <span className="truncate">{t.label.split(" ")[0]}</span>
            </button>
          );
        })}
      </nav>
    </div>
  );
}

function BrandMark() {
  return (
    <div className="flex items-center gap-3">
      <div className="neu-card-sm h-11 w-11 grid place-items-center">
        <span className="font-display text-lg text-primary font-bold">M</span>
      </div>
      <div className="min-w-0">
        <div className="font-display text-lg font-semibold leading-tight">MadeLocal</div>
        <div className="text-[11px] text-muted-foreground -mt-0.5">Seller Command Center</div>
      </div>
    </div>
  );
}
