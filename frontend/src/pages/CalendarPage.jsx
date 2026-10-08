import { Card, Empty } from 'antd'
import { PlusOutlined } from '@ant-design/icons'
import useAppointmentActions from '../hooks/useAppointmentActions.js'
import TopbarAction from '../components/TopbarAction.jsx'
import TopbarSlot from '../components/TopbarSlot.jsx'

export default function CalendarPage() {
  const { openCreate } = useAppointmentActions()
  return (
    <Card variant="borderless">
      <TopbarSlot>
        <TopbarAction icon={<PlusOutlined />} label="Nueva cita" onClick={() => openCreate()} />
      </TopbarSlot>
      <Empty />
    </Card>
  )
}
