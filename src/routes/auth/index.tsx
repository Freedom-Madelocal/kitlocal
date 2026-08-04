import { createFileRoute, useNavigate } from "@tanstack/react-router";
import { useEffect, useState } from "react";
import { Loader2, LogIn, Store } from "lucide-react";
import { isMadeLocalConfigured } from "@/lib/madelocal-supabase";
import {
  signInWithMadeLocal,
  useMadeLocalSession,
  displayNameFor,
} from "@/lib/madelocal-session";

export const Route = createFileRoute("/auth")({
  ssr: false,
  head: () => ({
    meta: [
      { title: "Sign in with MadeLocal — Seller Command Center" },
      {
        name: "description",
        content:
          "Sign in with your MadeLocal seller account to sync marketplace revenue into your Command Center.",
      },
      { property: "og:title", content: "Sign in with MadeLocal" },
      {
        property: "og:description",
        content:
          "Use your MadeLocal seller account to open the Command Center and sync revenue.",
      },
    ],
  }),
  component: AuthPage,
});

function AuthPage() {
  const navigate = useNavigate();
  const session = useMadeLocalSession();
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [error, setError] = useState<string | null>(null);
  const [busy, setBusy] = useState(false);

  useEffect(() => {
    if (session.user) navigate({ to: "/", replace: true });
  }, [session.user, navigate]);

  const submit = async (e: React.FormEvent) => {
    e.preventDefault();
    setBusy(true);
    setError(null);
    const { error: err } = await signInWithMadeLocal(email.trim(), password);
    setBusy(false);
    if (err) setError(err);
  };

  return (
    <main className="min-h-screen grid place-items-center bg-background px-4 py-12">
      <div className="w-full max-w-md flex flex-col gap-6">
        <div className="flex items-center gap-3">
          <div className="neu-card-sm h-11 w-11 grid place-items-center">
            <Store className="h-5 w-5 text-primary" />
          </div>
          <div>
            <h1 className="font-display text-2xl font-semibold leading-tight">
              Sign in with MadeLocal
            </h1>
            <p className="text-sm text-muted-foreground -mt-0.5">
              Use your MadeLocal seller account
            </p>
          </div>
        </div>

        {!isMadeLocalConfigured ? (
          <div className="neu-card p-5 text-sm text-muted-foreground">
            <p className="font-medium text-foreground mb-1">Connection not configured yet</p>
            <p>
              The shared MadeLocal project URL and publishable key haven&rsquo;t been added to
              this app yet. Until then the Command Center runs on demo data.
            </p>
          </div>
        ) : session.loading ? (
          <div className="neu-card p-6 flex items-center gap-3 text-sm text-muted-foreground">
            <Loader2 className="h-4 w-4 animate-spin" /> Checking your MadeLocal session…
          </div>
        ) : session.user ? (
          <div className="neu-card p-6 text-sm">
            Signed in as{" "}
            <span className="font-semibold">{displayNameFor(session.user)}</span>. Taking you
            to your Command Center…
          </div>
        ) : (
          <form onSubmit={submit} className="neu-card p-5 md:p-6 flex flex-col gap-4">
            <label className="flex flex-col gap-1.5">
              <span className="text-xs font-semibold uppercase tracking-wider text-muted-foreground">
                Email
              </span>
              <input
                type="email"
                required
                autoComplete="email"
                value={email}
                onChange={(e) => setEmail(e.target.value)}
                className="neu-inset rounded-xl bg-transparent px-3 py-2.5 text-sm outline-none"
                placeholder="you@example.com"
              />
            </label>
            <label className="flex flex-col gap-1.5">
              <span className="text-xs font-semibold uppercase tracking-wider text-muted-foreground">
                Password
              </span>
              <input
                type="password"
                required
                autoComplete="current-password"
                value={password}
                onChange={(e) => setPassword(e.target.value)}
                className="neu-inset rounded-xl bg-transparent px-3 py-2.5 text-sm outline-none"
                placeholder="••••••••"
              />
            </label>

            {error && (
              <p className="text-sm text-destructive" role="alert">
                {error}
              </p>
            )}

            <button
              type="submit"
              disabled={busy}
              className="neu-pressable flex items-center justify-center gap-2 px-4 py-3 text-sm font-semibold text-primary disabled:opacity-60"
            >
              {busy ? (
                <Loader2 className="h-4 w-4 animate-spin" />
              ) : (
                <LogIn className="h-4 w-4" />
              )}
              {busy ? "Signing in…" : "Sign in"}
            </button>
            <p className="text-xs text-muted-foreground">
              Same credentials as the MadeLocal marketplace. On
              kit.buymadelocal.com you&rsquo;ll be signed in automatically.
            </p>
          </form>
        )}
      </div>
    </main>
  );
}
