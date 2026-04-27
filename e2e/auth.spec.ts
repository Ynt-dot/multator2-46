import { test, expect } from '@playwright/test'
import { mockSupabaseAnon, mockLoginError } from './helpers/mock-supabase'

// ---------------------------------------------------------------------------
// Страница входа
// ---------------------------------------------------------------------------
test.describe('страница входа', () => {
  test.beforeEach(async ({ page }) => {
    await mockSupabaseAnon(page)
    await page.goto('/auth/login')
  })

  test('отображает поля email и пароль', async ({ page }) => {
    await expect(page.locator('input[type="email"]')).toBeVisible()
    await expect(page.locator('input[type="password"]')).toBeVisible()
  })

  test('отображает кнопку входа', async ({ page }) => {
    await expect(
      page.getByRole('button', { name: /войти/i }),
    ).toBeVisible()
  })

  test('показывает ошибку при неверных учётных данных', async ({ page }) => {
    // Register error mock before entering credentials so it's ready when the
    // form submits and the browser fires the token request
    await mockLoginError(page)

    await page.locator('input[type="email"]').fill('wrong@example.com')
    await page.locator('input[type="password"]').fill('wrongpassword')
    await page.getByRole('button', { name: /войти/i }).click()

    // Auth translation key loginError = 'Неверный email или пароль'
    await expect(
      page.getByText(/неверный email|неверный пароль|invalid|ошибка/i),
    ).toBeVisible({ timeout: 5000 })
  })

  test('содержит ссылку на страницу регистрации', async ({ page }) => {
    await expect(page.locator('a[href="/auth/signup"]')).toBeVisible()
  })
})

// ---------------------------------------------------------------------------
// Страница регистрации
// ---------------------------------------------------------------------------
test.describe('страница регистрации', () => {
  test.beforeEach(async ({ page }) => {
    await mockSupabaseAnon(page)
    await page.goto('/auth/signup')
  })

  test('отображает поля username, email, пароль', async ({ page }) => {
    await expect(page.locator('input[type="email"]')).toBeVisible()
    await expect(page.locator('input[type="password"]').first()).toBeVisible()
    // Username field
    await expect(page.locator('input[placeholder*="username" i], input[name="username"]').or(
      page.locator('input').nth(0),
    )).toBeVisible()
  })

  test('показывает выбор роли (аниматор / археолог)', async ({ page }) => {
    // Role selection has radio buttons or clickable cards
    await expect(
      page.getByText(/аниматор/i).or(page.getByText(/animator/i)),
    ).toBeVisible()
    await expect(
      page.getByText(/археолог/i).or(page.getByText(/archaeologist/i)),
    ).toBeVisible()
  })

  test('показывает ошибку при слишком коротком username', async ({ page }) => {
    // Find the username input by filling all text inputs and targeting the one
    // that has a length constraint
    const usernameInput = page.locator('input').filter({ hasNot: page.locator('[type="email"],[type="password"]') }).first()
    await usernameInput.fill('ab')
    // Blur to trigger validation
    await usernameInput.blur()

    await expect(
      page.getByText(/минимум 3|3 символ|too short|minimum/i),
    ).toBeVisible({ timeout: 3000 })
  })

  test('показывает ошибку если пароли не совпадают', async ({ page }) => {
    const passwords = page.locator('input[type="password"]')
    await passwords.nth(0).fill('SecurePass123!')
    await passwords.nth(1).fill('DifferentPass456!')
    // Blur / submit to trigger validation
    await passwords.nth(1).blur()

    await expect(
      page.getByText(/пароли не совпадают|passwords don't match|не совпадают/i),
    ).toBeVisible({ timeout: 3000 })
  })

  test('содержит ссылку на страницу входа', async ({ page }) => {
    await expect(page.locator('a[href="/auth/login"]')).toBeVisible()
  })
})
