// UX display helper only — not a security mechanism.
// Actual rate limiting is enforced server-side in lib/actions/auth.ts.

export function formatLockoutTime(ms: number): string {
  const seconds = Math.ceil(ms / 1000)
  if (seconds < 60) return `${seconds}с`
  const minutes = Math.ceil(seconds / 60)
  if (minutes < 60) return `${minutes}мин`
  return `${Math.ceil(minutes / 60)}ч`
}
