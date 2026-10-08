require "test_helper"

class AppointmentsControllerTest < ActionDispatch::IntegrationTest
  setup do
    @appointment = appointments(:one)
  end

  test "should get index with the appointment type of each appointment" do
    get appointments_url, as: :json

    assert_response :success
    assert_equal %w[Salud Trabajo], response.parsed_body.map { |appointment| appointment["appointment_type"]["name"] }.sort
  end

  test "should list appointments in a date range in chronological order" do
    type = appointment_types(:one)
    Appointment.create!(title: "Pasaporte", appointment_type: type, starts_at: "2026-10-10T09:00:00-07:00")
    Appointment.create!(title: "Comida", appointment_type: type, starts_at: "2026-10-08T14:00:00-07:00", ends_at: "2026-10-08T16:00:00-07:00")
    Appointment.create!(title: "Congreso", appointment_type: type, starts_at: "2026-10-06T10:00:00-07:00", ends_at: "2026-10-08T18:00:00-07:00")

    get appointments_url, params: { from: "2026-10-07T00:00:00-07:00", to: "2026-10-10T09:00:00-07:00" }

    assert_response :success
    assert_equal [ "Congreso", "Comida" ], response.parsed_body.map { |appointment| appointment["title"] }
  end

  test "should search appointments by title or notes" do
    type = appointment_types(:one)
    Appointment.create!(title: "Cita médica", appointment_type: type, starts_at: "2026-10-07T18:30:00-07:00")
    Appointment.create!(title: "Dentista", notes: "Llevar la receta MÉDICA", appointment_type: type, starts_at: "2026-10-02T11:00:00-07:00")
    Appointment.create!(title: "Comida familiar", appointment_type: type, starts_at: "2026-10-08T14:00:00-07:00")

    get appointments_url, params: { q: "medica" }

    assert_response :success
    assert_equal [ "Dentista", "Cita médica" ], response.parsed_body.map { |appointment| appointment["title"] }
    assert_not response.parsed_body.first.key?("search_text")
  end

  test "should filter appointments by type and combine it with the search" do
    health, work = appointment_types(:one), appointment_types(:two)
    paperwork = AppointmentType.create!(name: "Trámites")
    Appointment.create!(title: "Cita médica", appointment_type: health, starts_at: "2026-10-07T18:30:00-07:00")
    Appointment.create!(title: "Junta", notes: "Revisar la cita médica del equipo", appointment_type: work, starts_at: "2026-10-07T08:00:00-07:00")
    Appointment.create!(title: "Pasaporte", appointment_type: paperwork, starts_at: "2026-10-10T09:00:00-07:00")
    from = "2026-10-01T00:00:00-07:00"

    get appointments_url, params: { from: from, appointment_type_ids: "#{work.id},#{paperwork.id}" }
    assert_equal [ "Junta", "Pasaporte" ], response.parsed_body.map { |appointment| appointment["title"] }

    get appointments_url, params: { from: from, q: "medica", appointment_type_ids: health.id.to_s }
    assert_equal [ "Cita médica" ], response.parsed_body.map { |appointment| appointment["title"] }
  end

  test "should reject type ids that are not numbers" do
    get appointments_url, params: { appointment_type_ids: "salud,2" }

    assert_response :bad_request
    assert_equal({ "appointment_type_ids" => [ "Debe ser una lista de números separados por comas, por ejemplo 2,5" ] }, response.parsed_body)
  end

  test "should reject an invalid date filter" do
    get appointments_url, params: { from: "ayer" }

    assert_response :bad_request
    assert_equal({ "from" => [ "Debe ser una fecha y hora ISO 8601, por ejemplo 2026-10-07T00:00:00-07:00" ] }, response.parsed_body)
  end

  test "should create appointment" do
    assert_difference("Appointment.count") do
      post appointments_url, params: { appointment: { appointment_type_id: @appointment.appointment_type_id, title: "Cita médica", location: "Hospital general", ends_at: @appointment.ends_at, notes: @appointment.notes, starts_at: @appointment.starts_at } }, as: :json
    end

    assert_response :created
    assert_equal "Cita médica", response.parsed_body["title"]
    assert_equal "Hospital general", response.parsed_body["location"]
  end

  test "should show appointment with its type" do
    get appointment_url(@appointment), as: :json

    assert_response :success
    type = appointment_types(:one)
    assert_equal({ "id" => type.id, "name" => "Salud", "color" => "blue" }, response.parsed_body["appointment_type"])
  end

  test "should update appointment" do
    patch appointment_url(@appointment), params: { appointment: { appointment_type_id: @appointment.appointment_type_id, title: @appointment.title, ends_at: @appointment.ends_at, notes: @appointment.notes, starts_at: @appointment.starts_at } }, as: :json
    assert_response :success
  end

  test "should destroy appointment with its people" do
    assert_difference({ "Appointment.count" => -1, "Person.count" => -2 }) do
      delete appointment_url(@appointment), as: :json
    end

    assert_response :no_content
  end

  test "should create appointment with people" do
    post appointments_url, params: { appointment: { appointment_type_id: @appointment.appointment_type_id, title: "Comida familiar", starts_at: @appointment.starts_at, people_attributes: [ { name: "Mamá" }, { name: " Sofía " } ] } }, as: :json

    assert_response :created
    assert_equal [ "Mamá", "Sofía" ], response.parsed_body["people"].map { |person| person["name"] }
  end

  test "should update appointment adding and removing people" do
    laura, carlos = people(:laura), people(:carlos)

    patch appointment_url(@appointment), params: { appointment: { people_attributes: [ { id: carlos.id, name: "Carlos Ruiz" }, { name: "Dra. Ana López" }, { id: laura.id, _destroy: true } ] } }, as: :json

    assert_response :success
    assert_equal [ "Carlos Ruiz", "Dra. Ana López" ], response.parsed_body["people"].map { |person| person["name"] }
    assert_not Person.exists?(laura.id)
  end

  test "should report a person error at the position it was sent" do
    laura, carlos = people(:laura), people(:carlos)

    patch appointment_url(@appointment), params: { appointment: { people_attributes: [ { id: carlos.id, name: "Carlos Ruiz" }, { name: "  " }, { id: laura.id, _destroy: true } ] } }, as: :json

    assert_response :unprocessable_content
    assert_equal({ "people[1].name" => [ "El nombre de la persona es obligatorio" ] }, response.parsed_body)
    assert Person.exists?(laura.id)
  end
end
