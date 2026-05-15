// Cloud config — Supabase URL + anon key.
// Safe to commit: the anon key is a public JWT designed for client-side use,
// access is gated by RLS policies in the database itself.

window.CLOUD_CONFIG = {
  SUPABASE_URL: 'https://dqburpynxfhkqdtqdxer.supabase.co',
  SUPABASE_ANON_KEY: 'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6ImRxYnVycHlueGZoa3FkdHFkeGVyIiwicm9sZSI6ImFub24iLCJpYXQiOjE3Nzg3MjQ3NTIsImV4cCI6MjA5NDMwMDc1Mn0._7gExuMR_ubHAzaMvUqXtTTHSTB_N3XmXAcyun_5WYM',
  ASSETS_BUCKET: 'assets',
};
