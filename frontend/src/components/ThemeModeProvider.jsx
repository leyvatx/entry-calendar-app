import { useEffect, useState } from 'react'
import { App, ConfigProvider, theme } from 'antd'
import { ThemeModeContext } from '../hooks/useThemeMode.js'

const MODE_KEY = 'agenda.modo'

function initialDark() {
  try {
    const saved = localStorage.getItem(MODE_KEY)
    if (saved) return saved === 'oscuro'
  } catch {}
  return window.matchMedia('(prefers-color-scheme: dark)').matches
}

export default function ThemeModeProvider({ children }) {
  const [dark, setDark] = useState(initialDark)

  useEffect(() => {
    document.documentElement.style.colorScheme = dark ? 'dark' : 'light'
  }, [dark])

  const toggle = () => {
    setDark(!dark)
    try {
      localStorage.setItem(MODE_KEY, dark ? 'claro' : 'oscuro')
    } catch {}
  }

  return (
    <ThemeModeContext.Provider value={{ dark, toggle }}>
      <ConfigProvider theme={{ algorithm: dark ? theme.darkAlgorithm : theme.defaultAlgorithm }}>
        <App>{children}</App>
      </ConfigProvider>
    </ThemeModeContext.Provider>
  )
}
