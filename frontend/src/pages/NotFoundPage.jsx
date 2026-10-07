import { useNavigate } from 'react-router'
import { Button, Card, Result } from 'antd'

export default function NotFoundPage() {
  const navigate = useNavigate()
  return (
    <Card variant="borderless">
      <Result
        status="404"
        title="Página no encontrada"
        subTitle="La dirección que abriste no existe."
        extra={<Button type="primary" onClick={() => navigate('/')}>Ir a próximas citas</Button>}
      />
    </Card>
  )
}
