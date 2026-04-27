import type { Page } from '@playwright/test'

/**
 * Simulates an unauthenticated state: no session cookie, all REST queries
 * return empty arrays. Call this before page.goto() so routes are registered
 * before requests fire.
 */
export async function mockSupabaseAnon(page: Page): Promise<void> {
  // No active session
  await page.route('**/auth/v1/user', route =>
    route.fulfill({ status: 401, json: { error: 'not_authenticated' } }),
  )
  // All DB queries return empty — pages render empty-state UI or trigger notFound()
  await page.route('**/rest/v1/**', route =>
    route.fulfill({
      status: 200,
      contentType: 'application/json',
      body: '[]',
      headers: { 'Content-Range': '*/0' },
    }),
  )
}

/**
 * Makes the auth token endpoint return "invalid credentials" (HTTP 400).
 * Register before mockSupabaseAnon so this handler fires first for token requests.
 */
export async function mockLoginError(page: Page): Promise<void> {
  await page.route('**/auth/v1/token*', route =>
    route.fulfill({
      status: 400,
      json: { error: 'invalid_grant', error_description: 'Invalid login credentials' },
    }),
  )
}
