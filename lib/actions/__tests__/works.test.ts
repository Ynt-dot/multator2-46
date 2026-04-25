import { describe, it, expect, vi, beforeEach } from 'vitest'
import { publishWork } from '../works'

// ---------------------------------------------------------------------------
// Моки
// ---------------------------------------------------------------------------
const mockGetUser            = vi.hoisted(() => vi.fn())
const mockSingle             = vi.hoisted(() => vi.fn())
const mockSelectAfterInsert  = vi.hoisted(() => vi.fn())
const mockInsert             = vi.hoisted(() => vi.fn())
const mockFrom               = vi.hoisted(() => vi.fn())
const mockCreateClient       = vi.hoisted(() => vi.fn())
const mockCaptureError       = vi.hoisted(() => vi.fn())

vi.mock('@/lib/supabase/server', () => ({ createClient: mockCreateClient }))
vi.mock('@/lib/logger',          () => ({ captureError: mockCaptureError }))

const VALID = {
  title:       'Моя первая анимация',
  description: null as null,
  type:        'animation',
  category:    'sandbox',
  frames_data: { frames: [] as unknown[] },
}

beforeEach(() => {
  vi.resetAllMocks()
  mockSingle.mockResolvedValue({ data: { id: 'work-1' }, error: null })
  mockSelectAfterInsert.mockReturnValue({ single: mockSingle })
  mockInsert.mockReturnValue({ select: mockSelectAfterInsert })
  mockFrom.mockReturnValue({ insert: mockInsert })
  mockGetUser.mockResolvedValue({ data: { user: { id: 'user-1' } } })
  mockCreateClient.mockResolvedValue({ auth: { getUser: mockGetUser }, from: mockFrom })
})

// ---------------------------------------------------------------------------
// Валидация
// ---------------------------------------------------------------------------
describe('publishWork — валидация', () => {
  it('возвращает ошибку при пустом title', async () => {
    const result = await publishWork({ ...VALID, title: '' })
    expect(result).toEqual({ error: 'Введите название' })
    expect(mockInsert).not.toHaveBeenCalled()
  })

  it('возвращает ошибку если title длиннее 100 символов', async () => {
    const result = await publishWork({ ...VALID, title: 'а'.repeat(101) })
    expect(result).toEqual({ error: 'Максимум 100 символов' })
  })

  it('возвращает ошибку при недопустимом type', async () => {
    const result = await publishWork({ ...VALID, type: 'video' })
    expect(result).toEqual({ error: expect.any(String) })
  })

  it('возвращает ошибку при недопустимой category', async () => {
    const result = await publishWork({ ...VALID, category: 'featured' })
    expect(result).toEqual({ error: expect.any(String) })
  })

  it('возвращает ошибку если frames_data не объект', async () => {
    const result = await publishWork({ ...VALID, frames_data: 'not-an-object' })
    expect(result).toEqual({ error: expect.any(String) })
  })

  it('обрезает пробелы в title', async () => {
    await publishWork({ ...VALID, title: '  Название с пробелами  ' })
    expect(mockInsert).toHaveBeenCalledWith(
      expect.objectContaining({ title: 'Название с пробелами' }),
    )
  })
})

// ---------------------------------------------------------------------------
// Аутентификация
// ---------------------------------------------------------------------------
describe('publishWork — аутентификация', () => {
  it('возвращает Unauthorized если пользователь не авторизован', async () => {
    mockGetUser.mockResolvedValue({ data: { user: null } })
    const result = await publishWork(VALID)
    expect(result).toEqual({ error: 'Unauthorized' })
    expect(mockInsert).not.toHaveBeenCalled()
  })
})

// ---------------------------------------------------------------------------
// База данных
// ---------------------------------------------------------------------------
describe('publishWork — база данных', () => {
  it('возвращает success с id созданной работы', async () => {
    const result = await publishWork(VALID)
    expect(result).toEqual({ success: true, id: 'work-1' })
  })

  it('вставляет корректные поля включая user_id и is_published', async () => {
    await publishWork({ ...VALID, type: 'drawing', category: 'oldschool' })
    expect(mockFrom).toHaveBeenCalledWith('works')
    expect(mockInsert).toHaveBeenCalledWith(
      expect.objectContaining({
        user_id:      'user-1',
        type:         'drawing',
        category:     'oldschool',
        is_published: true,
      }),
    )
  })

  it('возвращает ошибку при сбое Supabase insert', async () => {
    mockSingle.mockResolvedValue({ data: null, error: { message: 'unique constraint' } })
    const result = await publishWork(VALID)
    expect(result).toEqual({ error: 'Ошибка публикации' })
  })

  it('возвращает ошибку и вызывает captureError при исключении', async () => {
    mockSingle.mockRejectedValue(new Error('Timeout'))
    const result = await publishWork(VALID)
    expect(result).toEqual({ error: 'Ошибка публикации' })
    expect(mockCaptureError).toHaveBeenCalledWith(
      expect.any(Error),
      expect.objectContaining({ action: 'publishWork' }),
    )
  })
})
