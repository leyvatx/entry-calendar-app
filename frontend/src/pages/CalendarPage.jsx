import { useEffect, useState } from 'react'
import { Badge, Button, Calendar, Flex, Grid, Modal, Typography, theme } from 'antd'
import { PlusOutlined } from '@ant-design/icons'
import { api } from '../api.js'
import { calendarRange, currentTime, dayKey, formatDayHeading, indexByDay, startOfToday } from '../lib/dates.js'
import useAppointmentActions from '../hooks/useAppointmentActions.js'
import useRequest from '../hooks/useRequest.js'
import ActiveFilters from '../components/ActiveFilters.jsx'
import AppointmentsTable from '../components/AppointmentsTable.jsx'
import AsyncState from '../components/AsyncState.jsx'
import TopbarAction from '../components/TopbarAction.jsx'
import TopbarFilters from '../components/TopbarFilters.jsx'
import TopbarSlot from '../components/TopbarSlot.jsx'

const MAX_DOTS = 3
const MIN_LINES = 2
const MINI_HEIGHT = 256
const WEEKS = 6

export default function CalendarPage() {
  const { token } = theme.useToken()
  const screens = Grid.useBreakpoint()
  const { openCreate, version } = useAppointmentActions()
  const [filters, setFilters] = useState({})
  const [value, setValue] = useState(startOfToday)
  const [dayOpen, setDayOpen] = useState(false)
  const { start, end } = calendarRange(value)
  const { data, error, loading, reload } = useRequest(
    (signal) => api.appointments.list({ from: start, to: end, q: filters.q, typeIds: filters.types }, signal),
    [start.valueOf(), filters, version],
    { live: true },
  )
  const byDay = indexByDay(data ?? [], start, end)
  const full = Boolean(screens.lg)
  const [frame, setFrame] = useState(null)
  const [extra, setExtra] = useState(0)
  const lineHeight = token.fontSize * token.lineHeight
  const contentHeight = MIN_LINES * lineHeight + Math.floor(extra / WEEKS)
  const lines = Math.floor(contentHeight / lineHeight)

  useEffect(() => {
    if (!frame) return
    const observer = new ResizeObserver(() => {
      const slack = frame.clientHeight - frame.firstElementChild.offsetHeight
      setExtra((current) => Math.max(0, (full ? WEEKS * Math.floor(current / WEEKS) : current) + slack))
    })
    observer.observe(frame)
    observer.observe(frame.firstElementChild)
    return () => observer.disconnect()
  }, [frame, full])

  const cellRender = (date, info) => {
    if (info.type !== 'date') return null
    const items = byDay.get(dayKey(date)) ?? []
    if (!full) {
      return (
        <Flex justify="center" gap={2}>
          {items.length
            ? items.slice(0, MAX_DOTS).map((a) => <Badge key={a.id} color={a.appointment_type.color} />)
            : <Badge status="default" style={{ visibility: 'hidden' }} />}
        </Flex>
      )
    }
    const shown = items.length > lines ? lines - 1 : items.length
    return (
      <Flex vertical>
        {items.slice(0, shown).map((a) => (
          <Typography.Text key={a.id} ellipsis={{ tooltip: a.title }}><Badge color={a.appointment_type.color} /> {a.title}</Typography.Text>
        ))}
        {items.length > shown && <Typography.Text type="secondary">+{items.length - shown} más</Typography.Text>}
      </Flex>
    )
  }

  return (
    <>
      <TopbarSlot>
        <TopbarFilters view="calendar" value={filters} onChange={setFilters} />
        <TopbarAction icon={<PlusOutlined />} label="Nueva cita" onClick={() => openCreate()} />
      </TopbarSlot>
      <AsyncState loading={loading && !data} error={error} onRetry={reload}>
        <ActiveFilters filters={filters} onChange={setFilters} total={data?.length ?? 0} one="cita" many="citas" />
        <div
          ref={setFrame}
          style={{
            flex: 1, minHeight: 0, overflowY: 'auto', background: token.colorBgContainer,
            border: `${token.lineWidth}px solid ${token.colorSplit}`, borderRadius: token.borderRadiusLG,
          }}
        >
          <Calendar
            value={value}
            fullscreen={full}
            cellRender={cellRender}
            styles={full ? { itemContent: { height: contentHeight } } : { content: { height: MINI_HEIGHT + extra } }}
            onSelect={(date, { source }) => {
              setValue(date)
              if (source === 'date') setDayOpen(true)
            }}
          />
        </div>
      </AsyncState>
      <Modal
        open={dayOpen}
        width={640}
        title={formatDayHeading(value, currentTime())}
        onCancel={() => setDayOpen(false)}
        footer={(
          <Button
            type="primary"
            icon={<PlusOutlined />}
            onClick={() => {
              setDayOpen(false)
              openCreate(value)
            }}
          >
            Nueva cita este día
          </Button>
        )}
      >
        <AppointmentsTable appointments={byDay.get(dayKey(value)) ?? []} showDay={false} compact emptyText="Sin citas este día" />
      </Modal>
    </>
  )
}
