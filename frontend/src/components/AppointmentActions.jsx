import { useState } from 'react'
import { App } from 'antd'
import { DeleteOutlined, EditOutlined, EyeOutlined } from '@ant-design/icons'
import { api } from '../api.js'
import { AppointmentActionsContext } from '../hooks/useAppointmentActions.js'
import AppointmentDetailsModal from './AppointmentDetailsModal.jsx'
import AppointmentFormModal from './AppointmentFormModal.jsx'

export default function AppointmentActionsProvider({ children }) {
  const { modal, message } = App.useApp()
  const [details, setDetails] = useState(null)
  const [form, setForm] = useState(null)
  const [formKey, setFormKey] = useState(0)
  const [version, setVersion] = useState(0)

  const refresh = () => setVersion((current) => current + 1)
  const openForm = (state) => {
    setDetails(null)
    setForm(state)
    setFormKey((key) => key + 1)
  }
  const remove = (appointment) => modal.confirm({
    title: `¿Eliminar «${appointment.title}»?`,
    content: 'Esta acción no se puede deshacer.',
    okText: 'Eliminar',
    okButtonProps: { danger: true },
    cancelText: 'Cancelar',
    onOk: () => api.appointments.remove(appointment.id)
      .then(() => {
        message.success('Cita eliminada')
        setDetails(null)
        refresh()
      })
      .catch((error) => {
        message.error(error.message)
        if (error.status === 404) refresh()
      }),
  })
  const value = {
    openCreate: (date) => openForm({ date }),
    openEdit: (appointment) => openForm({ appointment }),
    openDetails: setDetails,
    remove,
    menu: (appointment) => ({
      items: [
        { key: 'details', icon: <EyeOutlined />, label: 'Ver detalles' },
        { key: 'edit', icon: <EditOutlined />, label: 'Editar' },
        { type: 'divider' },
        { key: 'delete', icon: <DeleteOutlined />, label: 'Eliminar', danger: true },
      ],
      onClick: ({ key, domEvent }) => {
        domEvent.stopPropagation()
        if (key === 'details') setDetails(appointment)
        if (key === 'edit') openForm({ appointment })
        if (key === 'delete') remove(appointment)
      },
    }),
    version,
  }

  return (
    <AppointmentActionsContext.Provider value={value}>
      {children}
      <AppointmentDetailsModal appointment={details} onClose={() => setDetails(null)} />
      <AppointmentFormModal
        key={formKey}
        state={form}
        onClose={() => setForm(null)}
        onSaved={() => {
          setForm(null)
          refresh()
        }}
      />
    </AppointmentActionsContext.Provider>
  )
}
