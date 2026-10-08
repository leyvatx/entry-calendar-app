import { useRef, useState } from 'react'
import { Dropdown } from 'antd'

const SWIPE_DISTANCE = 40
const activeMenu = { close: null }

export default function ContextRow({ menu, ...props }) {
  const [open, setOpen] = useState(false)
  const swipeStart = useRef(null)

  if (!menu) return <tr {...props} />

  const changeOpen = (next) => {
    if (next) {
      activeMenu.close?.()
      activeMenu.close = () => setOpen(false)
    }
    setOpen(next)
  }

  const onTouchMove = (event) => {
    const start = swipeStart.current
    if (!start) return
    const { clientX, clientY } = event.touches[0]
    const dx = clientX - start.x
    const dy = Math.abs(clientY - start.y)
    if (dy > SWIPE_DISTANCE) {
      swipeStart.current = null
    } else if (dx > SWIPE_DISTANCE && dx > dy * 2) {
      swipeStart.current = null
      changeOpen(true)
    }
  }

  return (
    <Dropdown
      menu={{ ...menu, onClick: (info) => { changeOpen(false); menu.onClick(info) } }}
      trigger={['contextMenu']}
      open={open}
      onOpenChange={changeOpen}
    >
      <tr
        {...props}
        onTouchStart={(event) => { swipeStart.current = { x: event.touches[0].clientX, y: event.touches[0].clientY } }}
        onTouchMove={onTouchMove}
      />
    </Dropdown>
  )
}
