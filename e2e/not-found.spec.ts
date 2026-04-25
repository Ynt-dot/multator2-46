import { test, expect } from '@playwright/test'
import { mockSupabaseAnon } from './helpers/mock-supabase'

/**
 * Verify that dynamic routes render the not-found UI when the resource is
 * missing. The check is on DOM content — the profile and work pages are
 * 'use client' components that call notFound() after SWR resolves to null,
 * so the initial HTTP response is 200 (the page skeleton) and the 404 UI
 * appears after client-side data fetching completes.
 */

test.beforeEach(async ({ page }) => {
  await mockSupabaseAnon(page)
})

// ---------------------------------------------------------------------------
// Profile not-found
// ---------------------------------------------------------------------------
test('/profile/[username]: несуществующий пользователь показывает 404-страницу', async ({ page }) => {
  await page.goto('/profile/zzz_nonexistent_user_404_xyz')

  // not-found.tsx shows "Пользователь не найден" (ru locale)
  await expect(
    page.getByRole('heading', { name: /пользователь не найден|user not found/i }),
  ).toBeVisible({ timeout: 8000 })
})

test('/profile/[username]: 404-страница профиля содержит ссылку на главную', async ({ page }) => {
  await page.goto('/profile/zzz_nonexistent_user_404_xyz')

  await expect(
    page.getByRole('heading', { name: /пользователь не найден|user not found/i }),
  ).toBeVisible({ timeout: 8000 })

  await expect(page.locator('a[href="/"]').last()).toBeVisible()
})

// ---------------------------------------------------------------------------
// Work not-found
// ---------------------------------------------------------------------------
test('/work/[id]: несуществующая работа показывает 404-страницу', async ({ page }) => {
  // Nil UUID — guaranteed not to exist
  await page.goto('/work/00000000-0000-0000-0000-000000000000')

  await expect(
    page.getByRole('heading', { name: /работа не найдена|work not found/i }),
  ).toBeVisible({ timeout: 8000 })
})

test('/work/[id]: 404-страница работы содержит ссылку на главную', async ({ page }) => {
  await page.goto('/work/00000000-0000-0000-0000-000000000000')

  await expect(
    page.getByRole('heading', { name: /работа не найдена|work not found/i }),
  ).toBeVisible({ timeout: 8000 })

  await expect(page.locator('a[href="/"]').last()).toBeVisible()
})
