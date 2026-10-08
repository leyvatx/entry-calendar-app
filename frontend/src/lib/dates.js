import dayjs from 'dayjs'
import 'dayjs/locale/es'

dayjs.locale('es')

export const DATE_FORMAT = 'DD/MM/YYYY'
export const DATE_TIME_FORMAT = 'DD/MM/YYYY HH:mm'

export const toApiDateTime = (d) => (d ? d.second(0).millisecond(0).format() : null)

export const fromApiDateTime = (s) => (s ? dayjs(s) : null)

export const formatDateTime = (s) => dayjs(s).format(DATE_TIME_FORMAT)

export const currentTime = () => dayjs()

export const startOfToday = () => dayjs().startOf('day')

export function calendarRange(d) {
  const start = d.startOf('month').startOf('week')
  return { start, end: start.add(42, 'day') }
}

export const dayKey = (d) => d.format('YYYY-MM-DD')

export const formatDay = (d) => d.format(DATE_FORMAT)

const startsAt = (a) => dayjs(a.starts_at)
const endsAt = (a) => fromApiDateTime(a.ends_at)
const capitalize = (s) => s.charAt(0).toUpperCase() + s.slice(1)
const isNearDay = (relative) => ['Hoy', 'Mañana', 'Ayer'].includes(relative)

export function appointmentDayKeys(a, start, end) {
  const starts = startsAt(a)
  const ends = endsAt(a)
  const last = ends?.isAfter(starts) ? ends.subtract(1, 'ms') : starts
  const keys = []
  for (let d = (starts.isBefore(start) ? start : starts).startOf('day'); !d.isAfter(last) && d.isBefore(end); d = d.add(1, 'day')) {
    keys.push(dayKey(d))
  }
  return keys
}

export const chronological = (list) =>
  [...list].sort((x, y) => startsAt(x).valueOf() - startsAt(y).valueOf() || x.id - y.id)

export function indexByDay(list, start, end) {
  const byDay = new Map()
  for (const a of chronological(list)) {
    for (const key of appointmentDayKeys(a, start, end)) {
      if (!byDay.has(key)) byDay.set(key, [])
      byDay.get(key).push(a)
    }
  }
  return byDay
}

export function isInProgress(a, now) {
  const ends = endsAt(a)
  return Boolean(ends) && !startsAt(a).isAfter(now) && now.isBefore(ends)
}

export function isMultiDay(a) {
  const ends = endsAt(a)
  return Boolean(ends) && !startsAt(a).isSame(ends, 'day')
}

export function shownDay(a, from) {
  const starts = startsAt(a)
  return from && starts.isBefore(from) ? from : starts
}

export function relativeDay(d, now) {
  const diff = d.startOf('day').diff(now.startOf('day'), 'day')
  if (diff === 0) return 'Hoy'
  if (diff === 1) return 'Mañana'
  if (diff === -1) return 'Ayer'
  return capitalize(d.format(d.year() === now.year() ? 'ddd D MMM' : 'ddd D MMM YYYY'))
}

export function formatDayHeading(d, now) {
  const base = d.format(d.year() === now.year() ? 'dddd D [de] MMMM' : 'dddd D [de] MMMM [de] YYYY')
  const relative = relativeDay(d, now)
  return isNearDay(relative) ? `${relative} · ${base}` : capitalize(base)
}

export function formatTimeRange(a) {
  const starts = startsAt(a)
  const ends = endsAt(a)
  if (!ends) return starts.format('HH:mm')
  if (starts.isSame(ends, 'day')) return `${starts.format('HH:mm')} – ${ends.format('HH:mm')}`
  return `${starts.format('D MMM HH:mm')} – ${ends.format('D MMM HH:mm')}`
}

export const formatWhen = (a) => (isMultiDay(a)
  ? formatTimeRange(a)
  : `${capitalize(startsAt(a).format('dddd D [de] MMMM'))}, ${formatTimeRange(a)}`)
