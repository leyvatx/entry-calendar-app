import { Route, Routes } from 'react-router'
import { CalendarOutlined, TagsOutlined, UnorderedListOutlined } from '@ant-design/icons'
import AppointmentActionsProvider from './components/AppointmentActions.jsx'
import AppLayout from './components/AppLayout.jsx'
import CalendarPage from './pages/CalendarPage.jsx'
import NotFoundPage from './pages/NotFoundPage.jsx'
import TypesPage from './pages/TypesPage.jsx'
import UpcomingPage from './pages/UpcomingPage.jsx'

const ROUTES = [
  { path: '/', title: 'Próximas citas', icon: <UnorderedListOutlined />, element: <UpcomingPage /> },
  { path: '/calendar', title: 'Calendario', icon: <CalendarOutlined />, element: <CalendarPage /> },
  { path: '/types', title: 'Tipos de cita', icon: <TagsOutlined />, element: <TypesPage /> },
  { path: '*', title: 'No encontrado', element: <NotFoundPage /> },
]

export default function App() {
  return (
    <Routes>
      <Route element={<AppointmentActionsProvider><AppLayout routes={ROUTES} /></AppointmentActionsProvider>}>
        {ROUTES.map(({ path, element }) => <Route key={path} path={path} element={element} />)}
      </Route>
    </Routes>
  )
}
