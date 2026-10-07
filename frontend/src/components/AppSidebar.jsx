import { useLocation, useNavigate } from 'react-router'
import { Avatar, Flex, Menu, Typography, theme } from 'antd'
import { CalendarOutlined } from '@ant-design/icons'

export default function AppSidebar({ collapsed, items, onNavigate }) {
  const { token } = theme.useToken()
  const { pathname } = useLocation()
  const navigate = useNavigate()
  return (
    <Flex vertical style={{ height: '100%' }}>
      <Flex
        align="center"
        gap={token.marginSM}
        justify={collapsed ? 'center' : 'start'}
        style={{ flex: 'none', height: token.controlHeightLG * 1.6, paddingInline: collapsed ? 0 : token.paddingLG }}
      >
        <Avatar shape="square" icon={<CalendarOutlined />} style={{ background: token.colorPrimary, flex: 'none' }} />
        {!collapsed && (
          <Flex vertical style={{ minWidth: 0 }}>
            <Typography.Text strong ellipsis>Agenda</Typography.Text>
            <Typography.Text type="secondary" ellipsis style={{ fontSize: token.fontSizeSM }}>Citas y calendario</Typography.Text>
          </Flex>
        )}
      </Flex>
      <Menu
        mode="inline"
        selectedKeys={[pathname]}
        items={items}
        onClick={({ key }) => { navigate(key); onNavigate?.() }}
        style={{ borderInlineEnd: 0, flex: 1 }}
      />
    </Flex>
  )
}
