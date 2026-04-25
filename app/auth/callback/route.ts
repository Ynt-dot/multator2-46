import { createClient } from '@/lib/supabase/server'
import { NextResponse } from 'next/server'

// Only allow relative internal paths to prevent open redirect attacks
function sanitizeNext(next: string | null): string {
  if (!next) return '/'
  // Must start with / but not // (protocol-relative) and contain only safe chars
  if (/^\/[a-zA-Z0-9/_\-?=&#%]*$/.test(next)) return next
  return '/'
}

export async function GET(request: Request) {
  const { searchParams, origin } = new URL(request.url)
  const code = searchParams.get('code')
  const next = sanitizeNext(searchParams.get('next'))

  if (code && code.length > 0) {
    const supabase = await createClient()
    const { error } = await supabase.auth.exchangeCodeForSession(code)
    if (!error) {
      return NextResponse.redirect(`${origin}${next}`)
    }
  }

  return NextResponse.redirect(`${origin}/auth/error`)
}
