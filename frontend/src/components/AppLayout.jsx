import { useState } from 'react'
import { Outlet, matchPath, useLocation } from 'react-router'
import { Button, Drawer, Flex, Grid, Layout, Tooltip, Typography, theme } from 'antd'
import { LeftOutlined, MenuOutlined, RightOutlined } from '@ant-design/icons'
import AppSidebar from './AppSidebar.jsx'

const SIDER_WIDTH = 240
const SIDER_COLLAPSED_WIDTH = 80
const SIDEBAR_KEY = 'agenda.sidebar'

function readSaved() {
  try {
    return localStorage.getItem(SIDEBAR_KEY)
  } catch {
    return null
  }
}

function saveCollapsed(collapsed) {
  try {
    localStorage.setItem(SIDEBAR_KEY, collapsed ? 'contraido' : 'expandido')
  } catch {}
}

export default function AppLayout({ routes }) {
  const { token } = theme.useToken()
  const screens = Grid.useBreakpoint()
  const { pathname } = useLocation()
  const [collapsed, setCollapsed] = useState(() => {
    const saved = readSaved()
    return saved ? saved === 'contraido' : !window.matchMedia(`(min-width: ${token.screenLGMin}px)`).matches
  })
  const [drawerOpen, setDrawerOpen] = useState(false)
  const hasSider = Boolean(screens.md)
  const title = routes.find((r) => matchPath(r.path, pathname))?.title
  const menuItems = routes.filter((r) => r.icon).map((r) => ({ key: r.path, icon: r.icon, label: r.title }))
  const toggle = () => {
    setCollapsed(!collapsed)
    saveCollapsed(!collapsed)
  }
  const toggleLabel = collapsed ? 'Expandir menú' : 'Contraer menú'

  return (
    <Layout style={{ minHeight: '100vh' }}>
      {hasSider && (
        <Layout.Sider
          theme="light"
          collapsible
          trigger={null}
          collapsed={collapsed}
          width={SIDER_WIDTH}
          collapsedWidth={SIDER_COLLAPSED_WIDTH}
          style={{
            position: 'sticky', insetBlockStart: 0, height: '100vh', zIndex: token.zIndexBase + 20,
            borderInlineEnd: `${token.lineWidth}px solid ${token.colorSplit}`,
          }}
        >
          <div style={{ height: '100%', overflowY: 'auto', overflowX: 'hidden' }}>
            <AppSidebar collapsed={collapsed} items={menuItems} />
          </div>
          <Tooltip title={toggleLabel} placement="right">
            <Button
              type="primary"
              shape="circle"
              size="small"
              icon={collapsed ? <RightOutlined /> : <LeftOutlined />}
              aria-label={toggleLabel}
              onClick={toggle}
              style={{
                position: 'absolute',
                insetBlockStart: (token.controlHeightLG * 1.6 - token.controlHeightSM) / 2,
                insetInlineEnd: -token.controlHeightSM / 2,
              }}
            />
          </Tooltip>
        </Layout.Sider>
      )}
      <Layout>
        <Layout.Header
          style={{
            position: 'sticky', insetBlockStart: 0, zIndex: token.zIndexBase + 10, background: token.colorBgContainer,
            paddingInline: screens.md ? token.paddingLG : token.padding,
            borderBlockEnd: `${token.lineWidth}px solid ${token.colorSplit}`,
          }}
        >
          <Flex align="center" gap="small" style={{ height: '100%', minWidth: 0 }}>
            {!hasSider && <Button type="text" icon={<MenuOutlined />} aria-label="Abrir menú" onClick={() => setDrawerOpen(true)} />}
            <Typography.Title level={5} ellipsis style={{ margin: 0 }}>{title}</Typography.Title>
          </Flex>
        </Layout.Header>
        <Layout.Content style={{ padding: screens.md ? token.paddingLG : token.padding }}>
          <Outlet />
        </Layout.Content>
      </Layout>
      {!hasSider && (
        <Drawer
          placement="left"
          open={drawerOpen}
          onClose={() => setDrawerOpen(false)}
          size={SIDER_WIDTH}
          closable={false}
          styles={{ body: { padding: 0 } }}
        >
          <Layout.Sider theme="light" width="100%" style={{ height: '100%' }}>
            <AppSidebar collapsed={false} items={menuItems} onNavigate={() => setDrawerOpen(false)} />
          </Layout.Sider>
        </Drawer>
      )}
    </Layout>
  )
}
