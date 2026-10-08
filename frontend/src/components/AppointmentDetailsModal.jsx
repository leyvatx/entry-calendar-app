import { Descriptions, Flex, Modal, Tag } from 'antd'
import { formatDateTime, formatWhen } from '../lib/dates.js'
import TypeTag from './TypeTag.jsx'

export default function AppointmentDetailsModal({ appointment, onClose }) {
  return (
    <Modal open={Boolean(appointment)} title={appointment?.title} onCancel={onClose} footer={null} destroyOnHidden>
      {appointment && (
        <Descriptions
          column={1}
          size="small"
          items={[
            { key: 'type', label: 'Tipo', children: <TypeTag type={appointment.appointment_type} /> },
            { key: 'when', label: 'Cuándo', children: formatWhen(appointment) },
            { key: 'location', label: 'Ubicación', children: appointment.location ?? '—' },
            {
              key: 'people',
              label: 'Personas',
              children: appointment.people.length
                ? <Flex wrap gap={4}>{appointment.people.map((person) => <Tag key={person.id}>{person.name}</Tag>)}</Flex>
                : '—',
            },
            { key: 'notes', label: 'Notas', children: appointment.notes ?? '—' },
            { key: 'created', label: 'Creada', children: formatDateTime(appointment.created_at) },
            { key: 'updated', label: 'Modificada', children: formatDateTime(appointment.updated_at) },
          ]}
        />
      )}
    </Modal>
  )
}
