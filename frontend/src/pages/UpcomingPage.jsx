import { PlusOutlined } from '@ant-design/icons'
import { api } from '../api.js'
import { startOfToday } from '../lib/dates.js'
import useAppointmentActions from '../hooks/useAppointmentActions.js'
import useRequest from '../hooks/useRequest.js'
import AppointmentsTable from '../components/AppointmentsTable.jsx'
import AsyncState from '../components/AsyncState.jsx'
import TopbarAction from '../components/TopbarAction.jsx'

export default function UpcomingPage() {
  const { openCreate, version } = useAppointmentActions()
  const { data, error, loading, reload } = useRequest(
    (signal) => api.appointments.list({ from: startOfToday() }, signal),
    [version],
  )

  return (
    <>
      <TopbarAction icon={<PlusOutlined />} label="Nueva cita" onClick={() => openCreate()} />
      <AsyncState loading={loading && !data} error={error} onRetry={reload}>
        <AppointmentsTable appointments={data ?? []} from={startOfToday()} emptyText="No tienes citas próximas" />
      </AsyncState>
    </>
  )
}
