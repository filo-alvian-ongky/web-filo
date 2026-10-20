"use client";

import { createBrowserClient } from "@supabase/ssr";
import { SUPABASE_KEY, SUPABASE_URL } from "./config";

let client = null;

/** Klien Supabase di browser (sesi login admin disimpan di cookie oleh @supabase/ssr) */
export function getBrowserSupabase() {
  if (!client) client = createBrowserClient(SUPABASE_URL, SUPABASE_KEY);
  return client;
}
