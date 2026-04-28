import { createBrowserClient } from '@supabase/ssr'
import { fetchWithTimeout } from './fetch-with-timeout'

function getConfig() {
  const envUrl = process.env.NEXT_PUBLIC_SUPABASE_URL
  const envKey = process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY
  if (envUrl && envKey) return { url: envUrl, key: envKey }

  // Fallback: read from window.__supabaseConfig injected by layout.tsx at runtime
  if (typeof window !== 'undefined' && (window as any).__supabaseConfig) {
    const { url, key } = (window as any).__supabaseConfig as { url: string; key: string }
    if (url && key) return { url, key }
  }

  return { url: envUrl ?? '', key: envKey ?? '' }
}

// createBrowserClient already implements its own global singleton internally
export function createClient() {
  const { url, key } = getConfig()
  return createBrowserClient(url, key, { global: { fetch: fetchWithTimeout } })
}
