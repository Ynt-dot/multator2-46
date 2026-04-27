import { describe, it, expect } from 'vitest'
import { getRankInfo } from '../../types'

// Справочник рангов:
// 1→Неизвестный/Unknown  minLikes:0      next:10
// 2→Новичок/Newbie       minLikes:10     next:50
// 3→Узнаваемый/Recognized minLikes:50    next:150
// 4→Известный/Known      minLikes:150    next:500
// 5→Прославленный/Celebrated minLikes:500 next:1000
// 6→Выдающийся/Outstanding minLikes:1000 next:2500
// 7→Знаменитый/Famous    minLikes:2500   next:5000
// 8→Величайший/Greatest  minLikes:5000   next:10000
// 9→Бессмертный/Immortal minLikes:10000  next:25000
// 10→Легенда/Legend      minLikes:25000  next:null

// ---------------------------------------------------------------------------
// Нормальный ввод — поле level
// ---------------------------------------------------------------------------
describe('Нормальный ввод — поле level', () => {
  it('ранг 1 — возвращает level 1', () => {
    expect(getRankInfo(1).level).toBe(1)
  })

  it('ранг 5 — возвращает level 5', () => {
    expect(getRankInfo(5).level).toBe(5)
  })

  it('ранг 10 — возвращает level 10', () => {
    expect(getRankInfo(10).level).toBe(10)
  })
})

// ---------------------------------------------------------------------------
// Нормальный ввод — поле name (локаль ru)
// ---------------------------------------------------------------------------
describe('Нормальный ввод — name на русском (по умолчанию)', () => {
  it('ранг 1 — имя "Неизвестный"', () => {
    expect(getRankInfo(1).name).toBe('Неизвестный')
  })

  it('ранг 2 — имя "Новичок"', () => {
    expect(getRankInfo(2).name).toBe('Новичок')
  })

  it('ранг 7 — имя "Знаменитый"', () => {
    expect(getRankInfo(7).name).toBe('Знаменитый')
  })

  it('ранг 10 — имя "Легенда"', () => {
    expect(getRankInfo(10).name).toBe('Легенда')
  })
})

// ---------------------------------------------------------------------------
// Нормальный ввод — поле name (локаль en)
// ---------------------------------------------------------------------------
describe('Нормальный ввод — name на английском', () => {
  it('ранг 1, locale en — имя "Unknown"', () => {
    expect(getRankInfo(1, 'en').name).toBe('Unknown')
  })

  it('ранг 2, locale en — имя "Newbie"', () => {
    expect(getRankInfo(2, 'en').name).toBe('Newbie')
  })

  it('ранг 10, locale en — имя "Legend"', () => {
    expect(getRankInfo(10, 'en').name).toBe('Legend')
  })
})

// ---------------------------------------------------------------------------
// Нормальный ввод — поле minLikes
// ---------------------------------------------------------------------------
describe('Нормальный ввод — поле minLikes', () => {
  it('ранг 1 — minLikes равен 0', () => {
    expect(getRankInfo(1).minLikes).toBe(0)
  })

  it('ранг 3 — minLikes равен 50', () => {
    expect(getRankInfo(3).minLikes).toBe(50)
  })

  it('ранг 10 — minLikes равен 25000', () => {
    expect(getRankInfo(10).minLikes).toBe(25000)
  })
})

// ---------------------------------------------------------------------------
// Нормальный ввод — поле nextMinLikes
// ---------------------------------------------------------------------------
describe('Нормальный ввод — поле nextMinLikes', () => {
  it('ранг 1 — nextMinLikes равен 10 (порог следующего ранга)', () => {
    expect(getRankInfo(1).nextMinLikes).toBe(10)
  })

  it('ранг 9 — nextMinLikes равен 25000', () => {
    expect(getRankInfo(9).nextMinLikes).toBe(25000)
  })

  it('ранг 10 (максимальный) — nextMinLikes равен null', () => {
    expect(getRankInfo(10).nextMinLikes).toBeNull()
  })
})

