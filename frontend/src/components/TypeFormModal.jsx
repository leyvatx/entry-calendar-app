import { useState } from 'react'
import { App, Form, Input, Modal, Select } from 'antd'
import { api } from '../api.js'
import { TYPE_COLORS } from '../lib/colors.js'
import { MESSAGES } from '../lib/messages.js'
import ColorBadge from './ColorBadge.jsx'

const COLOR_OPTIONS = TYPE_COLORS.map((c) => ({ value: c.value, label: <ColorBadge color={c.value} text={c.label} /> }))

export default function TypeFormModal({ open, type, onClose, onSaved }) {
  const { message } = App.useApp()
  const [form] = Form.useForm()
  const [saving, setSaving] = useState(false)

  const save = async (values) => {
    setSaving(true)
    try {
      await (type ? api.appointmentTypes.update(type.id, values) : api.appointmentTypes.create(values))
      message.success('Tipo guardado')
      onSaved()
    } catch (error) {
      if (error.fields?.length) {
        form.setFields(error.fields)
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
      title={type ? 'Editar tipo de cita' : 'Nuevo tipo de cita'}
      okText="Guardar"
      cancelText="Cancelar"
      okButtonProps={{ htmlType: 'submit' }}
      confirmLoading={saving}
      onCancel={onClose}
      destroyOnHidden
      modalRender={(dom) => (
        <Form
          form={form}
          layout="vertical"
          initialValues={type ? { name: type.name, color: type.color } : { color: 'blue' }}
          onFinish={save}
        >
          {dom}
        </Form>
      )}
    >
      <Form.Item label="Nombre" name="name" rules={[{ required: true, whitespace: true, message: MESSAGES.typeNameRequired }]}>
        <Input maxLength={50} />
      </Form.Item>
      <Form.Item label="Color" name="color" rules={[{ required: true, message: MESSAGES.colorInvalid }]}>
        <Select options={COLOR_OPTIONS} listHeight={448} />
      </Form.Item>
    </Modal>
  )
}
