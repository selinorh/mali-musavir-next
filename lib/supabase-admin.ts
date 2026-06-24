import { createClient } from '@supabase/supabase-js'

// Server-only: service role key bypasses Row Level Security.
// Never import this file in client components.
export function createAdminClient() {
  const url = process.env.NEXT_PUBLIC_SUPABASE_URL
  const key = process.env.SUPABASE_SERVICE_ROLE_KEY
  if (!url) throw new Error('Missing env var: NEXT_PUBLIC_SUPABASE_URL — add it to .env.local')
  if (!key) throw new Error('Missing env var: SUPABASE_SERVICE_ROLE_KEY — add it to .env.local')
  return createClient(url, key)
}
