require "test_helper"

class AppointmentTest < ActiveSupport::TestCase
  test "requires an appointment type" do
    appointment = Appointment.new
    assert_not appointment.valid?
    assert_equal [ "Selecciona un tipo de cita" ], appointment.errors[:appointment_type]
  end
end
