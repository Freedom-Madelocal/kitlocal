import { useMemo, useState } from "react";
import { Lightbulb, Wand2, Copy, Check } from "lucide-react";
import { nudgesForUpcomingMarkets, type NudgeSuggestion } from "@/lib/mock-data";
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog";
import { toast } from "sonner";

export function ContentNudges() {
  const nudges = useMemo(() => nudgesForUpcomingMarkets(), []);
  const [active, setActive] = useState<NudgeSuggestion | null>(null);
  const [copied, setCopied] = useState(false);

  const copyCaption = async () => {
    if (!active) return;
    const text = `${active.draftCaption}\n\n${active.hashtags.join(" ")}`;
    try {
      await navigator.clipboard.writeText(text);
      setCopied(true);
      toast.success("Caption copied");
      setTimeout(() => setCopied(false), 1500);
    } catch {
      toast.error("Couldn't copy");
    }
  };

  return (
    <section className="neu-card p-5 md:p-6 flex flex-col gap-4">
      <div className="flex items-start gap-3">
        <div className="neu-card-sm h-10 w-10 grid place-items-center shrink-0">
          <Lightbulb className="h-4 w-4 text-accent" />
        </div>
        <div className="min-w-0">
          <h2 className="font-display text-lg md:text-xl font-semibold">Actionable Content Nudges</h2>
          <p className="text-xs md:text-sm text-muted-foreground">
            AI-generated ideas tied to your upcoming markets.
          </p>
        </div>
      </div>

      <div className="grid gap-3">
        {nudges.map((n) => (
          <article key={n.id} className="neu-inset p-4 flex flex-col md:flex-row md:items-center gap-3">
            <div className="min-w-0 flex-1">
              <div className="text-[11px] uppercase tracking-wider text-accent font-semibold">
                In {n.daysAway} day{n.daysAway === 1 ? "" : "s"}
              </div>
              <p className="text-sm text-foreground/90 mt-1">{n.message}</p>
            </div>
            <button
              onClick={() => setActive(n)}
              className="neu-pressable px-4 py-2 text-xs font-medium text-primary flex items-center gap-2 shrink-0 self-start md:self-auto"
            >
              <Wand2 className="h-3.5 w-3.5" /> One-Click Draft
            </button>
          </article>
        ))}
      </div>

      <Dialog open={!!active} onOpenChange={(o) => !o && setActive(null)}>
        <DialogContent className="max-w-lg">
          <DialogHeader>
            <DialogTitle className="font-display">Draft Post</DialogTitle>
            <DialogDescription>Ready to publish — tweak, copy, and paste.</DialogDescription>
          </DialogHeader>
          {active && (
            <div className="flex flex-col gap-4">
              <div className="neu-inset p-4 text-sm leading-relaxed whitespace-pre-wrap">
                {active.draftCaption}
              </div>
              <div className="flex flex-wrap gap-1.5">
                {active.hashtags.map((h) => (
                  <span key={h} className="text-xs px-2 py-1 rounded-full bg-secondary text-secondary-foreground">
                    {h}
                  </span>
                ))}
              </div>
              <button
                onClick={copyCaption}
                className="neu-pressable px-4 py-2.5 text-sm font-medium text-primary flex items-center gap-2 self-end"
              >
                {copied ? <Check className="h-4 w-4" /> : <Copy className="h-4 w-4" />}
                {copied ? "Copied" : "Copy caption + tags"}
              </button>
            </div>
          )}
        </DialogContent>
      </Dialog>
    </section>
  );
}
