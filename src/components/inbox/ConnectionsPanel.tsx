import { CheckCircle2, Clock, Loader2, ShieldCheck, Unplug } from "lucide-react";
import { platforms } from "@/lib/social-inbox-data";
import { useSocialConnections } from "@/lib/social-connections";
import { PlatformIcon } from "./PlatformIcon";

export function ConnectionsPanel({
  connections,
  connecting,
  connect,
  disconnect,
}: Pick<
  ReturnType<typeof useSocialConnections>,
  "connections" | "connecting" | "connect" | "disconnect"
>) {
  return (
    <section className="flex flex-col gap-4">
      <div>
        <h2 className="font-display text-2xl font-semibold">Connected accounts</h2>
        <p className="text-sm text-muted-foreground mt-1">
          Connect once and your recent comments and messages show up here.
        </p>
      </div>

      <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-3">
        {platforms.map((p) => {
          const state = connections[p.key];
          const isConnecting = connecting === p.key;
          const comingSoon = p.availability === "coming-soon";

          return (
            <div key={p.key} className="neu-card p-5 flex flex-col gap-3">
              <div className="flex items-start gap-3">
                <div className="neu-inset h-11 w-11 grid place-items-center shrink-0">
                  <PlatformIcon platform={p.key} className="h-5 w-5 text-primary" />
                </div>
                <div className="min-w-0 flex-1">
                  <div className="font-semibold truncate">{p.label}</div>
                  <p className="text-xs text-muted-foreground mt-0.5">{p.connectNote}</p>
                </div>
              </div>

              {state?.connected ? (
                <div className="flex items-center gap-1.5 text-xs font-medium text-primary">
                  <CheckCircle2 className="h-3.5 w-3.5" />
                  <span className="truncate">{state.accountLabel}</span>
                </div>
              ) : comingSoon ? (
                <div className="flex items-center gap-1.5 text-xs font-medium text-muted-foreground">
                  <Clock className="h-3.5 w-3.5" />
                  Coming soon
                </div>
              ) : (
                <p className="text-xs text-muted-foreground">{p.requirement}</p>
              )}

              <div className="mt-auto pt-1">
                {state?.connected ? (
                  <button
                    onClick={() => disconnect(p.key)}
                    className="neu-pressable w-full px-4 py-2.5 text-sm font-medium rounded-xl inline-flex items-center justify-center gap-2"
                  >
                    <Unplug className="h-3.5 w-3.5" />
                    Disconnect
                  </button>
                ) : (
                  <button
                    onClick={() => connect(p.key)}
                    disabled={comingSoon || isConnecting}
                    className="neu-pressable w-full bg-primary text-primary-foreground hover:bg-primary/90 disabled:opacity-40 disabled:hover:bg-primary px-4 py-2.5 text-sm font-semibold rounded-xl inline-flex items-center justify-center gap-2"
                    style={{ boxShadow: "var(--shadow-neu-sm)" }}
                  >
                    {isConnecting && <Loader2 className="h-3.5 w-3.5 animate-spin" />}
                    {isConnecting ? "Connecting…" : comingSoon ? "Not yet available" : `Connect ${p.label}`}
                  </button>
                )}
              </div>
            </div>
          );
        })}
      </div>

      <div className="neu-inset p-4 flex items-start gap-3 text-xs text-muted-foreground">
        <ShieldCheck className="h-4 w-4 text-primary shrink-0 mt-0.5" />
        <p>
          Preview mode: connections are simulated so you can try the flow. Real sign-in
          turns on once the Instagram and Facebook app finishes review — your login stays
          with the platform and we only ever store an access token on the server.
        </p>
      </div>
    </section>
  );
}
