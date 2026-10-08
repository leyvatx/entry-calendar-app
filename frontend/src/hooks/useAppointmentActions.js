import { createContext, useContext } from 'react'

export const AppointmentActionsContext = createContext(null)

export default function useAppointmentActions() {
  return useContext(AppointmentActionsContext)
}
