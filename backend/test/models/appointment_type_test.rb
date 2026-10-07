require "test_helper"

class AppointmentTypeTest < ActiveSupport::TestCase
  test "requires a name" do
    appointment_type = AppointmentType.new(name: "   ")

    assert_not appointment_type.valid?
    assert_equal [ "El nombre es obligatorio" ], appointment_type.errors[:name]
  end

  test "requires a unique name ignoring accents, case and spaces" do
    AppointmentType.create!(name: "Revisión")
    appointment_type = AppointmentType.new(name: "REVISION ")

    assert_not appointment_type.valid?
    assert_equal [ "Ya existe un tipo de cita con ese nombre" ], appointment_type.errors[:name]
  end

  test "keeps its own name when updated" do
    appointment_type = appointment_types(:one)

    assert appointment_type.update(name: "  salud  ")
    assert_equal "salud", appointment_type.name
  end

  test "is not destroyed while it has appointments" do
    appointment_type = appointment_types(:one)

    assert_not appointment_type.destroy
    assert_equal [ "No se puede eliminar: hay citas con este tipo. Cambia su tipo o elimínalas primero" ], appointment_type.errors[:base]
  end
end
