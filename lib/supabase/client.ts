import { createBrowserClient } from '@supabase/ssr'
import { fetchWithTimeout } from './fetch-with-timeout'

// createBrowserClient already implements its own global singleton internally
export function createClient() {
  return createBrowserClient(
    process.env.NEXT_PUBLIC_SUPABASE_URL!,
    process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY!,
    { global: { fetch: fetchWithTimeout } },
  )
}
