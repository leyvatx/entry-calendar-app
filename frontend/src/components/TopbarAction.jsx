import { Button, Grid, Tooltip } from 'antd'

export default function TopbarAction({ icon, label, onClick }) {
  const screens = Grid.useBreakpoint()
  return (
    <Tooltip title={screens.md ? null : label}>
      <Button type="primary" icon={icon} aria-label={label} onClick={onClick}>{screens.md ? label : null}</Button>
    </Tooltip>
  )
}
