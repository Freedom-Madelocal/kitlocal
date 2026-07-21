import { useMemo, useState } from "react";
import {
  addDays,
  addMonths,
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
import { ChevronLeft, ChevronRight, MapPin, Clock, CalendarDays } from "lucide-react";
import { markets, type Market } from "@/lib/mock-data";
import { MarketDetailDrawer } from "./MarketDetailDrawer";
import { cn } from "@/lib/utils";

export function CalendarView() {
  const [mode, setMode] = useState<"week" | "month">("month");
  const [cursor, setCursor] = useState(new Date());
  const [selected, setSelected] = useState<Market | null>(null);

  const upcoming = useMemo(
    () =>
      [...markets]
        .filter((m) => new Date(m.date) >= addDays(new Date(), -1))
        .sort((a, b) => new Date(a.date).getTime() - new Date(b.date).getTime()),
    [],
  );

  return (
    <div className="flex flex-col gap-6">
      <div className="flex items-start justify-between flex-wrap gap-3">
        <div>
          <h1 className="text-2xl md:text-3xl font-display font-semibold">Market Calendar</h1>
          <p className="text-sm text-muted-foreground mt-1">
            Plan your week, prep the right quantities, and stay in touch with market admins.
          </p>
        </div>
        <div className="neu-inset p-1 flex items-center gap-1">
          {(["week", "month"] as const).map((m) => (
            <button
              key={m}
              onClick={() => setMode(m)}
              className={cn(
                "px-3 py-1.5 text-xs font-medium rounded-lg capitalize transition-all",
                mode === m ? "neu-card-sm text-primary" : "text-muted-foreground",
              )}
            >
              {m}
            </button>
          ))}
        </div>
      </div>

      {mode === "month" ? (
        <MonthGrid cursor={cursor} setCursor={setCursor} onPick={setSelected} />
      ) : (
        <WeekAgenda upcoming={upcoming} onPick={setSelected} />
      )}

      <UpcomingList upcoming={upcoming} onPick={setSelected} />

      <MarketDetailDrawer market={selected} onClose={() => setSelected(null)} />
    </div>
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
          <div key={d} className="text-center py-1">{d}</div>
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

function WeekAgenda({ upcoming, onPick }: { upcoming: Market[]; onPick: (m: Market) => void }) {
  const week = upcoming.slice(0, 7);
  return (
    <section className="neu-card p-4 md:p-6 flex flex-col gap-3">
      <h2 className="font-display text-lg font-semibold flex items-center gap-2">
        <CalendarDays className="h-4 w-4" /> This week's agenda
      </h2>
      {week.length === 0 && (
        <div className="text-sm text-muted-foreground">No markets scheduled.</div>
      )}
      {week.map((m) => (
        <MarketRow key={m.id} m={m} onPick={onPick} />
      ))}
    </section>
  );
}

function UpcomingList({ upcoming, onPick }: { upcoming: Market[]; onPick: (m: Market) => void }) {
  return (
    <section className="neu-card p-4 md:p-6 flex flex-col gap-3">
      <h2 className="font-display text-lg font-semibold">All upcoming markets</h2>
      {upcoming.map((m) => (
        <MarketRow key={m.id} m={m} onPick={onPick} />
      ))}
    </section>
  );
}

function MarketRow({ m, onPick }: { m: Market; onPick: (m: Market) => void }) {
  const date = new Date(m.date);
  return (
    <button
      onClick={() => onPick(m)}
      className="neu-inset p-4 text-left flex items-center gap-4 hover:bg-secondary/40 transition-colors"
    >
      <div className="neu-card-sm h-14 w-14 shrink-0 grid place-items-center flex-col">
        <div className="text-[10px] uppercase text-muted-foreground">{format(date, "MMM")}</div>
        <div className="font-display text-xl font-bold text-primary leading-none">{format(date, "d")}</div>
      </div>
      <div className="min-w-0 flex-1">
        <div className="font-semibold text-sm truncate">{m.name}</div>
        <div className="text-xs text-muted-foreground flex items-center gap-3 mt-1 flex-wrap">
          <span className="flex items-center gap-1"><MapPin className="h-3 w-3" />{m.location}</span>
          <span className="flex items-center gap-1"><Clock className="h-3 w-3" />{m.startTime}–{m.endTime}</span>
        </div>
      </div>
      <div className="text-xs text-primary font-medium shrink-0 hidden sm:block">View →</div>
    </button>
  );
}
