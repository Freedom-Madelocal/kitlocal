import { createClient, type SupabaseClient } from "@supabase/supabase-js";

/**
 * Client for the SHARED MadeLocal Supabase project.
 *
 * kitlocal does not have its own database. It authenticates against — and reads
 * sales from — the same project the MadeLocal marketplace uses, so there is one
 * user identity and one source of sales truth.
 *
 * Session storage is a cookie scoped to the parent domain (Mechanism 1). Once
 * kitlocal is served from kit.buymadelocal.com, a session created on
 * app.buymadelocal.com is already present here with no redirect or code
 * exchange. On other hosts (lovable.app preview, localhost) the cookie is
 * host-only, so the /auth sign-in form is the entry path there.
 */

const SUPABASE_URL = MADELOCAL_SUPABASE_URL || undefined;
const SUPABASE_ANON_KEY = MADELOCAL_SUPABASE_ANON_KEY || undefined;

export const SHARED_COOKIE_DOMAIN = ".buymadelocal.com";

export const isMadeLocalConfigured = Boolean(SUPABASE_URL && SUPABASE_ANON_KEY);


function cookieDomainAttr(): string {
  if (typeof window === "undefined") return "";
  const host = window.location.hostname;
  return host === "buymadelocal.com" || host.endsWith(SHARED_COOKIE_DOMAIN)
    ? `; Domain=${SHARED_COOKIE_DOMAIN}`
    : "";
}

/** Cookie-backed storage so the session can be shared across *.buymadelocal.com. */
const cookieStorage = {
  getItem(key: string): string | null {
    if (typeof document === "undefined") return null;
    const match = document.cookie
      .split("; ")
      .find((c) => c.startsWith(`${encodeURIComponent(key)}=`));
    if (!match) return null;
    try {
      return decodeURIComponent(match.slice(match.indexOf("=") + 1));
    } catch {
      return null;
    }
  },
  setItem(key: string, value: string): void {
    if (typeof document === "undefined") return;
    const secure = window.location.protocol === "https:" ? "; Secure" : "";
    document.cookie =
      `${encodeURIComponent(key)}=${encodeURIComponent(value)}` +
      `; Path=/; Max-Age=${60 * 60 * 24 * 30}; SameSite=Lax${secure}${cookieDomainAttr()}`;
  },
  removeItem(key: string): void {
    if (typeof document === "undefined") return;
    document.cookie =
      `${encodeURIComponent(key)}=; Path=/; Max-Age=0; SameSite=Lax${cookieDomainAttr()}`;
  },
};

let client: SupabaseClient | null = null;

/** Returns the shared client, or null when the project credentials aren't set yet. */
export function getMadeLocalClient(): SupabaseClient | null {
  if (!isMadeLocalConfigured) return null;
  if (!client) {
    client = createClient(SUPABASE_URL!, SUPABASE_ANON_KEY!, {
      auth: {
        persistSession: true,
        autoRefreshToken: true,
        detectSessionInUrl: true,
        flowType: "pkce",
        storage: cookieStorage,
      },
    });
  }
  return client;
}
