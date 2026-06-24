import { createClient, type SupabaseClient } from '@supabase/supabase-js'

export type Appointment = {
  id: string
  name: string
  phone: string
  email: string | null
  date: string
  time: string
  message: string | null
  status: 'pending' | 'confirmed' | 'cancelled'
  created_at: string
}

// Lazy singleton — only created on first call (runs client-side only).
// Do NOT call createClient at module level; it requires env vars that
// won't be present during the static build phase.
let _client: SupabaseClient | null = null

export function getSupabaseBrowser(): SupabaseClient {
  if (!_client) {
    const url = process.env.NEXT_PUBLIC_SUPABASE_URL
    const key = process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY
    if (!url) throw new Error('Missing env var: NEXT_PUBLIC_SUPABASE_URL — add it to .env.local')
    if (!key) throw new Error('Missing env var: NEXT_PUBLIC_SUPABASE_ANON_KEY — add it to .env.local')
    _client = createClient(url, key)
  }
  return _client
}
