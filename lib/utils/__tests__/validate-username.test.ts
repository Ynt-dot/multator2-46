import { describe, it, expect } from 'vitest'
import { validateUsernameFormat } from '../validate-username'

// ---------------------------------------------------------------------------
// Вспомогательные константы
// ---------------------------------------------------------------------------
const CURRENT = 'alice'

// ---------------------------------------------------------------------------
// Нормальный ввод
// ---------------------------------------------------------------------------
describe('Нормальный ввод', () => {
  it('корректный username из букв — статус check_db', () => {
    expect(validateUsernameFormat('john', CURRENT).status).toBe('check_db')
  })

  it('username с цифрами — статус check_db', () => {
    expect(validateUsernameFormat('user123', CURRENT).status).toBe('check_db')
  })

  it('username с подчёркиванием — статус check_db', () => {
    expect(validateUsernameFormat('john_doe', CURRENT).status).toBe('check_db')
  })

  it('username из заглавных и строчных букв — статус check_db', () => {
    expect(validateUsernameFormat('JohnDoe', CURRENT).status).toBe('check_db')
  })

  it('локаль en — сообщение об ошибке на английском', () => {
    const result = validateUsernameFormat('ab', CURRENT, 'en')
    expect(result).toEqual({ status: 'error', message: 'Minimum 3 characters' })
  })

  it('локаль ru — сообщение об ошибке на русском', () => {
    const result = validateUsernameFormat('ab', CURRENT, 'ru')
    expect(result).toEqual({ status: 'error', message: 'Минимум 3 символа' })
  })
})

// ---------------------------------------------------------------------------
// Граничные значения
// ---------------------------------------------------------------------------
describe('Граничные значения', () => {
  it('пустая строка — ошибка длины', () => {
    expect(validateUsernameFormat('', CURRENT).status).toBe('error')
  })

  it('1 символ — ошибка длины', () => {
    expect(validateUsernameFormat('a', CURRENT).status).toBe('error')
  })

  it('2 символа — ошибка длины', () => {
    expect(validateUsernameFormat('ab', CURRENT).status).toBe('error')
  })

  it('ровно 3 символа — статус check_db', () => {
    expect(validateUsernameFormat('abc', CURRENT).status).toBe('check_db')
  })

  it('очень длинный username (100 символов) — статус check_db (длина не ограничена сверху)', () => {
    expect(validateUsernameFormat('a'.repeat(100), CURRENT).status).toBe('check_db')
  })

  it('username === текущему — статус skip (БД не нужна)', () => {
    expect(validateUsernameFormat(CURRENT, CURRENT).status).toBe('skip')
  })
})

// ---------------------------------------------------------------------------
// Профиль отсутствует / currentUsername не передан
// ---------------------------------------------------------------------------
describe('Отсутствующий профиль', () => {
  it('currentUsername равен null — статус skip', () => {
    expect(validateUsernameFormat('anyname', null).status).toBe('skip')
  })

  it('currentUsername равен undefined — статус skip', () => {
    expect(validateUsernameFormat('anyname', undefined).status).toBe('skip')
  })

  it('currentUsername пустая строка — статус skip', () => {
    expect(validateUsernameFormat('anyname', '').status).toBe('skip')
  })
})

// ---------------------------------------------------------------------------
// Ошибочный ввод (недопустимые символы)
// ---------------------------------------------------------------------------
describe('Ошибочный ввод — недопустимые символы', () => {
  it('пробел в username — ошибка формата', () => {
    expect(validateUsernameFormat('john doe', CURRENT).status).toBe('error')
  })

  it('дефис в username — ошибка формата', () => {
    expect(validateUsernameFormat('john-doe', CURRENT).status).toBe('error')
  })

  it('точка в username — ошибка формата', () => {
    expect(validateUsernameFormat('john.doe', CURRENT).status).toBe('error')
  })

  it('кириллица в username — ошибка формата', () => {
    expect(validateUsernameFormat('иванов', CURRENT).status).toBe('error')
  })

  it('эмодзи в username — ошибка формата', () => {
    expect(validateUsernameFormat('user😀', CURRENT).status).toBe('error')
  })

  it('символ @ — ошибка формата', () => {
    expect(validateUsernameFormat('user@mail', CURRENT).status).toBe('error')
  })

  it('только цифры (3 шт.) — статус check_db (цифры допустимы)', () => {
    expect(validateUsernameFormat('123', CURRENT).status).toBe('check_db')
  })

  it('только подчёркивания (3 шт.) — статус check_db (подчёркивания допустимы)', () => {
    expect(validateUsernameFormat('___', CURRENT).status).toBe('check_db')
  })
})

// ---------------------------------------------------------------------------
// Edge cases
// ---------------------------------------------------------------------------
describe('Edge cases', () => {
  it('username из одного допустимого символа повторённого 3 раза — статус check_db', () => {
    expect(validateUsernameFormat('aaa', CURRENT).status).toBe('check_db')
  })

  it('username совпадает с currentUsername с другим регистром — статус check_db (регистр важен)', () => {
    expect(validateUsernameFormat('Alice', CURRENT).status).toBe('check_db')
  })

  it('username из одного пробела — ошибка формата, а не длины', () => {
    const result = validateUsernameFormat('   ', CURRENT)
    // пробелы не разрешены, но длина >= 3, поэтому сначала regex проверка
    expect(result).toEqual({ status: 'error', message: 'Только буквы, цифры и _' })
  })

  it('новый username === currentUsername точно — возвращает skip, не check_db', () => {
    expect(validateUsernameFormat('alice', 'alice').status).toBe('skip')
  })

  it('смешанный допустимый и недопустимый символы — ошибка формата', () => {
    expect(validateUsernameFormat('valid!name', CURRENT).status).toBe('error')
  })
})
