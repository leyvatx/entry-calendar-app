import { createPortal } from 'react-dom'
import { useOutletContext } from 'react-router'

export default function TopbarSlot({ children }) {
  const { actionsNode } = useOutletContext()
  return actionsNode ? createPortal(children, actionsNode) : null
}
