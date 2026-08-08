/**
 * Shared MadeLocal backend connection (option A: one backend, two frontends).
 *
 * Both values below are PUBLIC by design — the backend URL and the
 * publishable/anon key are already shipped in the MadeLocal frontend bundle.
 * Access control is Row Level Security on the seller's own rows, not key
 * secrecy. Nothing here is a service-role key; never put one in this file.
 *
 * Copy both values from the MadeLocal project's own environment config.
 * Environment variables win when present, so a deploy can override without a
 * code change.
 */

export const MADELOCAL_SUPABASE_URL: string =
  (import.meta.env['VITE_MADELOCAL_SUPABASE_URL'] as string | undefined) ??
  "https://kygqkcnrxxsauibhlvno.supabase.co";

export const MADELOCAL_SUPABASE_ANON_KEY: string =
  (import.meta.env['VITE_MADELOCAL_SUPABASE_ANON_KEY'] as string | undefined) ??
  "eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6Imt5Z3FrY25yeHhzYXVpYmhsdm5vIiwicm9sZSI6ImFub24iLCJpYXQiOjE3NjUyMTUwNjEsImV4cCI6MjA4MDc5MTA2MX0.rXa0Vp9JHAv_Iqg1dvrEG387pnlO59HqtY0zv1WiY2M";

