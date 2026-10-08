import { Button, Flex, Tag, Typography, theme } from 'antd'
import { api } from '../api.js'
import { filterTags, withoutFilter } from '../lib/filters.js'
import useRequest from '../hooks/useRequest.js'

export default function ActiveFilters({ filters, onChange, total, one, many }) {
  const { token } = theme.useToken()
  const byType = Boolean(filters.types)
  const types = useRequest(byType ? (signal) => api.appointmentTypes.list(signal) : null, [byType])
  const tags = filterTags(filters, types.data ?? [])
  if (!tags.length) return null

  return (
    <Flex wrap gap="small" align="center" style={{ flex: 'none', marginBlockEnd: token.marginSM }}>
      <Typography.Text type="secondary">Mostrando {total} {total === 1 ? one : many} con:</Typography.Text>
      {tags.map((tag) => (
        <Tag
          key={tag.key}
          closable
          onClose={(event) => {
            event.preventDefault()
            onChange(withoutFilter(filters, tag.key))
          }}
        >
          {tag.label}
        </Tag>
      ))}
      <Button type="link" size="small" onClick={() => onChange({})}>Limpiar filtros</Button>
    </Flex>
  )
}
