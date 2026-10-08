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

  test "squishes the location and leaves it empty when blank" do
    assert_equal "Hospital general", Appointment.new(location: "  Hospital   general ").location
    assert_nil Appointment.new(location: "   ").location
  end

  test "overlapping keeps appointments in progress or without end and excludes the end of the range" do
    type = appointment_types(:one)
    dentist = Appointment.create!(title: "Dentista", appointment_type: type, starts_at: "2026-10-02T11:00:00-07:00", ends_at: "2026-10-02T12:00:00-07:00")
    congress = Appointment.create!(title: "Congreso", appointment_type: type, starts_at: "2026-10-06T10:00:00-07:00", ends_at: "2026-10-08T18:00:00-07:00")
    passport = Appointment.create!(title: "Pasaporte", appointment_type: type, starts_at: "2026-10-10T09:00:00-07:00")
    candidates = Appointment.where(id: [ dentist, congress, passport ]).chronological
    from = Time.zone.parse("2026-10-07T00:00:00-07:00")

    assert_equal [ congress, passport ], candidates.overlapping(from, nil)
    assert_equal [ congress ], candidates.overlapping(from, passport.starts_at)
    assert_equal [ dentist, congress ], candidates.overlapping(nil, passport.starts_at)
  end

  test "chronological sorts by start and then by id" do
    type = appointment_types(:one)
    later = Appointment.create!(title: "B", appointment_type: type, starts_at: "2026-10-08T09:00:00-07:00")
    first = Appointment.create!(title: "A", appointment_type: type, starts_at: "2026-10-07T09:00:00-07:00")
    tie = Appointment.create!(title: "C", appointment_type: type, starts_at: "2026-10-07T09:00:00-07:00")

    assert_equal [ first, tie, later ], Appointment.where(id: [ later, first, tie ]).chronological
  end

  test "stores the title and notes without accents or case for searching" do
    appointment = Appointment.create!(title: "Cita MÉDICA", notes: "Llevar  estudios", appointment_type: appointment_types(:one), starts_at: Time.current)

    assert_equal "cita medica llevar estudios", appointment.search_text
  end

  test "search ignores accents and case and treats % as a normal character" do
    type = appointment_types(:one)
    medical = Appointment.create!(title: "Cita Médica", appointment_type: type, starts_at: Time.current)
    paperwork = Appointment.create!(title: "Trámites", notes: "Pagar el 100% del adeudo", appointment_type: type, starts_at: Time.current)

    assert_equal [ medical ], Appointment.search("MEDICA")
    assert_equal [ paperwork ], Appointment.search("tramites")
    assert_equal [ paperwork ], Appointment.search("%")
  end

  test "destroys its people when destroyed" do
    assert_difference("Person.count", -2) do
      appointments(:one).destroy
    end
  end
end
