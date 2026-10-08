import dayjs from 'dayjs'
import { describe, expect, test } from 'vitest'
import {
  DATE_TIME_FORMAT, appointmentDayKeys, calendarRange, chronological, dayKey, formatDateTime, formatDayHeading, formatTimeRange, formatWhen,
  fromApiDateTime, indexByDay, isInProgress, isMultiDay, relativeDay, shownDay, startOfToday, toApiDateTime,
} from './dates.js'

const now = dayjs('2026-10-07T10:30')
const appointment = (id, starts_at, ends_at = null) => ({ id, starts_at, ends_at })
const congress = appointment(1, '2026-09-30T10:00', '2026-10-02T18:00')
const medical = appointment(2, '2026-10-07T18:30', '2026-10-07T19:30')

describe('API conversion', () => {
  test('toApiDateTime sends ISO with offset and no seconds', () => {
    expect(toApiDateTime(dayjs('2026-10-10T19:00:45.123'))).toBe(dayjs('2026-10-10T19:00').format())
    expect(toApiDateTime(null)).toBeNull()
  })

  test('fromApiDateTime reads ISO with offset', () => {
    expect(fromApiDateTime('2026-10-10T19:00:00.000-07:00').valueOf()).toBe(Date.parse('2026-10-11T02:00:00Z'))
    expect(fromApiDateTime(null)).toBeNull()
  })

  test('DATE_TIME_FORMAT shows day first and 24 h', () => {
    expect(dayjs('2026-10-07T18:30').format(DATE_TIME_FORMAT)).toBe('07/10/2026 18:30')
    expect(formatDateTime('2026-10-07T18:30')).toBe('07/10/2026 18:30')
  })
})

describe('ranges and days', () => {
  test('startOfToday is today at 00:00', () => {
    expect(startOfToday().isSame(dayjs().startOf('day'))).toBe(true)
  })

  test('calendarRange covers 6 weeks starting on Monday', () => {
    const { start, end } = calendarRange(dayjs('2026-10-15'))
    expect(dayKey(start)).toBe('2026-09-28')
    expect(dayKey(end)).toBe('2026-11-09')
  })

  test('dayKey', () => {
    expect(dayKey(dayjs('2026-10-07T23:59'))).toBe('2026-10-07')
  })

  test('appointmentDayKeys marks every day of a multi-day appointment', () => {
    const { start, end } = calendarRange(dayjs('2026-10-01'))
    expect(appointmentDayKeys(congress, start, end)).toEqual(['2026-09-30', '2026-10-01', '2026-10-02'])
  })

  test('appointmentDayKeys skips the day an appointment ends at 00:00 and handles no end', () => {
    const { start, end } = calendarRange(dayjs('2026-10-01'))
    expect(appointmentDayKeys(appointment(3, '2026-10-07T23:00', '2026-10-08T00:00'), start, end)).toEqual(['2026-10-07'])
    expect(appointmentDayKeys(appointment(4, '2026-10-10T09:00'), start, end)).toEqual(['2026-10-10'])
  })

  test('appointmentDayKeys keeps only the days inside the range', () => {
    const start = dayjs('2026-10-01')
    const end = dayjs('2026-10-03')
    expect(appointmentDayKeys(appointment(5, '2026-09-29T10:00', '2026-10-05T10:00'), start, end)).toEqual(['2026-10-01', '2026-10-02'])
    expect(appointmentDayKeys(appointment(6, '2026-09-20T10:00'), start, end)).toEqual([])
  })
})

describe('order and grouping', () => {
  test('chronological sorts by start and then by id without changing the list', () => {
    const list = [appointment(9, '2026-10-08T08:00'), appointment(3, '2026-10-07T08:00'), appointment(2, '2026-10-07T08:00')]
    expect(chronological(list).map((a) => a.id)).toEqual([2, 3, 9])
    expect(list.map((a) => a.id)).toEqual([9, 3, 2])
  })

  test('indexByDay puts multi-day appointments on each day, in order', () => {
    const early = appointment(7, '2026-10-01T08:00', '2026-10-01T09:00')
    const { start, end } = calendarRange(dayjs('2026-10-01'))
    const byDay = indexByDay([early, congress, medical], start, end)
    expect(byDay.get('2026-09-30')).toEqual([congress])
    expect(byDay.get('2026-10-01')).toEqual([congress, early])
    expect(byDay.get('2026-10-07')).toEqual([medical])
    expect(byDay.has('2026-10-03')).toBe(false)
  })
})

describe('appointment state', () => {
  test('isInProgress is true from the start until just before the end', () => {
    expect(isInProgress(appointment(1, '2026-10-06T10:00', '2026-10-08T18:00'), now)).toBe(true)
    expect(isInProgress(appointment(2, '2026-10-07T08:00', '2026-10-07T10:30'), now)).toBe(false)
    expect(isInProgress(appointment(3, '2026-10-07T09:00'), now)).toBe(false)
    expect(isInProgress(medical, now)).toBe(false)
  })

  test('isMultiDay', () => {
    expect(isMultiDay(congress)).toBe(true)
    expect(isMultiDay(medical)).toBe(false)
    expect(isMultiDay(appointment(3, '2026-10-07T09:00'))).toBe(false)
  })

  test('shownDay uses from when the appointment started before it', () => {
    const today = dayjs('2026-10-07')
    expect(dayKey(shownDay(appointment(1, '2026-10-06T10:00', '2026-10-08T18:00'), today))).toBe('2026-10-07')
    expect(dayKey(shownDay(medical, today))).toBe('2026-10-07')
    expect(dayKey(shownDay(congress))).toBe('2026-09-30')
  })
})

describe('formats', () => {
  test('relativeDay', () => {
    expect(relativeDay(dayjs('2026-10-07T23:00'), now)).toBe('Hoy')
    expect(relativeDay(dayjs('2026-10-08T00:00'), now)).toBe('Mañana')
    expect(relativeDay(dayjs('2026-10-06T12:00'), now)).toBe('Ayer')
    expect(relativeDay(dayjs('2026-10-09T12:00'), now)).toBe('Vie. 9 oct')
    expect(relativeDay(dayjs('2027-10-07T12:00'), now)).toBe('Jue. 7 oct 2027')
  })

  test('formatDayHeading', () => {
    expect(formatDayHeading(dayjs('2026-10-07'), now)).toBe('Hoy · miércoles 7 de octubre')
    expect(formatDayHeading(dayjs('2026-10-08'), now)).toBe('Mañana · jueves 8 de octubre')
    expect(formatDayHeading(dayjs('2026-10-06'), now)).toBe('Ayer · martes 6 de octubre')
    expect(formatDayHeading(dayjs('2026-10-09'), now)).toBe('Viernes 9 de octubre')
    expect(formatDayHeading(dayjs('2027-10-07'), now)).toBe('Jueves 7 de octubre de 2027')
  })

  test('formatTimeRange', () => {
    expect(formatTimeRange(appointment(1, '2026-10-07T18:30'))).toBe('18:30')
    expect(formatTimeRange(medical)).toBe('18:30 – 19:30')
    expect(formatTimeRange(congress)).toBe('30 sep 10:00 – 2 oct 18:00')
  })

  test('formatWhen', () => {
    expect(formatWhen(medical)).toBe('Miércoles 7 de octubre, 18:30 – 19:30')
    expect(formatWhen(congress)).toBe('30 sep 10:00 – 2 oct 18:00')
  })
})
