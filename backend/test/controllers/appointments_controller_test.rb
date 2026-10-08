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

  test "should destroy appointment" do
    assert_difference("Appointment.count", -1) do
      delete appointment_url(@appointment), as: :json
    end

    assert_response :no_content
  end
end
