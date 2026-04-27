import { describe, it, expect, vi, beforeEach } from 'vitest'
import { updateProfile } from '../settings'

// ---------------------------------------------------------------------------
// Моки
// ---------------------------------------------------------------------------
const mockGetUser       = vi.hoisted(() => vi.fn())
const mockMaybeSingle   = vi.hoisted(() => vi.fn())
const mockSelectEq      = vi.hoisted(() => vi.fn())
const mockSelectNeq     = vi.hoisted(() => vi.fn())
const mockSelect        = vi.hoisted(() => vi.fn())
const mockUpdateEq      = vi.hoisted(() => vi.fn())
const mockUpdate        = vi.hoisted(() => vi.fn())
const mockFrom          = vi.hoisted(() => vi.fn())
const mockCreateClient  = vi.hoisted(() => vi.fn())
const mockCaptureError  = vi.hoisted(() => vi.fn())

vi.mock('@/lib/supabase/server', () => ({ createClient: mockCreateClient }))
vi.mock('@/lib/logger',          () => ({ captureError: mockCaptureError }))

beforeEach(() => {
  vi.resetAllMocks()

  const selectChain = { eq: mockSelectEq, neq: mockSelectNeq, maybeSingle: mockMaybeSingle }
  mockSelectEq.mockReturnValue(selectChain)
  mockSelectNeq.mockReturnValue(selectChain)
  mockMaybeSingle.mockResolvedValue({ data: null })

  mockSelect.mockReturnValue(selectChain)
  mockUpdateEq.mockResolvedValue({ error: null })
  mockUpdate.mockReturnValue({ eq: mockUpdateEq })
  mockFrom.mockReturnValue({ select: mockSelect, update: mockUpdate })

  mockGetUser.mockResolvedValue({ data: { user: { id: 'user-1' } } })
  mockCreateClient.mockResolvedValue({ auth: { getUser: mockGetUser }, from: mockFrom })
})

// ---------------------------------------------------------------------------
// Валидация
// ---------------------------------------------------------------------------
describe('updateProfile — валидация', () => {
  it('возвращает ошибку если username короче 3 символов', async () => {
    const result = await updateProfile({ username: 'ab' })
    expect(result).toEqual({ error: 'Минимум 3 символа' })
    expect(mockFrom).not.toHaveBeenCalled()
  })

  it('возвращает ошибку если username длиннее 20 символов', async () => {
    const result = await updateProfile({ username: 'a'.repeat(21) })
    expect(result).toEqual({ error: 'Максимум 20 символов' })
  })

  it('возвращает ошибку при недопустимых символах в username', async () => {
    const result = await updateProfile({ username: 'user-name' })
    expect(result).toEqual({ error: 'Только буквы, цифры и _' })
  })

  it('возвращает ошибку если display_name длиннее 50 символов', async () => {
    const result = await updateProfile({ display_name: 'а'.repeat(51) })
    expect(result).toEqual({ error: 'Максимум 50 символов' })
  })

  it('возвращает ошибку если bio длиннее 500 символов', async () => {
    const result = await updateProfile({ bio: 'а'.repeat(501) })
    expect(result).toEqual({ error: 'Максимум 500 символов' })
  })

  it('возвращает ошибку при некорректном avatar_url (не http/https)', async () => {
    const result = await updateProfile({ avatar_url: 'ftp://example.com/img.png' })
    expect(result).toEqual({ error: 'Должен быть корректный http/https URL' })
  })

  it('принимает корректный https avatar_url', async () => {
    const result = await updateProfile({ avatar_url: 'https://example.com/avatar.png' })
    expect(result).toEqual({ success: true })
  })
})

// ---------------------------------------------------------------------------
// Аутентификация
// ---------------------------------------------------------------------------
describe('updateProfile — аутентификация', () => {
  it('возвращает Unauthorized если пользователь не авторизован', async () => {
    mockGetUser.mockResolvedValue({ data: { user: null } })
    const result = await updateProfile({ bio: 'Художник' })
    expect(result).toEqual({ error: 'Unauthorized' })
    expect(mockFrom).not.toHaveBeenCalled()
  })
})

// ---------------------------------------------------------------------------
// Логика обновления
// ---------------------------------------------------------------------------
describe('updateProfile — обновление данных', () => {
  it('возвращает success без обращения к БД если нет полей для обновления', async () => {
    const result = await updateProfile({})
    expect(result).toEqual({ success: true })
    expect(mockUpdate).not.toHaveBeenCalled()
  })

  it('возвращает ошибку если username уже занят', async () => {
    mockMaybeSingle.mockResolvedValue({ data: { id: 'other-user' } })
    const result = await updateProfile({ username: 'takenname' })
    expect(result).toEqual({ error: 'Никнейм уже занят' })
    expect(mockUpdate).not.toHaveBeenCalled()
  })

  it('проверяет уникальность username исключая собственный id', async () => {
    mockMaybeSingle.mockResolvedValue({ data: null })
    await updateProfile({ username: 'newname' })
    expect(mockSelectEq).toHaveBeenCalledWith('username', 'newname')
    expect(mockSelectNeq).toHaveBeenCalledWith('id', 'user-1')
  })

  it('обновляет только переданные поля', async () => {
    await updateProfile({ bio: 'Аниматор', display_name: 'Иван' })
    expect(mockUpdate).toHaveBeenCalledWith({ bio: 'Аниматор', display_name: 'Иван' })
    expect(mockUpdateEq).toHaveBeenCalledWith('id', 'user-1')
  })

  it('возвращает success при успешном обновлении bio', async () => {
    expect(await updateProfile({ bio: 'Люблю анимацию' })).toEqual({ success: true })
  })

  it('возвращает ошибку при сбое Supabase update', async () => {
    mockUpdateEq.mockResolvedValue({ error: { message: 'DB error' } })
    const result = await updateProfile({ bio: 'Тест' })
    expect(result).toEqual({ error: 'Ошибка сохранения' })
  })

  it('возвращает ошибку и вызывает captureError при исключении', async () => {
    mockUpdateEq.mockRejectedValue(new Error('Connection refused'))
    const result = await updateProfile({ bio: 'Тест' })
    expect(result).toEqual({ error: 'Ошибка сохранения' })
    expect(mockCaptureError).toHaveBeenCalledWith(
      expect.any(Error),
      expect.objectContaining({ action: 'updateProfile' }),
    )
  })
})
