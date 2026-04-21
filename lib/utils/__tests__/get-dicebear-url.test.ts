import { describe, it, expect } from 'vitest'
import { getDicebearUrl } from '../../dicebear'

const BASE = 'https://api.dicebear.com/9.x'

// ---------------------------------------------------------------------------
// Нормальный ввод
// ---------------------------------------------------------------------------
describe('Нормальный ввод', () => {
  it('обычный seed — URL начинается с базового адреса', () => {
    expect(getDicebearUrl('alice')).toContain(BASE)
  })

  it('обычный seed — стиль по умолчанию pixel-art присутствует в URL', () => {
    expect(getDicebearUrl('alice')).toContain('/pixel-art/')
  })

  it('обычный seed — seed присутствует в query-параметре', () => {
    expect(getDicebearUrl('alice')).toContain('?seed=alice')
  })

  it('обычный seed — URL имеет правильную структуру целиком', () => {
    expect(getDicebearUrl('alice')).toBe(`${BASE}/pixel-art/svg?seed=alice`)
  })

  it('кастомный стиль avataaars — подставляется в URL вместо pixel-art', () => {
    expect(getDicebearUrl('alice', 'avataaars')).toContain('/avataaars/')
  })

  it('кастомный стиль bottts — URL содержит bottts', () => {
    expect(getDicebearUrl('bob', 'bottts')).toBe(`${BASE}/bottts/svg?seed=bob`)
  })

  it('seed из цифр и букв — передаётся без изменений', () => {
    expect(getDicebearUrl('user123')).toContain('?seed=user123')
  })

  it('seed с подчёркиванием — передаётся без кодирования', () => {
    expect(getDicebearUrl('john_doe')).toContain('?seed=john_doe')
  })
})

// ---------------------------------------------------------------------------
// Граничные значения
// ---------------------------------------------------------------------------
describe('Граничные значения', () => {
  it('пустая строка — seed= пустой, URL формируется без ошибки', () => {
    expect(getDicebearUrl('')).toBe(`${BASE}/pixel-art/svg?seed=`)
  })

  it('null — приводится к строке "null", URL содержит seed=null', () => {
    expect(getDicebearUrl(null as unknown as string)).toContain('?seed=null')
  })

  it('0 (число) — приводится к строке "0", URL содержит seed=0', () => {
    expect(getDicebearUrl(0 as unknown as string)).toContain('?seed=0')
  })

  it('очень длинный seed (1000 символов) — URL формируется без ошибки', () => {
    const long = 'a'.repeat(1000)
    expect(getDicebearUrl(long)).toContain(`?seed=${'a'.repeat(1000)}`)
  })

  it('очень длинный seed — URL остаётся строкой', () => {
    expect(typeof getDicebearUrl('x'.repeat(1000))).toBe('string')
  })

  it('пустой стиль "" — подставляется пустой сегмент', () => {
    expect(getDicebearUrl('alice', '')).toBe(`${BASE}//svg?seed=alice`)
  })
})

// ---------------------------------------------------------------------------
// Ошибочный ввод — спецсимволы и нестроковые типы
// ---------------------------------------------------------------------------
describe('Ошибочный ввод — спецсимволы и нестроковые типы', () => {
  it('пробел в seed — кодируется как %20', () => {
    expect(getDicebearUrl('hello world')).toContain('?seed=hello%20world')
  })

  it('амперсанд & в seed — кодируется как %26, не ломает query', () => {
    expect(getDicebearUrl('alice&bob')).toContain('?seed=alice%26bob')
  })

  it('знак = в seed — кодируется как %3D', () => {
    expect(getDicebearUrl('a=b')).toContain('?seed=a%3Db')
  })

  it('слэш / в seed — кодируется как %2F, не ломает путь URL', () => {
    expect(getDicebearUrl('a/b')).toContain('?seed=a%2Fb')
  })

  it('кириллица в seed — кодируется (URL-encode)', () => {
    const url = getDicebearUrl('иванов')
    expect(url).not.toContain('иванов')
  })

  it('кириллица — декодированный seed восстанавливается корректно', () => {
    const url = getDicebearUrl('иванов')
    const encoded = url.split('?seed=')[1]
    expect(decodeURIComponent(encoded)).toBe('иванов')
  })

  it('эмодзи в seed — кодируется в URL-escape последовательность', () => {
    const url = getDicebearUrl('user😀')
    expect(url).not.toContain('😀')
  })

  it('undefined — приводится к строке "undefined"', () => {
    expect(getDicebearUrl(undefined as unknown as string)).toContain('?seed=undefined')
  })

  it('массив [1,2] как seed — приводится к строке "1,2"', () => {
    expect(getDicebearUrl([1, 2] as unknown as string)).toContain('?seed=1%2C2')
  })

  it('отрицательное число -5 как seed — приводится к строке "-5"', () => {
    expect(getDicebearUrl(-5 as unknown as string)).toContain('?seed=-5')
  })
})

// ---------------------------------------------------------------------------
// Edge cases
// ---------------------------------------------------------------------------
describe('Edge cases', () => {
  it('один символ в seed — URL формируется корректно', () => {
    expect(getDicebearUrl('a')).toBe(`${BASE}/pixel-art/svg?seed=a`)
  })

  it('два одинаковых вызова с одним seed — результат идентичен', () => {
    expect(getDicebearUrl('alice')).toBe(getDicebearUrl('alice'))
  })

  it('два вызова с разными seed — результаты различаются', () => {
    expect(getDicebearUrl('alice')).not.toBe(getDicebearUrl('bob'))
  })

  it('два вызова с одним seed, разным стилем — результаты различаются', () => {
    expect(getDicebearUrl('alice', 'pixel-art')).not.toBe(getDicebearUrl('alice', 'bottts'))
  })

  it('seed содержит только пробелы — кодируется, не становится пустым', () => {
    expect(getDicebearUrl('   ')).toContain('%20%20%20')
  })

  it('функция всегда возвращает строку', () => {
    expect(typeof getDicebearUrl('test')).toBe('string')
  })

  it('URL всегда содержит "svg" — формат ответа зафиксирован', () => {
    expect(getDicebearUrl('anything')).toContain('/svg?')
  })
})
