export const TYPE_COLORS = [
  { value: 'blue', label: 'Azul' }, { value: 'geekblue', label: 'Índigo' }, { value: 'purple', label: 'Morado' },
  { value: 'magenta', label: 'Magenta' }, { value: 'pink', label: 'Rosa' }, { value: 'red', label: 'Rojo' },
  { value: 'volcano', label: 'Bermellón' }, { value: 'orange', label: 'Naranja' }, { value: 'gold', label: 'Dorado' },
  { value: 'yellow', label: 'Amarillo' }, { value: 'lime', label: 'Lima' }, { value: 'green', label: 'Verde' },
  { value: 'cyan', label: 'Cian' },
]

export const colorLabel = (value) => TYPE_COLORS.find((c) => c.value === value)?.label ?? value
