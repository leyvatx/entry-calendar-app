import { useState } from 'react'
import { PlusOutlined } from '@ant-design/icons'
import { api } from '../api.js'
import { startOfToday } from '../lib/dates.js'
import { appointmentsQuery, filterTags } from '../lib/filters.js'
import useAppointmentActions from '../hooks/useAppointmentActions.js'
import useRequest from '../hooks/useRequest.js'
import ActiveFilters from '../components/ActiveFilters.jsx'
import AppointmentsTable from '../components/AppointmentsTable.jsx'
import AsyncState from '../components/AsyncState.jsx'
import TopbarAction from '../components/TopbarAction.jsx'
import TopbarFilters from '../components/TopbarFilters.jsx'
import TopbarSlot from '../components/TopbarSlot.jsx'

export default function UpcomingPage() {
  const { openCreate, version } = useAppointmentActions()
  const [filters, setFilters] = useState({})
  const query = appointmentsQuery(filters, startOfToday())
  const { data, error, loading, reload } = useRequest((signal) => api.appointments.list(query, signal), [filters, version], { live: true })
  const filtered = filterTags(filters).length > 0

  return (
    <>
      <TopbarSlot>
        <TopbarFilters view="upcoming" value={filters} onChange={setFilters} />
        <TopbarAction icon={<PlusOutlined />} label="Nueva cita" onClick={() => openCreate()} />
      </TopbarSlot>
      <AsyncState loading={loading && !data} error={error} onRetry={reload}>
        <ActiveFilters filters={filters} onChange={setFilters} total={data?.length ?? 0} one="cita" many="citas" />
        <AppointmentsTable
          appointments={data ?? []}
          from={query.from}
          emptyText={filtered ? 'Ninguna cita coincide con los filtros' : 'No tienes citas próximas'}
        />
      </AsyncState>
    </>
  )
}
