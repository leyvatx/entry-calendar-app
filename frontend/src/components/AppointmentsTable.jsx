import { Empty, Flex, Grid, Tag, Typography } from 'antd'
import { chronological, formatTimeRange, isInProgress, isMultiDay, currentTime, relativeDay, shownDay } from '../lib/dates.js'
import useAppointmentActions from '../hooks/useAppointmentActions.js'
import ContextRow from './ContextRow.jsx'
import DataTable from './DataTable.jsx'
import TypeTag from './TypeTag.jsx'

const IN_PROGRESS = <Tag color="processing">En curso</Tag>

export default function AppointmentsTable({ appointments, from, emptyText, showDay = true, compact = false }) {
  const { menu } = useAppointmentActions()
  const screens = Grid.useBreakpoint()
  const now = currentTime()
  const day = (a) => relativeDay(shownDay(a, from), now)

  const columns = [
    {
      key: 'compact',
      responsive: ['xs'],
      render: (_, a) => (
        <Flex vertical gap={4}>
          <Flex justify="space-between" align="start" gap="small">
            <Typography.Text strong>{a.title}</Typography.Text>
            <TypeTag type={a.appointment_type} />
          </Flex>
          <Flex wrap gap="small" align="center">
            <Typography.Text type="secondary">
              {showDay && !isMultiDay(a) ? `${day(a)} · ` : ''}{formatTimeRange(a)}
            </Typography.Text>
            {isInProgress(a, now) && IN_PROGRESS}
          </Flex>
        </Flex>
      ),
    },
    showDay && {
      title: 'Día', key: 'day', width: 110, responsive: ['sm'],
      render: (_, a) => <Typography.Text strong>{day(a)}</Typography.Text>,
    },
    {
      title: 'Hora', key: 'time', width: 200, responsive: ['sm'],
      render: (_, a) => (
        <Flex wrap gap="small" align="center">
          {formatTimeRange(a)}
          {isInProgress(a, now) && IN_PROGRESS}
        </Flex>
      ),
    },
    { title: 'Cita', dataIndex: 'title', key: 'title', responsive: ['sm'], render: (title) => <Typography.Text strong>{title}</Typography.Text> },
    { title: 'Tipo', key: 'type', width: 130, responsive: ['sm'], render: (_, a) => <TypeTag type={a.appointment_type} /> },
    !compact && { title: 'Ubicación', dataIndex: 'location', key: 'location', responsive: ['lg'], ellipsis: true, render: (location) => location ?? '—' },
    !compact && {
      title: 'Personas', key: 'people', responsive: ['xl'], ellipsis: true,
      render: (_, a) => (a.people.length ? a.people.map((person) => person.name).join(', ') : '—'),
    },
  ].filter(Boolean)

  return (
    <DataTable
      rowKey="id"
      columns={columns}
      dataSource={chronological(appointments)}
      showHeader={Boolean(screens.sm)}
      components={{ body: { row: ContextRow } }}
      onRow={(a) => ({ menu: menu(a) })}
      locale={{ emptyText: <Empty image={Empty.PRESENTED_IMAGE_SIMPLE} description={emptyText} /> }}
    />
  )
}
