import { useState } from 'react'
import { App, Empty } from 'antd'
import { DeleteOutlined, EditOutlined, EyeOutlined, PlusOutlined } from '@ant-design/icons'
import { api } from '../api.js'
import { colorLabel } from '../lib/colors.js'
import useRequest from '../hooks/useRequest.js'
import AsyncState from '../components/AsyncState.jsx'
import ColorBadge from '../components/ColorBadge.jsx'
import ContextRow from '../components/ContextRow.jsx'
import DataTable from '../components/DataTable.jsx'
import TypeDetailsModal from '../components/TypeDetailsModal.jsx'
import TypeFormModal from '../components/TypeFormModal.jsx'
import TopbarAction from '../components/TopbarAction.jsx'
import TypeTag from '../components/TypeTag.jsx'

const COLUMNS = [
  { title: 'Nombre', key: 'name', render: (_, type) => <TypeTag type={type} /> },
  { title: 'Color', key: 'color', responsive: ['sm'], render: (_, type) => <ColorBadge color={type.color} text={colorLabel(type.color)} /> },
  { title: 'Citas', dataIndex: 'appointments_count', align: 'right' },
]

export default function TypesPage() {
  const { modal, message } = App.useApp()
  const { data, error, loading, reload } = useRequest((signal) => api.appointmentTypes.list(signal), [])
  const [details, setDetails] = useState(null)
  const [form, setForm] = useState(null)
  const [formKey, setFormKey] = useState(0)

  const openForm = (type) => {
    setForm({ type })
    setFormKey((key) => key + 1)
  }
  const remove = (type) => modal.confirm({
    title: `¿Eliminar el tipo «${type.name}»?`,
    content: 'Esta acción no se puede deshacer.',
    okText: 'Eliminar',
    okButtonProps: { danger: true },
    cancelText: 'Cancelar',
    onOk: () => api.appointmentTypes.remove(type.id)
      .then(() => {
        message.success('Tipo eliminado')
        reload()
      })
      .catch((error) => {
        message.error(error.message)
        if (error.status === 404) reload()
      }),
  })
  const menu = (type) => ({
    items: [
      { key: 'details', icon: <EyeOutlined />, label: 'Ver detalles' },
      { key: 'edit', icon: <EditOutlined />, label: 'Editar' },
      { type: 'divider' },
      type.appointments_count > 0
        ? { key: 'delete', icon: <DeleteOutlined />, label: `Eliminar (tiene ${type.appointments_count} ${type.appointments_count === 1 ? 'cita' : 'citas'})`, disabled: true }
        : { key: 'delete', icon: <DeleteOutlined />, label: 'Eliminar', danger: true },
    ],
    onClick: ({ key, domEvent }) => {
      domEvent.stopPropagation()
      if (key === 'details') setDetails(type)
      if (key === 'edit') openForm(type)
      if (key === 'delete') remove(type)
    },
  })

  return (
    <>
      <TopbarAction icon={<PlusOutlined />} label="Nuevo tipo" onClick={() => openForm()} />
      <AsyncState loading={loading && !data} error={error} onRetry={reload}>
        <DataTable
          rowKey="id"
          columns={COLUMNS}
          dataSource={data ?? []}
          components={{ body: { row: ContextRow } }}
          onRow={(type) => ({ menu: menu(type) })}
          locale={{ emptyText: <Empty image={Empty.PRESENTED_IMAGE_SIMPLE} description="Aún no hay tipos de cita" /> }}
        />
      </AsyncState>
      <TypeDetailsModal type={details} onClose={() => setDetails(null)} />
      <TypeFormModal
        key={formKey}
        open={Boolean(form)}
        type={form?.type}
        onClose={() => setForm(null)}
        onSaved={() => {
          setForm(null)
          reload()
        }}
      />
    </>
  )
}
