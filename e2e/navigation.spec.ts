import { test, expect } from '@playwright/test'
import { mockSupabaseAnon } from './helpers/mock-supabase'

test.beforeEach(async ({ page }) => {
  await mockSupabaseAnon(page)
})

// ---------------------------------------------------------------------------
// Главная страница
// ---------------------------------------------------------------------------
test('главная: отображает hero-заголовок', async ({ page }) => {
  await page.goto('/')
  await expect(page.getByRole('heading', { name: /создавай\. анимируй\. делись/i })).toBeVisible()
})

test('главная: карточки-ссылки на разделы присутствуют', async ({ page }) => {
  await page.goto('/')
  await expect(page.locator('a[href="/oldschool"]').first()).toBeVisible()
  await expect(page.locator('a[href="/sandbox"]').first()).toBeVisible()
  await expect(page.locator('a[href="/hall-of-fame"]').first()).toBeVisible()
})

test('главная: шапка содержит ссылки навигации', async ({ page }) => {
  await page.goto('/')
  // Logo link
  await expect(page.locator('header a[href="/"]').first()).toBeVisible()
  // Desktop nav links
  await expect(page.locator('header a[href="/oldschool"]')).toBeVisible()
  await expect(page.locator('header a[href="/sandbox"]')).toBeVisible()
})

// ---------------------------------------------------------------------------
// Страница «Олдскул»
// ---------------------------------------------------------------------------
test('олдскул: страница загружается и показывает заголовок', async ({ page }) => {
  await page.goto('/oldschool')
  await expect(page.getByRole('heading', { level: 1 })).toBeVisible()
})

test('олдскул: отображает фильтры сортировки', async ({ page }) => {
  await page.goto('/oldschool')
  // Sort tabs (popular / newest)
  await expect(page.getByRole('tab').first()).toBeVisible()
  await expect(page.getByRole('combobox')).toBeVisible()
})

// ---------------------------------------------------------------------------
// Страница «Песочница»
// ---------------------------------------------------------------------------
test('песочница: страница загружается и показывает заголовок', async ({ page }) => {
  await page.goto('/sandbox')
  await expect(page.getByRole('heading', { level: 1 })).toBeVisible()
})

test('песочница: вкладки сортировки переключаются', async ({ page }) => {
  await page.goto('/sandbox')
  const tabs = page.getByRole('tab')
  await expect(tabs.first()).toBeVisible()
  // Click the second tab and check it becomes selected
  await tabs.nth(1).click()
  await expect(tabs.nth(1)).toHaveAttribute('data-state', 'active')
})
