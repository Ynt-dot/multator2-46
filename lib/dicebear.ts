/**
 * DiceBear API integration
 * Docs: https://www.dicebear.com/how-to-use/http-api/
 *
 * Generates deterministic SVG avatars based on a seed (username).
 * No API key required. Free to use.
 *
 * Base URL: https://api.dicebear.com/9.x/{style}/svg?seed={seed}
 */

const DICEBEAR_BASE = 'https://api.dicebear.com/9.x'

/**
 * Returns a DiceBear avatar URL for the given seed.
 * Uses the `pixel-art` style — a fitting choice for an animation platform.
 */
export function getDicebearUrl(seed: string, style = 'pixel-art'): string {
  const encodedSeed = encodeURIComponent(seed)
  return `${DICEBEAR_BASE}/${style}/svg?seed=${encodedSeed}`
}

/**
 * Returns the user's avatar URL:
 * - Uses the uploaded avatar if available
 * - Falls back to a DiceBear generated avatar based on username
 */
export function getAvatarUrl(username: string, avatarUrl?: string | null): string {
  if (avatarUrl) return avatarUrl
  return getDicebearUrl(username)
}
