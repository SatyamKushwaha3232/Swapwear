import { createClient } from "@supabase/supabase-js";

const supabaseUrl = "https://mnrkfawqryzcyrpnzvzy.supabase.co";

const supabaseAnonKey =
  "eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6Im1ucmtmYXdxcnl6Y3lycG56dnp5Iiwicm9sZSI6ImFub24iLCJpYXQiOjE3Nzk1NDUwNjUsImV4cCI6MjA5NTEyMTA2NX0.dhc76xfBA_rKkrIitoKHdcV_20FeuONsittdfCtaZe4";

export const supabase = createClient(supabaseUrl, supabaseAnonKey, {
  auth: {
    persistSession: true,
    autoRefreshToken: true,
    detectSessionInUrl: true,
  },
});