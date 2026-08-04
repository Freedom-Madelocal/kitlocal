import { useEffect, useState } from "react";
import type { Session, User } from "@supabase/supabase-js";
import { getMadeLocalClient, isMadeLocalConfigured } from "./madelocal-supabase";

export type MadeLocalSessionState = {
  user: User | null;
  session: Session | null;
  loading: boolean;
  configured: boolean;
};

/**
 * Live MadeLocal session. Resolves from the shared cookie (Mechanism 1) when
 * present, otherwise from a sign-in performed on /auth.
 */
export function useMadeLocalSession(): MadeLocalSessionState {
  const [state, setState] = useState<MadeLocalSessionState>({
    user: null,
    session: null,
    loading: isMadeLocalConfigured,
    configured: isMadeLocalConfigured,
  });

  useEffect(() => {
    const supabase = getMadeLocalClient();
    if (!supabase) {
      setState({ user: null, session: null, loading: false, configured: false });
      return;
    }

    let active = true;
    supabase.auth.getSession().then(({ data }) => {
      if (!active) return;
      setState({
        user: data.session?.user ?? null,
        session: data.session ?? null,
        loading: false,
        configured: true,
      });
    });

    const { data: sub } = supabase.auth.onAuthStateChange((event, session) => {
      if (event !== "SIGNED_IN" && event !== "SIGNED_OUT" && event !== "USER_UPDATED") return;
      setState({
        user: session?.user ?? null,
        session: session ?? null,
        loading: false,
        configured: true,
      });
    });

    return () => {
      active = false;
      sub.subscription.unsubscribe();
    };
  }, []);

  return state;
}

export async function signInWithMadeLocal(email: string, password: string) {
  const supabase = getMadeLocalClient();
  if (!supabase) {
    return { error: "MadeLocal connection isn't configured yet." };
  }
  const { error } = await supabase.auth.signInWithPassword({ email, password });
  return { error: error?.message ?? null };
}

export async function signOutMadeLocal() {
  const supabase = getMadeLocalClient();
  if (!supabase) return;
  await supabase.auth.signOut();
}

/** Best display name for the signed-in MadeLocal user. */
export function displayNameFor(user: User | null): string | null {
  if (!user) return null;
  const meta = user.user_metadata ?? {};
  return (
    (meta['business_name'] as string | undefined) ??
    (meta['full_name'] as string | undefined) ??
    (meta['name'] as string | undefined) ??
    user.email ??
    null
  );
}
