import { describe, it, expect } from 'vitest'
import { countMedals } from '../count-medals'

// ---------------------------------------------------------------------------
// Вспомогательные фабрики
// ---------------------------------------------------------------------------
const gold   = { medal_type: 'gold' }
const silver = { medal_type: 'silver' }
const bronze = { medal_type: 'bronze' }

// ---------------------------------------------------------------------------
// Нормальный ввод
// ---------------------------------------------------------------------------
describe('Нормальный ввод', () => {
  it('смешанный набор медалей — gold корректно посчитан', () => {
    expect(countMedals([gold, silver, bronze, gold]).gold).toBe(2)
  })

  it('смешанный набор медалей — silver корректно посчитан', () => {
    expect(countMedals([gold, silver, bronze, silver]).silver).toBe(2)
  })

  it('смешанный набор медалей — bronze корректно посчитан', () => {
    expect(countMedals([gold, silver, bronze, bronze]).bronze).toBe(2)
  })

  it('только gold медали — silver равен 0', () => {
    expect(countMedals([gold, gold, gold]).silver).toBe(0)
  })

  it('только silver медали — bronze равен 0', () => {
    expect(countMedals([silver, silver]).bronze).toBe(0)
  })

  it('только bronze медали — gold равен 0', () => {
    expect(countMedals([bronze]).gold).toBe(0)
  })

  it('по одной медали каждого типа — gold равен 1', () => {
    expect(countMedals([gold, silver, bronze]).gold).toBe(1)
  })

  it('по одной медали каждого типа — silver равен 1', () => {
    expect(countMedals([gold, silver, bronze]).silver).toBe(1)
  })

  it('по одной медали каждого типа — bronze равен 1', () => {
    expect(countMedals([gold, silver, bronze]).bronze).toBe(1)
  })
})

// ---------------------------------------------------------------------------
// Граничные значения
// ---------------------------------------------------------------------------
describe('Граничные значения', () => {
  it('пустой массив — gold равен 0', () => {
    expect(countMedals([]).gold).toBe(0)
  })

  it('пустой массив — silver равен 0', () => {
    expect(countMedals([]).silver).toBe(0)
  })

  it('пустой массив — bronze равен 0', () => {
    expect(countMedals([]).bronze).toBe(0)
  })

  it('массив из 1 элемента (gold) — gold равен 1', () => {
    expect(countMedals([gold]).gold).toBe(1)
  })

  it('очень большое число медалей (1000 gold) — gold равен 1000', () => {
    expect(countMedals(Array(1000).fill(gold)).gold).toBe(1000)
  })

  it('очень большое число медалей (1000 bronze) — silver остаётся 0', () => {
    expect(countMedals(Array(1000).fill(bronze)).silver).toBe(0)
  })
})

// ---------------------------------------------------------------------------
// Ошибочный ввод — неизвестные типы медалей
// ---------------------------------------------------------------------------
describe('Ошибочный ввод — неверный medal_type', () => {
  it('неизвестный тип "platinum" — не попадает в gold', () => {
    expect(countMedals([{ medal_type: 'platinum' }]).gold).toBe(0)
  })

  it('неизвестный тип "platinum" — не попадает в silver', () => {
    expect(countMedals([{ medal_type: 'platinum' }]).silver).toBe(0)
  })

  it('неизвестный тип "platinum" — не попадает в bronze', () => {
    expect(countMedals([{ medal_type: 'platinum' }]).bronze).toBe(0)
  })

  it('пустая строка как medal_type — не попадает ни в один счётчик (gold)', () => {
    expect(countMedals([{ medal_type: '' }]).gold).toBe(0)
  })

  it('верхний регистр "GOLD" — не засчитывается как gold (регистрозависимо)', () => {
    expect(countMedals([{ medal_type: 'GOLD' }]).gold).toBe(0)
  })

  it('смешанный регистр "Gold" — не засчитывается как gold', () => {
    expect(countMedals([{ medal_type: 'Gold' }]).gold).toBe(0)
  })

  it('числовая строка как medal_type — ни один счётчик не увеличивается (gold)', () => {
    expect(countMedals([{ medal_type: '1' }]).gold).toBe(0)
  })

  it('null-подобная строка "null" как medal_type — не засчитывается', () => {
    expect(countMedals([{ medal_type: 'null' }]).bronze).toBe(0)
  })
})

// ---------------------------------------------------------------------------
// Edge cases
// ---------------------------------------------------------------------------
describe('Edge cases', () => {
  it('массив из 1 элемента — silver и bronze равны 0', () => {
    expect(countMedals([gold]).silver + countMedals([gold]).bronze).toBe(0)
  })

  it('один пользователь с 5 gold-медалями подряд — gold равен 5', () => {
    expect(countMedals([gold, gold, gold, gold, gold]).gold).toBe(5)
  })

  it('дубликаты: два одинаковых объекта bronze — bronze равен 2', () => {
    expect(countMedals([bronze, bronze]).bronze).toBe(2)
  })

  it('дубликаты разных типов — каждый тип считается независимо (gold)', () => {
    const medals = [gold, gold, silver, silver, bronze]
    expect(countMedals(medals).gold).toBe(2)
  })

  it('дубликаты разных типов — каждый тип считается независимо (silver)', () => {
    const medals = [gold, gold, silver, silver, bronze]
    expect(countMedals(medals).silver).toBe(2)
  })

  it('дубликаты разных типов — каждый тип считается независимо (bronze)', () => {
    const medals = [gold, gold, silver, silver, bronze]
    expect(countMedals(medals).bronze).toBe(1)
  })

  it('порядок элементов не влияет на подсчёт gold', () => {
    const forward  = countMedals([gold, silver, bronze])
    const backward = countMedals([bronze, silver, gold])
    expect(forward.gold).toBe(backward.gold)
  })

  it('порядок элементов не влияет на подсчёт silver', () => {
    const forward  = countMedals([gold, silver, bronze])
    const backward = countMedals([bronze, gold, silver])
    expect(forward.silver).toBe(backward.silver)
  })

  it('смесь валидных и невалидных типов — валидные считаются корректно', () => {
    const medals = [gold, { medal_type: 'diamond' }, silver, { medal_type: '' }, bronze]
    expect(countMedals(medals)).toEqual({ gold: 1, silver: 1, bronze: 1 })
  })
})
