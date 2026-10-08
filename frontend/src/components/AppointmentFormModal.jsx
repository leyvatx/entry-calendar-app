import { useState } from 'react'
import { useNavigate } from 'react-router'
import { Alert, App, Button, Col, DatePicker, Form, Grid, Input, Modal, Result, Row, Select, theme } from 'antd'
import { EnvironmentOutlined } from '@ant-design/icons'
import { api, toAppointmentFormValues } from '../api.js'
import { DATE_TIME_FORMAT } from '../lib/dates.js'
import { MESSAGES } from '../lib/messages.js'
import useRequest from '../hooks/useRequest.js'
import AsyncState from './AsyncState.jsx'
import ColorBadge from './ColorBadge.jsx'
import PeopleField from './PeopleField.jsx'

function initialValues(state) {
  if (state?.appointment) return toAppointmentFormValues(state.appointment)
  return { starts_at: state?.date?.hour(9).minute(0).second(0), people: [] }
}

const endsAfterStart = ({ getFieldValue }) => ({
  validator: (_, endsAt) => {
    const startsAt = getFieldValue('starts_at')
    return !endsAt || !startsAt || !endsAt.isBefore(startsAt)
      ? Promise.resolve()
      : Promise.reject(new Error(MESSAGES.endsAtBeforeStart))
  },
})

export default function AppointmentFormModal({ state, onClose, onSaved }) {
  const { message } = App.useApp()
  const { token } = theme.useToken()
  const screens = Grid.useBreakpoint()
  const navigate = useNavigate()
  const [form] = Form.useForm()
  const [saving, setSaving] = useState(false)
  const [baseErrors, setBaseErrors] = useState([])
  const open = Boolean(state)
  const editing = state?.appointment
  const types = useRequest(open ? (signal) => api.appointmentTypes.list(signal) : null, [open])
  const ready = types.data?.length > 0

  const save = async (values) => {
    setSaving(true)
    setBaseErrors([])
    try {
      await (editing ? api.appointments.update(editing.id, values, editing.people) : api.appointments.create(values))
      message.success('Cita guardada')
      onSaved()
    } catch (error) {
      if (error.fields?.length || error.baseErrors?.length) {
        form.setFields(error.fields)
        setBaseErrors(error.baseErrors)
      } else {
        message.error(error.message)
        if (error.status === 404) onSaved()
      }
    } finally {
      setSaving(false)
    }
  }

  return (
    <Modal
      open={open}
      width={720}
      title={editing ? 'Editar cita' : 'Nueva cita'}
      okText="Guardar"
      cancelText="Cancelar"
      okButtonProps={{ htmlType: 'submit' }}
      confirmLoading={saving}
      onCancel={onClose}
      footer={ready ? undefined : null}
      destroyOnHidden
      modalRender={(dom) => (
        <Form form={form} layout="vertical" requiredMark="optional" scrollToFirstError initialValues={initialValues(state)} onFinish={save}>
          {dom}
        </Form>
      )}
    >
      <AsyncState
        loading={types.loading && !types.data}
        error={types.error}
        onRetry={types.reload}
        isEmpty={!ready}
        empty={(
          <Result
            status="info"
            title="Primero crea un tipo de cita"
            extra={<Button type="primary" onClick={() => { onClose(); navigate('/types') }}>Ir a tipos de cita</Button>}
          />
        )}
      >
        {baseErrors.length > 0 && <Alert type="error" showIcon title={baseErrors.join(' ')} style={{ marginBottom: token.margin }} />}
        <Row gutter={16}>
          <Col span={24}>
            <Form.Item label="Título" name="title" rules={[{ required: true, whitespace: true, message: MESSAGES.titleRequired }]}>
              <Input maxLength={100} />
            </Form.Item>
          </Col>
          <Col xs={24} md={12}>
            <Form.Item label="Tipo" name="appointment_type_id" rules={[{ required: true, message: MESSAGES.typeRequired }]}>
              <Select
                showSearch={{ optionFilterProp: 'name' }}
                options={types.data?.map((t) => ({ value: t.id, name: t.name, label: <ColorBadge color={t.color} text={t.name} /> }))}
              />
            </Form.Item>
          </Col>
          <Col xs={24} md={12}>
            <Form.Item label="Ubicación" name="location">
              <Input prefix={<EnvironmentOutlined />} maxLength={100} />
            </Form.Item>
          </Col>
          <Col xs={24} md={12}>
            <Form.Item label="Inicio" name="starts_at" rules={[{ required: true, message: MESSAGES.startsAtRequired }]}>
              <DatePicker showTime format={DATE_TIME_FORMAT} minuteStep={5} inputReadOnly={!screens.md} style={{ width: '100%' }} />
            </Form.Item>
          </Col>
          <Col xs={24} md={12}>
            <Form.Item label="Fin" name="ends_at" dependencies={['starts_at']} rules={[endsAfterStart]}>
              <DatePicker showTime allowClear format={DATE_TIME_FORMAT} minuteStep={5} inputReadOnly={!screens.md} style={{ width: '100%' }} />
            </Form.Item>
          </Col>
          <Col span={24}>
            <Form.Item label="Personas de interés">
              <PeopleField />
            </Form.Item>
          </Col>
          <Col span={24}>
            <Form.Item label="Notas" name="notes">
              <Input.TextArea autoSize={{ minRows: 2 }} />
            </Form.Item>
          </Col>
        </Row>
      </AsyncState>
    </Modal>
  )
}
