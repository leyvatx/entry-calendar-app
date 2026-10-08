import { Button, Empty, Result, Skeleton } from 'antd'

export default function AsyncState({ loading, error, onRetry, isEmpty, empty, children }) {
  if (loading) return <Skeleton active />
  if (error) return <Result status="warning" title={error.message} extra={<Button onClick={onRetry}>Reintentar</Button>} />
  if (isEmpty) return empty ?? <Empty />
  return children
}
