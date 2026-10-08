import { createPortal } from 'react-dom'
import { useOutletContext } from 'react-router'
import { Button, Grid, Tooltip } from 'antd'

export default function TopbarAction({ icon, label, onClick }) {
  const { actionsNode } = useOutletContext()
  const screens = Grid.useBreakpoint()
  if (!actionsNode) return null
  return createPortal(
    <Tooltip title={screens.md ? null : label}>
      <Button type="primary" icon={icon} aria-label={label} onClick={onClick}>{screens.md ? label : null}</Button>
    </Tooltip>,
    actionsNode,
  )
}
