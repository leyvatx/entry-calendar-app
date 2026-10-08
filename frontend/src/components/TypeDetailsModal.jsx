import { Descriptions, Modal } from 'antd'
import { colorLabel } from '../lib/colors.js'
import ColorBadge from './ColorBadge.jsx'

export default function TypeDetailsModal({ type, onClose }) {
  return (
    <Modal open={Boolean(type)} title={type?.name} onCancel={onClose} footer={null}>
      {type && (
        <Descriptions
          column={1}
          size="small"
          items={[
            { key: 'color', label: 'Color', children: <ColorBadge color={type.color} text={colorLabel(type.color)} /> },
            { key: 'count', label: 'Citas', children: type.appointments_count },
          ]}
        />
      )}
    </Modal>
  )
}
