import { CheckCircle2, AlertCircle, TrendingUp } from "lucide-react";
import type { PostAnalysis } from "@/lib/mock-data";
import { Badge } from "@/components/ui/badge";

export function ReportCard({ report }: { report: PostAnalysis }) {
  const scoreColor =
    report.hookScore >= 80 ? "text-primary" : report.hookScore >= 60 ? "text-accent" : "text-destructive";
  return (
    <div className="neu-inset p-5 flex flex-col gap-5">
      <div className="grid grid-cols-1 md:grid-cols-[auto_1fr] gap-5 items-center">
        <div className="neu-card-sm h-28 w-28 md:h-32 md:w-32 mx-auto md:mx-0 grid place-items-center flex-col">
          <div className={`font-display text-4xl md:text-5xl font-bold ${scoreColor}`}>
            {report.hookScore}
          </div>
          <div className="text-[10px] uppercase tracking-wider text-muted-foreground">Hook Score</div>
        </div>
        <div className="min-w-0">
          <div className="flex items-center gap-2 flex-wrap">
            <Badge className="bg-primary text-primary-foreground hover:bg-primary">
              <TrendingUp className="h-3 w-3 mr-1" /> {report.engagement} engagement
            </Badge>
            <span className="text-xs text-muted-foreground">AI Report Card</span>
          </div>
          <p className="mt-2 text-sm text-foreground/90 leading-relaxed">{report.summary}</p>
        </div>
      </div>

      <div className="grid md:grid-cols-2 gap-4">
        <div className="neu-card-sm p-4">
          <div className="flex items-center gap-2 mb-2">
            <CheckCircle2 className="h-4 w-4 text-primary" />
            <h4 className="text-sm font-semibold">Key Positives</h4>
          </div>
          <ul className="space-y-2 text-sm text-foreground/85">
            {report.positives.map((p, i) => (
              <li key={i} className="flex gap-2">
                <span className="text-primary mt-1.5 h-1.5 w-1.5 rounded-full bg-primary shrink-0" />
                <span>{p}</span>
              </li>
            ))}
          </ul>
        </div>
        <div className="neu-card-sm p-4">
          <div className="flex items-center gap-2 mb-2">
            <AlertCircle className="h-4 w-4 text-accent" />
            <h4 className="text-sm font-semibold">Missed Opportunities</h4>
          </div>
          <ul className="space-y-2 text-sm text-foreground/85">
            {report.missed.map((p, i) => (
              <li key={i} className="flex gap-2">
                <span className="text-accent mt-1.5 h-1.5 w-1.5 rounded-full bg-accent shrink-0" />
                <span>{p}</span>
              </li>
            ))}
          </ul>
        </div>
      </div>
    </div>
  );
}
