import { fromApiDateTime, toApiDateTime } from './lib/dates.js'
import { MESSAGES } from './lib/messages.js'

export class ApiError extends Error {
  constructor(message, { status, fields = [], baseErrors = [] } = {}) {
    super(message)
    this.name = 'ApiError'
    this.status = status
    this.fields = fields
    this.baseErrors = baseErrors
  }
}

function fieldPath(key) {
  if (key === 'appointment_type') return ['appointment_type_id']
  const person = key.match(/^people\[(\d+)\]\.(\w+)$/)
  return person ? ['people', Number(person[1]), person[2]] : [key]
}

async function validationError(response) {
  const { base: baseErrors = [], ...errors } = await response.json().catch(() => ({}))
  const fields = Object.entries(errors).map(([key, messages]) => ({ name: fieldPath(key), errors: messages }))
  const message = baseErrors[0] ?? fields[0]?.errors[0] ?? MESSAGES.unexpected
  return new ApiError(message, { status: response.status, fields, baseErrors })
}

async function request(method, path, { body, signal } = {}) {
  let response
  try {
    response = await fetch(`/api${path}`, {
      method,
      signal,
      headers: { Accept: 'application/json', 'Content-Type': 'application/json' },
      body: body && JSON.stringify(body),
    })
  } catch (error) {
    if (error.name === 'AbortError') throw error
    throw new ApiError(MESSAGES.network)
  }
  if (response.status === 204) return null
  if (response.ok) return response.json()
  if (response.status === 422 || response.status === 400) throw await validationError(response)
  if (response.status === 404) throw new ApiError(MESSAGES.notFound, { status: 404 })
  if ([502, 503, 504].includes(response.status)) throw new ApiError(MESSAGES.network, { status: response.status })
  throw new ApiError(MESSAGES.unexpected, { status: response.status })
}

function toAppointmentPayload(values, originalPeople = []) {
  const people = values.people ?? []
  const keptIds = new Set(people.map((p) => p.id))
  return {
    title: values.title,
    appointment_type_id: values.appointment_type_id,
    location: values.location,
    notes: values.notes,
    starts_at: toApiDateTime(values.starts_at),
    ends_at: toApiDateTime(values.ends_at),
    people_attributes: [
      ...people.map(({ id, name }) => ({ id, name })),
      ...originalPeople.filter((p) => !keptIds.has(p.id)).map(({ id }) => ({ id, _destroy: true })),
    ],
  }
}

export const toAppointmentFormValues = (appointment) => ({
  title: appointment.title,
  appointment_type_id: appointment.appointment_type_id,
  location: appointment.location,
  notes: appointment.notes,
  starts_at: fromApiDateTime(appointment.starts_at),
  ends_at: fromApiDateTime(appointment.ends_at),
  people: appointment.people.map(({ id, name }) => ({ id, name })),
})

function appointmentsQuery({ from, to, q, typeIds } = {}) {
  const params = new URLSearchParams()
  if (from) params.set('from', toApiDateTime(from))
  if (to) params.set('to', toApiDateTime(to))
  if (q) params.set('q', q)
  if (typeIds?.length) params.set('appointment_type_ids', typeIds.join(','))
  return params.size ? `?${params}` : ''
}

export const api = {
  appointmentTypes: {
    list: (signal) => request('GET', '/appointment_types', { signal }),
    get: (id, signal) => request('GET', `/appointment_types/${id}`, { signal }),
    create: (values) => request('POST', '/appointment_types', { body: { appointment_type: values } }),
    update: (id, values) => request('PATCH', `/appointment_types/${id}`, { body: { appointment_type: values } }),
    remove: (id) => request('DELETE', `/appointment_types/${id}`),
  },
  appointments: {
    list: (filters, signal) => request('GET', `/appointments${appointmentsQuery(filters)}`, { signal }),
    get: (id, signal) => request('GET', `/appointments/${id}`, { signal }),
    create: (values) => request('POST', '/appointments', { body: { appointment: toAppointmentPayload(values) } }),
    update: (id, values, originalPeople) => request('PATCH', `/appointments/${id}`, {
      body: { appointment: toAppointmentPayload(values, originalPeople) },
    }),
    remove: (id) => request('DELETE', `/appointments/${id}`),
  },
}
