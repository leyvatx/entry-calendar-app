import { describe, expect, test } from 'vitest'
import dayjs from 'dayjs'
import { dayKey } from './dates.js'
import { appointmentsQuery, cleanFilters, filterTags, normalizeText, withoutFilter } from './filters.js'

test('cleanFilters trims text and drops empty values', () => {
  expect(cleanFilters({ past: false, q: '  medica ', types: [], from: null, to: undefined, name: '   ', color: 'green' }))
    .toEqual({ q: 'medica', color: 'green' })
})

describe('appointmentsQuery', () => {
  const today = dayjs('2026-10-07')

  test('starts today unless past appointments are included', () => {
    expect(dayKey(appointmentsQuery({}, today).from)).toBe('2026-10-07')
    expect(appointmentsQuery({ past: true }, today).from).toBeUndefined()
  })

  test('uses Desde and the day after Hasta as an exclusive end', () => {
    const query = appointmentsQuery({ from: dayjs('2026-10-01'), to: dayjs('2026-10-31'), q: 'medica', types: [2] }, today)
    expect(dayKey(query.from)).toBe('2026-10-01')
    expect(dayKey(query.to)).toBe('2026-11-01')
    expect(query.q).toBe('medica')
    expect(query.typeIds).toEqual([2])
  })
})

describe('tags', () => {
  test('filterTags labels each filter', () => {
    const filters = { past: true, q: 'medica', types: [2, 9], from: dayjs('2026-10-01'), name: 'sal', color: 'green' }
    expect(filterTags(filters, [{ id: 2, name: 'Salud' }]).map((tag) => tag.label)).toEqual([
      'Incluye pasadas', 'Título o notas: «medica»', 'Tipo: Salud', 'Tipo: 9', 'Desde 01/10/2026', 'Nombre: «sal»', 'Color: Verde',
    ])
  })

  test('withoutFilter removes one field or one type', () => {
    expect(withoutFilter({ q: 'a', types: [2, 5] }, 'types:2')).toEqual({ q: 'a', types: [5] })
    expect(withoutFilter({ q: 'a', types: [2] }, 'types:2')).toEqual({ q: 'a' })
    expect(withoutFilter({ q: 'a', types: [2] }, 'q')).toEqual({ types: [2] })
  })
})

test('normalizeText ignores accents, case and extra spaces', () => {
  expect(normalizeText('  Cita   MÉDICA ')).toBe('cita medica')
  expect(normalizeText('Trámites')).toBe('tramites')
})