// ---------------------------------------------------------------------------
// Граничные значения
// ---------------------------------------------------------------------------
describe('Граничные значения', () => {
  it('ранг 0 (несуществующий) — фолбэк на level 1', () => {
    expect(getRankInfo(0).level).toBe(1)
  })

  it('ранг 0 — фолбэк возвращает name "Неизвестный"', () => {
    expect(getRankInfo(0).name).toBe('Неизвестный')
  })

  it('ранг 11 (выше максимума) — фолбэк на level 1', () => {
    expect(getRankInfo(11).level).toBe(1)
  })

  it('очень большое число (999999) — фолбэк на level 1', () => {
    expect(getRankInfo(999999).level).toBe(1)
  })

  it('null — фолбэк на level 1', () => {
    expect(getRankInfo(null as unknown as number).level).toBe(1)
  })

  it('пустая строка — фолбэк на level 1', () => {
    expect(getRankInfo('' as unknown as number).level).toBe(1)
  })
})

// ---------------------------------------------------------------------------
// Ошибочный ввод
// ---------------------------------------------------------------------------
describe('Ошибочный ввод', () => {
  it('отрицательное число -1 — фолбэк на level 1', () => {
    expect(getRankInfo(-1).level).toBe(1)
  })

  it('отрицательное число -100 — фолбэк на level 1', () => {
    expect(getRankInfo(-100).level).toBe(1)
  })

  it('NaN — фолбэк на level 1', () => {
    expect(getRankInfo(NaN).level).toBe(1)
  })

  it('Infinity — фолбэк на level 1', () => {
    expect(getRankInfo(Infinity).level).toBe(1)
  })

  it('дробное число 1.5 — фолбэк на level 1 (нет ранга с level=1.5)', () => {
    expect(getRankInfo(1.5).level).toBe(1)
  })

  it('строка "1" — фолбэк на level 1 (строгое сравнение ===)', () => {
    expect(getRankInfo('1' as unknown as number).level).toBe(1)
  })

  it('undefined — фолбэк на level 1', () => {
    expect(getRankInfo(undefined as unknown as number).level).toBe(1)
  })
})

// ---------------------------------------------------------------------------
// Edge cases
// ---------------------------------------------------------------------------
describe('Edge cases', () => {
  it('фолбэк (ранг 0) и ранг 1 возвращают одинаковый level', () => {
    expect(getRankInfo(0).level).toBe(getRankInfo(1).level)
  })

  it('фолбэк (ранг 0) и ранг 1 возвращают одинаковое name', () => {
    expect(getRankInfo(0).name).toBe(getRankInfo(1).name)
  })

  it('фолбэк при null и фолбэк при -1 дают одинаковый level', () => {
    expect(getRankInfo(null as unknown as number).level).toBe(getRankInfo(-1).level)
  })

  it('ранг 10 — nextMinLikes null, а не 0 или undefined', () => {
    expect(getRankInfo(10).nextMinLikes).toStrictEqual(null)
  })

  it('функция детерминирована: два вызова с rank 5 дают одинаковый name', () => {
    expect(getRankInfo(5).name).toBe(getRankInfo(5).name)
  })

  it('locale не влияет на level — ru и en дают одинаковый level', () => {
    expect(getRankInfo(7, 'ru').level).toBe(getRankInfo(7, 'en').level)
  })

  it('locale не влияет на minLikes — ru и en дают одинаковый minLikes', () => {
    expect(getRankInfo(7, 'ru').minLikes).toBe(getRankInfo(7, 'en').minLikes)
  })

  it('locale не влияет на nextMinLikes — ru и en дают одинаковый nextMinLikes', () => {
    expect(getRankInfo(7, 'ru').nextMinLikes).toBe(getRankInfo(7, 'en').nextMinLikes)
  })
})
