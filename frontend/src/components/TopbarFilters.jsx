import { useEffect, useState } from 'react'
import { Badge, Button, Checkbox, Col, DatePicker, Flex, Form, Grid, Input, Modal, Popover, Row, Select, Tooltip, theme } from 'antd'
import { CloseOutlined, SearchOutlined } from '@ant-design/icons'
import { api } from '../api.js'
import { TYPE_COLORS } from '../lib/colors.js'
import { DATE_FORMAT } from '../lib/dates.js'
import { FILTER_FIELDS, cleanFilters, filterTags } from '../lib/filters.js'
import { MESSAGES } from '../lib/messages.js'
import useRequest from '../hooks/useRequest.js'
import ColorBadge from './ColorBadge.jsx'

const COLOR_OPTIONS = TYPE_COLORS.map((c) => ({ value: c.value, label: <ColorBadge color={c.value} text={c.label} /> }))

const toAfterFrom = ({ getFieldValue }) => ({
  validator: (_, to) => {
    const from = getFieldValue('from')
    return !to || !from || !to.isBefore(from) ? Promise.resolve() : Promise.reject(new Error(MESSAGES.filterRangeInvalid))
  },
})

export default function TopbarFilters({ view, value, onChange }) {
  const { token } = theme.useToken()
  const screens = Grid.useBreakpoint()
  const [open, setOpen] = useState(false)
  const fields = FILTER_FIELDS[view]
  const has = (field) => fields.includes(field)
  const types = useRequest(open && has('types') ? (signal) => api.appointmentTypes.list(signal) : null, [open])

  useEffect(() => {
    const onKeyDown = (event) => {
      if (event.key !== '/' || event.target.closest?.('input, textarea, [contenteditable="true"]')) return
      event.preventDefault()
      setOpen(true)
    }
    document.addEventListener('keydown', onKeyDown)
    return () => document.removeEventListener('keydown', onKeyDown)
  }, [])

  const apply = (values) => {
    onChange(cleanFilters(values))
    setOpen(false)
  }
  const clear = () => {
    onChange({})
    setOpen(false)
  }

  const form = (
    <Form layout="vertical" initialValues={value} onFinish={apply} style={screens.sm ? { width: token.controlHeight * 17 } : undefined}>
      <Row gutter={token.margin}>
        {has('past') && (
          <Col span={24}>
            <Form.Item name="past" valuePropName="checked">
              <Checkbox>Incluir citas pasadas</Checkbox>
            </Form.Item>
          </Col>
        )}
        {has('q') && (
          <Col xs={24} sm={12}>
            <Form.Item label="Título o notas" name="q">
              <Input allowClear autoFocus placeholder="Ej. médica" />
            </Form.Item>
          </Col>
        )}
        {has('types') && (
          <Col xs={24} sm={12}>
            <Form.Item label="Tipo de cita" name="types">
              <Select
                mode="multiple"
                allowClear
                maxTagCount="responsive"
                placeholder="Todos"
                loading={types.loading}
                showSearch={{ optionFilterProp: 'name' }}
                options={types.data?.map((t) => ({ value: t.id, name: t.name, label: <ColorBadge color={t.color} text={t.name} /> }))}
              />
            </Form.Item>
          </Col>
        )}
        {has('from') && (
          <Col xs={24} sm={12}>
            <Form.Item label="Desde" name="from">
              <DatePicker format={DATE_FORMAT} inputReadOnly={!screens.md} style={{ width: '100%' }} />
            </Form.Item>
          </Col>
        )}
        {has('to') && (
          <Col xs={24} sm={12}>
            <Form.Item label="Hasta" name="to" dependencies={['from']} rules={[toAfterFrom]}>
              <DatePicker format={DATE_FORMAT} inputReadOnly={!screens.md} style={{ width: '100%' }} />
            </Form.Item>
          </Col>
        )}
        {has('name') && (
          <Col xs={24} sm={12}>
            <Form.Item label="Nombre" name="name">
              <Input allowClear autoFocus />
            </Form.Item>
          </Col>
        )}
        {has('color') && (
          <Col xs={24} sm={12}>
            <Form.Item label="Color" name="color">
              <Select allowClear placeholder="Todos" options={COLOR_OPTIONS} listHeight={448} />
            </Form.Item>
          </Col>
        )}
      </Row>
      <Flex justify="end" gap="small">
        <Button onClick={clear}>Limpiar</Button>
        <Button type="primary" htmlType="submit">Filtrar</Button>
      </Flex>
    </Form>
  )

  const button = (
    <Badge count={filterTags(value).length} size="small">
      <Tooltip title={open ? null : 'Filtros'}>
        <Button type="text" shape="circle" icon={<SearchOutlined />} aria-label="Filtros" onClick={screens.sm ? undefined : () => setOpen(true)} />
      </Tooltip>
    </Badge>
  )

  return screens.sm ? (
    <Popover
      open={open}
      onOpenChange={setOpen}
      trigger="click"
      placement="bottomRight"
      destroyOnHidden
      title={(
        <Flex justify="space-between" align="center">
          Filtros
          <Button type="text" size="small" icon={<CloseOutlined />} aria-label="Cerrar filtros" onClick={() => setOpen(false)} />
        </Flex>
      )}
      content={form}
    >
      {button}
    </Popover>
  ) : (
    <>
      {button}
      <Modal open={open} onCancel={() => setOpen(false)} title="Filtros" footer={null} destroyOnHidden>
        {form}
      </Modal>
    </>
  )
}
