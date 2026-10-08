import { Tag } from 'antd'

export default function TypeTag({ type }) {
  return <Tag color={type.color}>{type.name}</Tag>
}
