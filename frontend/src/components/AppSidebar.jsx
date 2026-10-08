import { useState } from 'react'
import { useLocation, useNavigate } from 'react-router'
import { Avatar, Button, Divider, Flex, Input, Menu, Switch, Tooltip, Typography, theme } from 'antd'
import { CalendarOutlined, MenuFoldOutlined, MenuUnfoldOutlined, MoonOutlined, SearchOutlined } from '@ant-design/icons'
import { normalizeText } from '../lib/filters.js'
import useThemeMode from '../hooks/useThemeMode.js'

export default function AppSidebar({ collapsed, items, onToggle, onNavigate }) {
  const { token } = theme.useToken()
  const { pathname } = useLocation()
  const navigate = useNavigate()
  const { dark, toggle } = useThemeMode()
  const [query, setQuery] = useState('')
  const [focusSearch, setFocusSearch] = useState(false)
  const shown = collapsed ? items : items.filter((item) => normalizeText(item.label).includes(normalizeText(query)))
  const toggleLabel = collapsed ? 'Expandir menú' : 'Contraer menú'
  const toggleButton = onToggle && (
    <Tooltip title={toggleLabel} placement="right">
      <Button type="text" icon={collapsed ? <MenuUnfoldOutlined /> : <MenuFoldOutlined />} aria-label={toggleLabel} onClick={onToggle} />
    </Tooltip>
  )
  const go = (key) => {
    navigate(key)
    setQuery('')
    onNavigate?.()
  }
  return (
    <Flex vertical style={{ height: '100%' }}>
      <Flex
        align="center"
        gap={token.marginSM}
        justify={collapsed ? 'center' : 'start'}
        style={{
          flex: 'none', height: token.controlHeightLG * 1.6,
          paddingInlineStart: collapsed ? 0 : token.paddingLG, paddingInlineEnd: collapsed ? 0 : token.paddingSM,
        }}
      >
        {!collapsed && (
          <>
            <Avatar shape="square" icon={<CalendarOutlined />} style={{ background: token.colorPrimary, flex: 'none' }} />
            <Flex vertical style={{ flex: 1, minWidth: 0 }}>
              <Typography.Text strong ellipsis>Agenda</Typography.Text>
              <Typography.Text type="secondary" ellipsis style={{ fontSize: token.fontSizeSM }}>Citas y calendario</Typography.Text>
            </Flex>
          </>
        )}
        {toggleButton}
      </Flex>
      <div style={{ flex: 'none', paddingInline: collapsed ? token.paddingSM : token.padding, paddingBlockEnd: token.paddingXS }}>
        {collapsed ? (
          <Tooltip title="Buscar módulo" placement="right">
            <Button
              type="text"
              block
              icon={<SearchOutlined />}
              aria-label="Buscar módulo"
              onClick={() => {
                setFocusSearch(true)
                onToggle()
              }}
            />
          </Tooltip>
        ) : (
          <Input
            allowClear
            autoFocus={focusSearch}
            prefix={<SearchOutlined />}
            placeholder="Buscar módulo…"
            aria-label="Buscar módulo"
            value={query}
            onChange={(event) => setQuery(event.target.value)}
            onPressEnter={() => shown[0] && go(shown[0].key)}
            onKeyDown={(event) => event.key === 'Escape' && setQuery('')}
            onBlur={() => setFocusSearch(false)}
          />
        )}
      </div>
      {shown.length ? (
        <Menu
          mode="inline"
          selectedKeys={[pathname]}
          items={shown}
          onClick={({ key }) => go(key)}
          style={{ borderInlineEnd: 0, flex: 1 }}
        />
      ) : (
        <Typography.Text type="secondary" style={{ flex: 1, paddingInline: token.paddingLG }}>Ningún módulo coincide</Typography.Text>
      )}
      <Divider style={{ margin: 0 }} />
      <Flex
        align="center"
        justify={collapsed ? 'center' : 'space-between'}
        gap="small"
        style={{ flex: 'none', padding: collapsed ? token.paddingSM : token.padding }}
      >
        <Flex align="center" gap="small"><MoonOutlined />{!collapsed && <Typography.Text>Modo oscuro</Typography.Text>}</Flex>
        <Tooltip title={collapsed ? 'Modo oscuro' : null} placement="right">
          <Switch size="small" checked={dark} onChange={toggle} aria-label="Modo oscuro" />
        </Tooltip>
      </Flex>
    </Flex>
  )
}
