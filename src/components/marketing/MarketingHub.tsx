import { useMemo, useRef, useState } from "react";
import { CalendarDays, MapPin, Cookie, Camera, ChevronRight, Pencil, ShieldCheck } from "lucide-react";
import { format } from "date-fns";
import { markets, type Seller } from "@/lib/mock-data";
import { PostAnalyzer } from "./PostAnalyzer";
import { ContentNudges } from "./ContentNudges";

type IdeaKey = "location" | "bake" | "bts";

const ideas: { key: IdeaKey; icon: typeof MapPin; title: string; body: string }[] = [
  { key: "location", icon: MapPin, title: "Announce where to find me", body: "Share your market location and details." },
  { key: "bake", icon: Cookie, title: "Show this week's bake", body: "Highlight a featured item or new flavor." },
  { key: "bts", icon: Camera, title: "Behind the scenes", body: "Share a peek at your process or prep." },
];

export function MarketingHub({ seller: _seller }: { seller: Seller }) {
  const next = useMemo(
    () =>
      [...markets].sort(
        (a, b) => new Date(a.date).getTime() - new Date(b.date).getTime(),
      )[0],
    [],
  );
  const [showAnalyzer, setShowAnalyzer] = useState(false);
  const analyzerRef = useRef<HTMLDivElement | null>(null);

  const openAnalyzer = () => {
    setShowAnalyzer(true);
    requestAnimationFrame(() =>
      analyzerRef.current?.scrollIntoView({ behavior: "smooth", block: "start" }),
    );
  };

  const nextDate = new Date(next.date);

  return (
    <div className="flex flex-col gap-8">
      <header>
        <h1 className="font-display text-4xl md:text-5xl font-semibold tracking-tight">Marketing</h1>
        <p className="text-sm md:text-base text-muted-foreground mt-2">
          Create simple, timely posts for your next market.
        </p>
      </header>

      {/* Next market hero */}
      <section className="neu-card p-5 md:p-7">
        <div className="flex items-center gap-4 md:gap-6 flex-wrap md:flex-nowrap">
          <div className="neu-inset h-16 w-16 md:h-20 md:w-20 grid place-items-center shrink-0">
            <CalendarDays className="h-7 w-7 md:h-8 md:w-8 text-accent" />
          </div>
          <div className="min-w-0 flex-1">
            <div className="text-[11px] md:text-xs uppercase tracking-[0.14em] text-accent font-semibold">
              Next market
            </div>
            <h2 className="font-display text-2xl md:text-3xl font-semibold mt-1 truncate">
              {next.name}
            </h2>
            <p className="text-sm text-muted-foreground mt-1">
              {format(nextDate, "EEEE, MMMM d")} · {next.startTime}–{next.endTime} · {next.location}
            </p>
            <div className="mt-3">
              <span className="inline-flex items-center text-[11px] font-medium px-2.5 py-1 rounded-full bg-accent/15 text-accent">
                Needs a post
              </span>
            </div>
          </div>
          <div className="flex flex-col items-stretch md:items-end gap-2 w-full md:w-auto shrink-0">
            <button
              onClick={openAnalyzer}
              className="neu-pressable bg-primary text-primary-foreground hover:bg-primary/90 px-5 py-3 text-sm font-semibold rounded-xl"
              style={{ boxShadow: "var(--shadow-neu-sm)" }}
            >
              Create this week's post
            </button>
            <button
              onClick={openAnalyzer}
              className="text-sm text-primary font-medium hover:underline md:text-right"
            >
              View market details
            </button>
          </div>
        </div>
      </section>

      {/* Idea starters */}
      <section className="flex flex-col gap-4">
        <h3 className="font-display text-xl md:text-2xl font-semibold">Start with a simple idea.</h3>
        <div className="grid gap-4 md:grid-cols-3">
          {ideas.map((i) => {
            const Icon = i.icon;
            return (
              <button
                key={i.key}
                onClick={openAnalyzer}
                className="neu-card p-5 text-left flex items-start gap-4 group"
              >
                <div className="neu-inset h-12 w-12 grid place-items-center shrink-0">
                  <Icon className="h-5 w-5 text-primary" />
                </div>
                <div className="min-w-0 flex-1">
                  <div className="font-semibold text-sm md:text-base leading-snug">{i.title}</div>
                  <p className="text-xs md:text-sm text-muted-foreground mt-1">{i.body}</p>
                </div>
                <ChevronRight className="h-4 w-4 text-muted-foreground shrink-0 mt-1 group-hover:text-primary transition-colors" />
              </button>
            );
          })}
        </div>
      </section>

      {/* Improve caption row */}
      <section className="neu-card p-5 md:p-6 flex items-center gap-4 flex-wrap">
        <div className="neu-inset h-12 w-12 grid place-items-center shrink-0">
          <Pencil className="h-5 w-5 text-primary" />
        </div>
        <div className="min-w-0 flex-1">
          <div className="font-semibold text-sm md:text-base">Already wrote something?</div>
          <p className="text-xs md:text-sm text-muted-foreground mt-0.5">
            Improve a caption or social link.
          </p>
        </div>
        <button
          onClick={openAnalyzer}
          className="neu-pressable px-5 py-2.5 text-sm font-semibold text-primary"
        >
          Improve my caption
        </button>
        <div className="flex items-center gap-2 text-xs text-muted-foreground border-l border-border/60 pl-4 ml-2 hidden md:flex">
          <ShieldCheck className="h-4 w-4" />
          Nothing is posted automatically.
        </div>
      </section>

      {showAnalyzer && (
        <div ref={analyzerRef} className="flex flex-col gap-6 scroll-mt-6">
          <PostAnalyzer />
          <ContentNudges />
        </div>
      )}
    </div>
  );
}
