import { colorLabel } from './colors.js'
import { formatDay } from './dates.js'

export const FILTER_FIELDS = {
  upcoming: ['past', 'q', 'types', 'from', 'to'],
  calendar: ['q', 'types'],
  types: ['name', 'color'],
}

export const normalizeText = (s) => s.normalize('NFD').replace(/\p{Mn}/gu, '').toLowerCase().replace(/\s+/g, ' ').trim()

const isEmpty = (value) => value === undefined || value === null || value === '' || value === false
  || (Array.isArray(value) && value.length === 0)

export const cleanFilters = (values) => Object.fromEntries(
  Object.entries(values)
    .map(([key, value]) => [key, typeof value === 'string' ? value.trim() : value])
    .filter(([, value]) => !isEmpty(value)),
)

export function appointmentsQuery(filters, today) {
  return {
    from: filters.from?.startOf('day') ?? (filters.past ? undefined : today),
    to: filters.to?.startOf('day').add(1, 'day'),
    q: filters.q,
    typeIds: filters.types,
  }
}

export function filterTags(filters, types = []) {
  const tags = []
  if (filters.past) tags.push({ key: 'past', label: 'Incluye pasadas' })
  if (filters.q) tags.push({ key: 'q', label: `Título o notas: «${filters.q}»` })
  for (const id of filters.types ?? []) {
    tags.push({ key: `types:${id}`, label: `Tipo: ${types.find((t) => t.id === id)?.name ?? id}` })
  }
  if (filters.from) tags.push({ key: 'from', label: `Desde ${formatDay(filters.from)}` })
  if (filters.to) tags.push({ key: 'to', label: `Hasta ${formatDay(filters.to)}` })
  if (filters.name) tags.push({ key: 'name', label: `Nombre: «${filters.name}»` })
  if (filters.color) tags.push({ key: 'color', label: `Color: ${colorLabel(filters.color)}` })
  return tags
}

export function withoutFilter(filters, key) {
  const [field, id] = key.split(':')
  const rest = { ...filters }
  if (field === 'types') rest.types = filters.types.filter((typeId) => String(typeId) !== id)
  else delete rest[field]
  return cleanFilters(rest)
}
