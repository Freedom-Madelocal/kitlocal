import { useEffect, useState } from "react";
import { format } from "date-fns";
import { Sun, Cloud, CloudRain, MapPin, Clock, Mail, MessageSquare } from "lucide-react";
import {
  Sheet,
  SheetContent,
  SheetDescription,
  SheetHeader,
  SheetTitle,
} from "@/components/ui/sheet";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Input } from "@/components/ui/input";
import { Textarea } from "@/components/ui/textarea";
import type { Market } from "@/lib/mock-data";
import { toast } from "sonner";

const weatherIcons = { sun: Sun, cloud: Cloud, rain: CloudRain };

export function MarketDetailDrawer({
  market,
  onClose,
}: {
  market: Market | null;
  onClose: () => void;
}) {
  const [quantities, setQuantities] = useState<Record<string, number>>({});
  const [template, setTemplate] = useState<"electricity" | "late" | "booth">("electricity");
  const [subject, setSubject] = useState("");
  const [body, setBody] = useState("");

  useEffect(() => {
    if (!market) return;
    const q: Record<string, number> = {};
    market.prepSuggestions.forEach((p) => (q[p.item] = p.qty));
    setQuantities(q);
    applyTemplate("electricity", market);
    setTemplate("electricity");
  }, [market]);

  const applyTemplate = (t: "electricity" | "late" | "booth", m: Market) => {
    if (t === "electricity") {
      setSubject(`Electricity request — ${m.name} (${format(new Date(m.date), "MMM d")})`);
      setBody(
        `Hi ${m.name} team,\n\nJust confirming access to a 15A outlet at our booth for this Saturday's market — we run a warming station for baked goods.\n\nThanks so much,\nWildflower Sourdough Co.`,
      );
    } else if (t === "late") {
      setSubject(`Late arrival notice — ${m.name}`);
      setBody(
        `Hi team,\n\nOur bake is running a touch behind — we'll be arriving at ${m.name} at approximately 8:30 AM. We'll be set up before doors.\n\nAppreciate the heads up,\nWildflower Sourdough Co.`,
      );
    } else {
      setSubject(`Booth location check — ${m.name}`);
      setBody(
        `Hi,\n\nCould you confirm our booth number/location for ${format(new Date(m.date), "EEEE, MMM d")}? Trying to plan our load-in.\n\nThanks!\nWildflower Sourdough Co.`,
      );
    }
  };

  if (!market) return null;
  const W = weatherIcons[market.weather.icon];
  const totalRevenue = market.lastVisitSales.reduce((s, i) => s + i.revenue, 0);
  const totalSold = market.lastVisitSales.reduce((s, i) => s + i.sold, 0);

  return (
    <Sheet open={!!market} onOpenChange={(o) => !o && onClose()}>
      <SheetContent side="right" className="w-full sm:max-w-xl overflow-y-auto bg-background">
        <SheetHeader className="px-6">
          <SheetTitle className="font-display text-2xl">{market.name}</SheetTitle>
          <SheetDescription className="flex items-center gap-3 flex-wrap text-xs">
            <span className="flex items-center gap-1"><MapPin className="h-3 w-3" />{market.location}</span>
            <span className="flex items-center gap-1"><Clock className="h-3 w-3" />{format(new Date(market.date), "EEE MMM d")} · {market.startTime}–{market.endTime}</span>
          </SheetDescription>
        </SheetHeader>

        <div className="px-6 pb-8 pt-2 flex flex-col gap-5">
          {/* Weather + fee */}
          <div className="grid grid-cols-2 gap-3">
            <div className="neu-inset p-4 flex items-center gap-3">
              <W className="h-6 w-6 text-accent" />
              <div className="min-w-0">
                <div className="text-[11px] text-muted-foreground uppercase tracking-wider">Forecast</div>
                <div className="font-semibold text-sm">{market.weather.temp}°F · {market.weather.condition}</div>
              </div>
            </div>
            <div className="neu-inset p-4">
              <div className="text-[11px] text-muted-foreground uppercase tracking-wider">Booth Fee</div>
              <div className="font-semibold text-sm mt-1">${market.boothFee}</div>
            </div>
          </div>

          {/* Historical sales */}
          <section className="neu-card p-4">
            <h3 className="font-display text-base font-semibold mb-3">Historical Sales Recap</h3>
            <div className="flex flex-col gap-2">
              {market.lastVisitSales.map((s) => (
                <div key={s.item} className="flex items-center justify-between text-sm">
                  <span className="text-foreground/90">{s.item}</span>
                  <span className="text-muted-foreground text-xs">
                    <span className="font-medium text-foreground">{s.sold}</span> sold ·
                    <span className="text-primary font-semibold ml-1">${s.revenue}</span>
                  </span>
                </div>
              ))}
              <div className="border-t border-border/60 mt-2 pt-2 flex items-center justify-between text-sm font-semibold">
                <span>Total</span>
                <span>
                  <span className="text-muted-foreground text-xs font-normal mr-2">{totalSold} items</span>
                  <span className="text-primary">${totalRevenue}</span>
                </span>
              </div>
            </div>
          </section>

          {/* Prep estimator */}
          <section className="neu-card p-4">
            <div className="flex items-center justify-between mb-3">
              <h3 className="font-display text-base font-semibold">Smart Prep Estimator</h3>
              <span className="text-[10px] uppercase tracking-wider px-2 py-1 rounded-full bg-accent/15 text-accent font-semibold">
                Weather-adjusted
              </span>
            </div>
            <div className="flex flex-col gap-2.5">
              {market.prepSuggestions.map((p) => (
                <div key={p.item} className="flex items-center gap-3">
                  <div className="min-w-0 flex-1">
                    <div className="text-sm font-medium truncate">{p.item}</div>
                    {p.note && <div className="text-[11px] text-accent">{p.note}</div>}
                  </div>
                  <div className="neu-inset flex items-center gap-2 px-3 py-1.5">
                    <Input
                      type="number"
                      value={quantities[p.item] ?? p.qty}
                      onChange={(e) =>
                        setQuantities((q) => ({ ...q, [p.item]: Number(e.target.value) }))
                      }
                      className="w-16 h-7 bg-transparent border-0 shadow-none focus-visible:ring-0 p-0 text-right text-sm font-semibold"
                    />
                    <span className="text-xs text-muted-foreground shrink-0">{p.unit}</span>
                  </div>
                </div>
              ))}
            </div>
          </section>

          {/* Quick comms */}
          <section className="neu-card p-4">
            <h3 className="font-display text-base font-semibold mb-3">Market Admin Quick-Comms</h3>
            <Tabs
              value={template}
              onValueChange={(v) => {
                const t = v as "electricity" | "late" | "booth";
                setTemplate(t);
                applyTemplate(t, market);
              }}
            >
              <TabsList className="grid grid-cols-3 w-full">
                <TabsTrigger value="electricity">Electricity</TabsTrigger>
                <TabsTrigger value="late">Late arrival</TabsTrigger>
                <TabsTrigger value="booth">Booth check</TabsTrigger>
              </TabsList>
              <TabsContent value={template} className="mt-3 flex flex-col gap-2">
                <label className="text-[11px] text-muted-foreground uppercase tracking-wider">To</label>
                <Input value={market.adminEmail} readOnly className="neu-inset border-0" />
                <label className="text-[11px] text-muted-foreground uppercase tracking-wider">Subject</label>
                <Input value={subject} onChange={(e) => setSubject(e.target.value)} className="neu-inset border-0" />
                <label className="text-[11px] text-muted-foreground uppercase tracking-wider">Message</label>
                <Textarea
                  value={body}
                  onChange={(e) => setBody(e.target.value)}
                  rows={7}
                  className="neu-inset border-0 resize-none"
                />
                <div className="flex gap-2 justify-end mt-1">
                  <button
                    onClick={() => toast.success("Message copied to draft", { description: "Ready to send in your mail client." })}
                    className="neu-pressable px-4 py-2 text-xs font-medium flex items-center gap-2"
                  >
                    <MessageSquare className="h-3.5 w-3.5" /> Copy to SMS
                  </button>
                  <button
                    onClick={() => {
                      const href = `mailto:${market.adminEmail}?subject=${encodeURIComponent(subject)}&body=${encodeURIComponent(body)}`;
                      window.location.href = href;
                    }}
                    className="neu-pressable px-4 py-2 text-xs font-medium text-primary flex items-center gap-2"
                  >
                    <Mail className="h-3.5 w-3.5" /> Send email
                  </button>
                </div>
              </TabsContent>
            </Tabs>
          </section>
        </div>
      </SheetContent>
    </Sheet>
  );
}
