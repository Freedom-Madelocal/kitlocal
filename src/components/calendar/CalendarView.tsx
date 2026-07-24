import { useMemo, useState } from "react";
import {
  addMonths,
  differenceInCalendarDays,
  eachDayOfInterval,
  endOfMonth,
  endOfWeek,
  format,
  isSameDay,
  isSameMonth,
  startOfMonth,
  startOfWeek,
  subMonths,
} from "date-fns";
import { CalendarDays, ChevronLeft, ChevronRight, ChevronRight as ArrowRight } from "lucide-react";
import { markets, type Market } from "@/lib/mock-data";
import { MarketDetailDrawer } from "./MarketDetailDrawer";
import { cn } from "@/lib/utils";

type Status = { label: string; className: string };

function statusFor(m: Market): Status {
  const days = differenceInCalendarDays(new Date(m.date), new Date());
  if (days <= 3) return { label: "Needs a post", className: "bg-accent/15 text-accent" };
  if (days <= 7) return { label: "Ready", className: "bg-primary/15 text-primary" };
  return { label: "Needs prep", className: "bg-muted text-muted-foreground" };
}

export function CalendarView() {
  const [mode, setMode] = useState<"week" | "month">("week");
  const [cursor, setCursor] = useState(new Date());
  const [selected, setSelected] = useState<Market | null>(null);

  const sorted = useMemo(
    () =>
      [...markets]
        .filter((m) => differenceInCalendarDays(new Date(m.date), new Date()) >= -1)
        .sort((a, b) => new Date(a.date).getTime() - new Date(b.date).getTime()),
    [],
  );

  const next = sorted[0];
  const thisWeek = sorted.filter(
    (m) => differenceInCalendarDays(new Date(m.date), new Date()) <= 7,
  );
  const comingNext = sorted.filter(
    (m) => differenceInCalendarDays(new Date(m.date), new Date()) > 7,
  );

  return (
    <div className="flex flex-col gap-8">
      <header className="flex items-start justify-between gap-4 flex-wrap">
        <div>
          <h1 className="font-display text-4xl md:text-5xl font-semibold tracking-tight">
            Your market week
          </h1>
          <p className="text-sm md:text-base text-muted-foreground mt-2">
            Keep your bake, promotion, and market plans in one place.
          </p>
        </div>
        <div className="neu-inset p-1 flex items-center gap-1 shrink-0">
          {(["week", "month"] as const).map((m) => (
            <button
              key={m}
              onClick={() => setMode(m)}
              className={cn(
                "px-4 py-2 text-xs font-semibold rounded-lg capitalize transition-all",
                mode === m
                  ? "bg-primary text-primary-foreground"
                  : "text-muted-foreground hover:text-foreground",
              )}
            >
              {m}
            </button>
          ))}
        </div>
      </header>

      {/* Next up hero */}
      {next && (
        <section className="neu-card p-5 md:p-7">
          <div className="flex items-center gap-4 md:gap-6 flex-wrap md:flex-nowrap">
            <div className="neu-inset h-16 w-16 md:h-20 md:w-20 grid place-items-center shrink-0">
              <CalendarDays className="h-7 w-7 md:h-8 md:w-8 text-accent" />
            </div>
            <div className="min-w-0 flex-1">
              <div className="text-[11px] md:text-xs uppercase tracking-[0.14em] text-accent font-semibold">
                Next up
              </div>
              <h2 className="font-display text-2xl md:text-3xl font-semibold mt-1 truncate">
                {next.name}
              </h2>
              <p className="text-sm text-muted-foreground mt-1">
                {format(new Date(next.date), "EEEE, MMMM d")} · {next.startTime}–{next.endTime} · {next.location}
              </p>
              <div className="mt-3">
                <span
                  className={cn(
                    "inline-flex items-center text-[11px] font-medium px-2.5 py-1 rounded-full",
                    statusFor(next).className,
                  )}
                >
                  {statusFor(next).label}
                </span>
              </div>
            </div>
            <div className="flex flex-col items-stretch md:items-end gap-2 w-full md:w-auto shrink-0">
              <button
                onClick={() => setSelected(next)}
                className="neu-pressable bg-primary text-primary-foreground hover:bg-primary/90 px-5 py-3 text-sm font-semibold rounded-xl"
              >
                Plan this market
              </button>
              <button
                onClick={() => setSelected(next)}
                className="text-sm text-primary font-medium hover:underline md:text-right"
              >
                Open market
              </button>
            </div>
          </div>
        </section>
      )}

      {mode === "month" && (
        <MonthGrid cursor={cursor} setCursor={setCursor} onPick={setSelected} />
      )}

      {/* This week */}
      {thisWeek.length > 0 && (
        <section className="flex flex-col gap-3">
          <h3 className="font-display text-xl md:text-2xl font-semibold text-primary">This week.</h3>
          <div className="flex flex-col gap-3">
            {thisWeek.map((m) => (
              <MarketRow key={m.id} m={m} onPick={setSelected} />
            ))}
          </div>
        </section>
      )}

      {/* Coming next */}
      {comingNext.length > 0 && (
        <section className="flex flex-col gap-3">
          <h3 className="font-display text-xl md:text-2xl font-semibold text-primary">Coming next</h3>
          <div className="flex flex-col gap-3">
            {comingNext.map((m) => (
              <MarketRow key={m.id} m={m} onPick={setSelected} />
            ))}
          </div>
        </section>
      )}

      <MarketDetailDrawer market={selected} onClose={() => setSelected(null)} />
    </div>
  );
}

