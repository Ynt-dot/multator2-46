'use server'

import { headers } from 'next/headers'
import { createClient } from '@/lib/supabase/server'
import { captureError } from '@/lib/logger'
import type { UserType } from '@/lib/types'

const MAX_ATTEMPTS = 5
const WINDOW_MS = 15 * 60 * 1000 // 15 min

// ── Rate limiting ─────────────────────────────────────────────────────────────
// Uses Upstash Redis when UPSTASH_REDIS_REST_URL is set (required on Vercel
// where each serverless instance has its own memory). Falls back to in-memory
// for local development.

type RateLimitResult = { allowed: boolean; remainingMs: number }

async function checkRateLimit(key: string): Promise<RateLimitResult> {
  if (process.env.UPSTASH_REDIS_REST_URL && process.env.UPSTASH_REDIS_REST_TOKEN) {
    const { Redis } = await import('@upstash/redis')
    const { Ratelimit } = await import('@upstash/ratelimit')
    const redis = new Redis({
      url: process.env.UPSTASH_REDIS_REST_URL,
      token: process.env.UPSTASH_REDIS_REST_TOKEN,
    })
    const ratelimit = new Ratelimit({
      redis,
      limiter: Ratelimit.slidingWindow(MAX_ATTEMPTS, '15 m'),
      prefix: 'rl:auth',
    })
    const { success, reset } = await ratelimit.limit(key)
    return { allowed: success, remainingMs: success ? 0 : reset - Date.now() }
  }

  return inMemoryCheck(key)
}

// In-memory fallback — adequate for single-instance / local dev only.
interface AttemptRecord {
  count: number
  resetAt: number
}
const attemptMap = new Map<string, AttemptRecord>()

function inMemoryCheck(key: string): RateLimitResult {
  const now = Date.now()
  const record = attemptMap.get(key)

  if (!record || record.resetAt <= now) {
    attemptMap.set(key, { count: 1, resetAt: now + WINDOW_MS })
    return { allowed: true, remainingMs: 0 }
  }

  if (record.count >= MAX_ATTEMPTS) {
    return { allowed: false, remainingMs: record.resetAt - now }
  }

  record.count += 1
  return { allowed: true, remainingMs: 0 }
}

function clearInMemoryAttempts(key: string): void {
  attemptMap.delete(key)
}

// ── Actions ───────────────────────────────────────────────────────────────────

export type AuthActionResult =
  | { success: true }
  | { error: string; rateLimited?: boolean; remainingMs?: number }

export async function loginAction(
  email: string,
  password: string,
): Promise<AuthActionResult> {
  const key = `login:${email.toLowerCase()}`
  const limit = await checkRateLimit(key)

  if (!limit.allowed) {
    return { error: 'rate_limited', rateLimited: true, remainingMs: limit.remainingMs }
  }

  try {
    const supabase = await createClient()
    const { error } = await supabase.auth.signInWithPassword({ email, password })

    if (error) return { error: 'auth_failed' }

    clearInMemoryAttempts(key)
    return { success: true }
  } catch (err) {
    captureError(err, { action: 'login' })
    return { error: 'auth_failed' }
  }
}

export async function signupAction(
  email: string,
  password: string,
  username: string,
  userType: UserType,
): Promise<AuthActionResult> {
  const key = `signup:${email.toLowerCase()}`
  const limit = await checkRateLimit(key)

  if (!limit.allowed) {
    return { error: 'rate_limited', rateLimited: true, remainingMs: limit.remainingMs }
  }

  try {
    const headersList = await headers()
    const host = headersList.get('x-forwarded-host') || headersList.get('host') || 'localhost:3000'
    const proto = headersList.get('x-forwarded-proto') || 'http'
    const redirectUrl =
      process.env.NEXT_PUBLIC_DEV_SUPABASE_REDIRECT_URL ||
      `${proto}://${host}/auth/callback`

    const supabase = await createClient()
    const { error } = await supabase.auth.signUp({
      email,
      password,
      options: {
        emailRedirectTo: redirectUrl,
        data: { username, user_type: userType },
      },
    })

    if (error) return { error: 'signup_failed' }

    clearInMemoryAttempts(key)
    return { success: true }
  } catch (err) {
    captureError(err, { action: 'signup' })
    return { error: 'signup_failed' }
  }
}
