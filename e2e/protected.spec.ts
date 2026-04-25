import { test, expect } from '@playwright/test'
import { mockSupabaseAnon } from './helpers/mock-supabase'

/**
 * Verify that pages which require authentication redirect an anonymous visitor
 * to the login page instead of rendering protected content.
 */

test.beforeEach(async ({ page }) => {
  await mockSupabaseAnon(page)
})

test('/settings перенаправляет неавторизованного на /auth/login', async ({ page }) => {
  await page.goto('/settings')
  await page.waitForURL('**/auth/login', { timeout: 5000 })
  expect(page.url()).toContain('/auth/login')
})

test('/feedback перенаправляет неавторизованного на /auth/login', async ({ page }) => {
  await page.goto('/feedback')
  await page.waitForURL('**/auth/login', { timeout: 5000 })
  expect(page.url()).toContain('/auth/login')
})

test('/editor перенаправляет неавторизованного на /auth/login', async ({ page }) => {
  await page.goto('/editor')
  await page.waitForURL('**/auth/login', { timeout: 5000 })
  expect(page.url()).toContain('/auth/login')
})
