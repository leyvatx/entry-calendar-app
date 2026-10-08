import { Button, Flex, Form, Input, Tooltip } from 'antd'
import { MinusCircleOutlined, PlusOutlined } from '@ant-design/icons'
import { MESSAGES } from '../lib/messages.js'

export default function PeopleField() {
  return (
    <Form.List name="people">
      {(fields, { add, remove }) => (
        <Flex vertical>
          {fields.map((field) => (
            <Flex key={field.key} gap="small" align="start">
              <Form.Item name={[field.name, 'id']} hidden>
                <Input />
              </Form.Item>
              <Form.Item
                name={[field.name, 'name']}
                style={{ flex: 1 }}
                rules={[{ required: true, whitespace: true, message: MESSAGES.personNameRequired }]}
              >
                <Input placeholder="Nombre" maxLength={100} />
              </Form.Item>
              <Tooltip title="Quitar persona">
                <Button type="text" icon={<MinusCircleOutlined />} aria-label="Quitar persona" onClick={() => remove(field.name)} />
              </Tooltip>
            </Flex>
          ))}
          <Button type="dashed" block icon={<PlusOutlined />} onClick={() => add()}>Agregar persona</Button>
        </Flex>
      )}
    </Form.List>
  )
}
