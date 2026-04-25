import { describe, it, expect, vi, beforeEach } from 'vitest'
import { submitFeedback } from '../feedback'

// ---------------------------------------------------------------------------
// Моки
// ---------------------------------------------------------------------------
const mockGetUser       = vi.hoisted(() => vi.fn())
const mockInsert        = vi.hoisted(() => vi.fn())
const mockFrom          = vi.hoisted(() => vi.fn())
const mockCreateClient  = vi.hoisted(() => vi.fn())
const mockCaptureError  = vi.hoisted(() => vi.fn())

vi.mock('@/lib/supabase/server', () => ({ createClient: mockCreateClient }))
vi.mock('@/lib/logger',          () => ({ captureError: mockCaptureError }))

const VALID = {
  category: 'suggestion',
  rating:   null as null,
  message:  'Отличная платформа для творчества!',
}

beforeEach(() => {
  vi.resetAllMocks()
  mockInsert.mockResolvedValue({ error: null })
  mockFrom.mockReturnValue({ insert: mockInsert })
  mockGetUser.mockResolvedValue({ data: { user: { id: 'user-1' } } })
  mockCreateClient.mockResolvedValue({ auth: { getUser: mockGetUser }, from: mockFrom })
})

// ---------------------------------------------------------------------------
// Валидация
// ---------------------------------------------------------------------------
describe('submitFeedback — валидация', () => {
  it('возвращает ошибку при недопустимой категории', async () => {
    const result = await submitFeedback({ ...VALID, category: 'invalid' })
    expect(result).toEqual({ error: expect.any(String) })
    expect(mockInsert).not.toHaveBeenCalled()
  })

  it('возвращает ошибку если сообщение короче 10 символов', async () => {
    const result = await submitFeedback({ ...VALID, message: 'Коротко' })
    expect(result).toEqual({ error: 'Минимум 10 символов' })
  })

  it('возвращает ошибку если сообщение длиннее 2000 символов', async () => {
    const result = await submitFeedback({ ...VALID, message: 'а'.repeat(2001) })
    expect(result).toEqual({ error: 'Максимум 2000 символов' })
  })

  it('возвращает ошибку при рейтинге 0', async () => {
    const result = await submitFeedback({ ...VALID, rating: 0 })
    expect(result).toEqual({ error: expect.any(String) })
  })

  it('возвращает ошибку при рейтинге 6', async () => {
    const result = await submitFeedback({ ...VALID, rating: 6 })
    expect(result).toEqual({ error: expect.any(String) })
  })

  it('принимает рейтинг null', async () => {
    expect(await submitFeedback({ ...VALID, rating: null })).toEqual({ success: true })
  })

  it('принимает рейтинги 1–5', async () => {
    for (const r of [1, 2, 3, 4, 5]) {
      expect(await submitFeedback({ ...VALID, rating: r })).toEqual({ success: true })
    }
  })

  it('обрезает пробелы в сообщении перед сохранением', async () => {
    await submitFeedback({ ...VALID, message: '   Длинное сообщение для теста   ' })
    expect(mockInsert).toHaveBeenCalledWith(
      expect.objectContaining({ message: 'Длинное сообщение для теста' }),
    )
  })
})

// ---------------------------------------------------------------------------
// Аутентификация
// ---------------------------------------------------------------------------
describe('submitFeedback — аутентификация', () => {
  it('возвращает Unauthorized если пользователь не авторизован', async () => {
    mockGetUser.mockResolvedValue({ data: { user: null } })
    const result = await submitFeedback(VALID)
    expect(result).toEqual({ error: 'Unauthorized' })
    expect(mockInsert).not.toHaveBeenCalled()
  })
})

// ---------------------------------------------------------------------------
// Работа с базой данных
// ---------------------------------------------------------------------------
describe('submitFeedback — база данных', () => {
  it('возвращает success и вставляет корректные поля', async () => {
    const result = await submitFeedback({ category: 'bug', rating: 2, message: 'Нашёл ошибку в редакторе' })
    expect(result).toEqual({ success: true })
    expect(mockFrom).toHaveBeenCalledWith('feedback')
    expect(mockInsert).toHaveBeenCalledWith({
      user_id:  'user-1',
      category: 'bug',
      rating:   2,
      message:  'Нашёл ошибку в редакторе',
    })
  })

  it('возвращает ошибку при сбое Supabase insert', async () => {
    mockInsert.mockResolvedValue({ error: { message: 'constraint violation' } })
    const result = await submitFeedback(VALID)
    expect(result).toEqual({ error: 'Ошибка отправки' })
  })

  it('возвращает ошибку и вызывает captureError при исключении', async () => {
    mockInsert.mockRejectedValue(new Error('Network timeout'))
    const result = await submitFeedback(VALID)
    expect(result).toEqual({ error: 'Ошибка отправки' })
    expect(mockCaptureError).toHaveBeenCalledWith(
      expect.any(Error),
      expect.objectContaining({ action: 'submitFeedback' }),
    )
  })
})
