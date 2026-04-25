import { describe, it, expect, vi, beforeEach } from 'vitest'
import { GET } from '../route'

// ---------------------------------------------------------------------------
// Моки
// ---------------------------------------------------------------------------
const mockExchangeCodeForSession = vi.hoisted(() => vi.fn())
const mockCreateClient           = vi.hoisted(() => vi.fn())
const mockRedirect               = vi.hoisted(() => vi.fn())

vi.mock('@/lib/supabase/server', () => ({ createClient: mockCreateClient }))
vi.mock('next/server', () => ({
  NextResponse: { redirect: mockRedirect },
}))

beforeEach(() => {
  vi.resetAllMocks()
  mockExchangeCodeForSession.mockResolvedValue({ error: null })
  mockCreateClient.mockResolvedValue({ auth: { exchangeCodeForSession: mockExchangeCodeForSession } })
  mockRedirect.mockImplementation((url: string) => new Response(null, { headers: { Location: url } }))
})

function makeRequest(params: Record<string, string>): Request {
  const url = new URL('https://example.com/auth/callback')
  for (const [k, v] of Object.entries(params)) {
    url.searchParams.set(k, v)
  }
  return new Request(url.toString())
}

// ---------------------------------------------------------------------------
// Успешный обмен кода
// ---------------------------------------------------------------------------
describe('GET /auth/callback — успешный обмен кода', () => {
  it('редиректит на / если параметр next не указан', async () => {
    await GET(makeRequest({ code: 'valid-code' }))
    expect(mockRedirect).toHaveBeenCalledWith('https://example.com/')
  })

  it('редиректит на безопасный относительный путь из next', async () => {
    await GET(makeRequest({ code: 'valid-code', next: '/profile/alice' }))
    expect(mockRedirect).toHaveBeenCalledWith('https://example.com/profile/alice')
  })

  it('принимает next с query-параметрами', async () => {
    await GET(makeRequest({ code: 'valid-code', next: '/editor?tab=frames' }))
    expect(mockRedirect).toHaveBeenCalledWith('https://example.com/editor?tab=frames')
  })

  it('вызывает exchangeCodeForSession с полученным кодом', async () => {
    await GET(makeRequest({ code: 'abc123' }))
    expect(mockExchangeCodeForSession).toHaveBeenCalledWith('abc123')
  })
})

// ---------------------------------------------------------------------------
// Защита от open redirect
// ---------------------------------------------------------------------------
describe('GET /auth/callback — защита от open redirect', () => {
  it('блокирует внешний URL в next (https://evil.com)', async () => {
    await GET(makeRequest({ code: 'valid-code', next: 'https://evil.com' }))
    expect(mockRedirect).toHaveBeenCalledWith('https://example.com/')
  })

  it('блокирует protocol-relative URL (//evil.com)', async () => {
    await GET(makeRequest({ code: 'valid-code', next: '//evil.com/steal' }))
    expect(mockRedirect).toHaveBeenCalledWith('https://example.com/')
  })

  it('блокирует путь с недопустимыми символами', async () => {
    await GET(makeRequest({ code: 'valid-code', next: '/path with spaces' }))
    expect(mockRedirect).toHaveBeenCalledWith('https://example.com/')
  })
})

// ---------------------------------------------------------------------------
// Ошибки
// ---------------------------------------------------------------------------
describe('GET /auth/callback — ошибки', () => {
  it('редиректит на /auth/error при ошибке обмена кода', async () => {
    mockExchangeCodeForSession.mockResolvedValue({ error: { message: 'invalid_grant' } })
    await GET(makeRequest({ code: 'expired-code' }))
    expect(mockRedirect).toHaveBeenCalledWith('https://example.com/auth/error')
  })

  it('редиректит на /auth/error если параметр code отсутствует', async () => {
    await GET(makeRequest({}))
    expect(mockRedirect).toHaveBeenCalledWith('https://example.com/auth/error')
    expect(mockExchangeCodeForSession).not.toHaveBeenCalled()
  })

  it('редиректит на /auth/error если code — пустая строка', async () => {
    await GET(makeRequest({ code: '' }))
    expect(mockRedirect).toHaveBeenCalledWith('https://example.com/auth/error')
    expect(mockExchangeCodeForSession).not.toHaveBeenCalled()
  })
})
