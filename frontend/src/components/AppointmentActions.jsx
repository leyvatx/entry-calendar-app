import { useState } from 'react'
import { AppointmentActionsContext } from '../hooks/useAppointmentActions.js'
import AppointmentFormModal from './AppointmentFormModal.jsx'

export default function AppointmentActionsProvider({ children }) {
  const [form, setForm] = useState(null)
  const [formKey, setFormKey] = useState(0)
  const [version, setVersion] = useState(0)

  const openForm = (state) => {
    setForm(state)
    setFormKey((key) => key + 1)
  }
  const value = {
    openCreate: (date) => openForm({ date }),
    openEdit: (appointment) => openForm({ appointment }),
    version,
  }

  return (
    <AppointmentActionsContext.Provider value={value}>
      {children}
      <AppointmentFormModal
        key={formKey}
        state={form}
        onClose={() => setForm(null)}
        onSaved={() => {
          setForm(null)
          setVersion((current) => current + 1)
        }}
      />
    </AppointmentActionsContext.Provider>
  )
}
