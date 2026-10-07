require "test_helper"

class AppointmentTypeTest < ActiveSupport::TestCase
  test "is not destroyed while it has appointments" do
    appointment_type = appointment_types(:one)
    assert_not appointment_type.destroy
    assert_equal [ "No se puede eliminar: hay citas con este tipo. Cambia su tipo o elimínalas primero" ], appointment_type.errors[:base]
  end
end
