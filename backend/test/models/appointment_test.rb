require "test_helper"

class AppointmentTest < ActiveSupport::TestCase
  test "requires a title" do
    appointment = Appointment.new(title: "   ")

    assert_not appointment.valid?
    assert_equal [ "El título es obligatorio" ], appointment.errors[:title]
  end

  test "requires an appointment type" do
    appointment = Appointment.new

    assert_not appointment.valid?
    assert_equal [ "Selecciona un tipo de cita" ], appointment.errors[:appointment_type]
  end

  test "requires a start date" do
    appointment = Appointment.new

    assert_not appointment.valid?
    assert_equal [ "La fecha de inicio es obligatoria" ], appointment.errors[:starts_at]
  end

  test "rejects an end before the start" do
    appointment = appointments(:one)
    appointment.ends_at = appointment.starts_at - 1.minute

    assert_not appointment.valid?
    assert_equal [ "La fecha de fin no puede ser anterior a la de inicio" ], appointment.errors[:ends_at]
  end

  test "accepts an end equal to the start or no end" do
    appointment = appointments(:one)

    appointment.ends_at = appointment.starts_at
    assert appointment.valid?

    appointment.ends_at = nil
    assert appointment.valid?
  end

  test "squishes the title" do
    assert_equal "Cita médica", Appointment.new(title: "  Cita   médica ").title
  end
end
