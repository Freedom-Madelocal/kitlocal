import { useState } from "react";
import { Sparkles, Loader2, Link2 } from "lucide-react";
import { Textarea } from "@/components/ui/textarea";
import { analyzePostMock, type PostAnalysis } from "@/lib/mock-data";
import { ReportCard } from "./ReportCard";

export function PostAnalyzer() {
  const [input, setInput] = useState(
    "Fresh from the oven this morning — a 24-hour cold-fermented sourdough with a crackling crust. Swipe to see the crumb ✨",
  );
  const [loading, setLoading] = useState(false);
  const [report, setReport] = useState<PostAnalysis | null>(null);

  const analyze = () => {
    if (!input.trim()) return;
    setLoading(true);
    setReport(null);
    setTimeout(() => {
      setReport(analyzePostMock(input));
      setLoading(false);
    }, 900);
  };

  return (
    <section className="neu-card p-5 md:p-6 flex flex-col gap-4">
      <div className="flex items-start gap-3">
        <div className="neu-card-sm h-10 w-10 grid place-items-center shrink-0">
          <Sparkles className="h-4 w-4 text-accent" />
        </div>
        <div className="min-w-0">
          <h2 className="font-display text-lg md:text-xl font-semibold">Post Analyzer & Content Coach</h2>
          <p className="text-xs md:text-sm text-muted-foreground">
            Paste a TikTok or Instagram link, or drop in your draft caption.
          </p>
        </div>
      </div>

      <div className="neu-inset p-3 md:p-4">
        <div className="flex items-center gap-2 text-xs text-muted-foreground mb-2">
          <Link2 className="h-3.5 w-3.5" />
          Post URL or draft text
        </div>
        <Textarea
          value={input}
          onChange={(e) => setInput(e.target.value)}
          rows={4}
          placeholder="https://instagram.com/p/... or paste your caption draft"
          className="bg-transparent border-0 shadow-none focus-visible:ring-0 resize-none p-0 text-sm"
        />
      </div>

      <div className="flex items-center justify-between gap-3">
        <div className="text-[11px] text-muted-foreground">
          {input.trim().length} chars · analysis is simulated
        </div>
        <button
          onClick={analyze}
          disabled={loading || !input.trim()}
          className="neu-pressable px-5 py-2.5 text-sm font-medium text-primary disabled:opacity-50 flex items-center gap-2"
        >
          {loading ? <Loader2 className="h-4 w-4 animate-spin" /> : <Sparkles className="h-4 w-4" />}
          {loading ? "Analyzing…" : "Analyze Post"}
        </button>
      </div>

      {report && <ReportCard report={report} />}
    </section>
  );
}
