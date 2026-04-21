const MAX_ATTEMPTS = 5
const LOCKOUT_DURATIONS_MS = [60_000, 300_000, 900_000, 3_600_000] // 1m, 5m, 15m, 1h

interface RateLimitState {
  attempts: number
  lockedUntil: number | null
}

function getKey(namespace: string): string {
  return `rl_${namespace}`
}

function readState(namespace: string): RateLimitState {
  try {
    const raw = localStorage.getItem(getKey(namespace))
    if (raw) return JSON.parse(raw)
  } catch {}
  return { attempts: 0, lockedUntil: null }
}

function writeState(namespace: string, state: RateLimitState): void {
  try {
    localStorage.setItem(getKey(namespace), JSON.stringify(state))
  } catch {}
}

export function getRateLimitStatus(namespace: string): {
  locked: boolean
  remainingMs: number
  attemptsLeft: number
} {
  const state = readState(namespace)
  const now = Date.now()

  if (state.lockedUntil && state.lockedUntil > now) {
    return { locked: true, remainingMs: state.lockedUntil - now, attemptsLeft: 0 }
  }

  return {
    locked: false,
    remainingMs: 0,
    attemptsLeft: Math.max(0, MAX_ATTEMPTS - state.attempts),
  }
}

export function recordFailedAttempt(namespace: string): {
  locked: boolean
  remainingMs: number
} {
  const state = readState(namespace)
  const now = Date.now()

  // Clear expired lockout
  if (state.lockedUntil && state.lockedUntil <= now) {
    state.lockedUntil = null
    state.attempts = 0
  }

  state.attempts += 1

  if (state.attempts >= MAX_ATTEMPTS) {
    const lockoutIndex = Math.min(
      Math.floor(state.attempts / MAX_ATTEMPTS) - 1,
      LOCKOUT_DURATIONS_MS.length - 1
    )
    const duration = LOCKOUT_DURATIONS_MS[lockoutIndex]
    state.lockedUntil = now + duration
    writeState(namespace, state)
    return { locked: true, remainingMs: duration }
  }

  writeState(namespace, state)
  return { locked: false, remainingMs: 0 }
}

export function resetRateLimit(namespace: string): void {
  try {
    localStorage.removeItem(getKey(namespace))
  } catch {}
}

export function formatLockoutTime(ms: number): string {
  const seconds = Math.ceil(ms / 1000)
  if (seconds < 60) return `${seconds}с`
  const minutes = Math.ceil(seconds / 60)
  if (minutes < 60) return `${minutes}мин`
  return `${Math.ceil(minutes / 60)}ч`
}