function MarketRow({ m, onPick }: { m: Market; onPick: (m: Market) => void }) {
  const date = new Date(m.date);
  const status = statusFor(m);
  return (
    <button
      onClick={() => onPick(m)}
      className="neu-card p-4 md:p-5 text-left grid grid-cols-[auto_1fr_auto] md:grid-cols-[auto_1fr_auto_auto] items-center gap-4 md:gap-5 hover:translate-y-[-1px] transition-transform"
    >
      <div className="neu-inset h-14 w-14 shrink-0 grid place-items-center flex-col">
        <div className="text-[10px] uppercase text-muted-foreground font-medium">
          {format(date, "MMM")}
        </div>
        <div className="font-display text-xl font-bold text-primary leading-none">
          {format(date, "d")}
        </div>
      </div>
      <div className="min-w-0">
        <div className="font-display text-lg font-semibold truncate">{m.name}</div>
        <div className="text-xs md:text-sm text-muted-foreground mt-0.5 truncate">
          {m.startTime}–{m.endTime} · {m.location}
        </div>
      </div>
      <span
        className={cn(
          "hidden md:inline-flex items-center text-[11px] font-medium px-2.5 py-1 rounded-full shrink-0",
          status.className,
        )}
      >
        {status.label}
      </span>
      <div className="text-sm text-primary font-semibold shrink-0 flex items-center gap-1">
        <span className="hidden sm:inline">Open market</span>
        <ArrowRight className="h-4 w-4" />
      </div>
    </button>
  );
}

function MonthGrid({
  cursor,
  setCursor,
  onPick,
}: {
  cursor: Date;
  setCursor: (d: Date) => void;
  onPick: (m: Market) => void;
}) {
  const start = startOfWeek(startOfMonth(cursor));
  const end = endOfWeek(endOfMonth(cursor));
  const days = eachDayOfInterval({ start, end });

  return (
    <section className="neu-card p-4 md:p-6">
      <div className="flex items-center justify-between mb-4">
        <button
          onClick={() => setCursor(subMonths(cursor, 1))}
          className="neu-pressable h-9 w-9 grid place-items-center"
          aria-label="Previous month"
        >
          <ChevronLeft className="h-4 w-4" />
        </button>
        <h2 className="font-display text-lg font-semibold">{format(cursor, "MMMM yyyy")}</h2>
        <button
          onClick={() => setCursor(addMonths(cursor, 1))}
          className="neu-pressable h-9 w-9 grid place-items-center"
          aria-label="Next month"
        >
          <ChevronRight className="h-4 w-4" />
        </button>
      </div>
      <div className="grid grid-cols-7 gap-1.5 text-[11px] text-muted-foreground uppercase tracking-wider mb-2">
        {["Sun", "Mon", "Tue", "Wed", "Thu", "Fri", "Sat"].map((d) => (
          <div key={d} className="text-center py-1">
            {d}
          </div>
        ))}
      </div>
      <div className="grid grid-cols-7 gap-1.5">
        {days.map((d) => {
          const dayMarkets = markets.filter((m) => isSameDay(new Date(m.date), d));
          const outside = !isSameMonth(d, cursor);
          const isToday = isSameDay(d, new Date());
          return (
            <div
              key={d.toISOString()}
              className={cn(
                "min-h-[70px] md:min-h-[92px] p-1.5 rounded-xl flex flex-col gap-1",
                outside ? "opacity-40" : "",
                isToday ? "neu-inset" : "bg-transparent",
              )}
            >
              <div className={cn("text-[11px] font-medium", isToday && "text-primary")}>
                {format(d, "d")}
              </div>
              <div className="flex flex-col gap-1 min-w-0">
                {dayMarkets.map((m) => (
                  <button
                    key={m.id}
                    onClick={() => onPick(m)}
                    className="text-left text-[10px] md:text-[11px] font-medium px-1.5 py-1 rounded-md bg-primary/10 text-primary hover:bg-primary/20 truncate"
                    title={m.name}
                  >
                    {m.name}
                  </button>
                ))}
              </div>
            </div>
          );
        })}
      </div>
    </section>
  );
}
