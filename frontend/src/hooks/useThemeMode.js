import { createContext, useContext } from 'react'

export const ThemeModeContext = createContext(null)

export default function useThemeMode() {
  return useContext(ThemeModeContext)
}
