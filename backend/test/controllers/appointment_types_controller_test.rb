require "test_helper"

class AppointmentTypesControllerTest < ActionDispatch::IntegrationTest
  setup do
    @appointment_type = appointment_types(:one)
  end

  test "should get index sorted by name with the number of appointments" do
    AppointmentType.create!(name: "Escuela")

    get appointment_types_url, as: :json

    assert_response :success
    assert_equal [ [ "Escuela", 0 ], [ "Salud", 1 ], [ "Trabajo", 1 ] ], response.parsed_body.map { |type| type.values_at("name", "appointments_count") }
  end

  test "should create appointment_type" do
    assert_difference("AppointmentType.count") do
      post appointment_types_url, params: { appointment_type: { name: "Escuela", color: "cyan" } }, as: :json
    end

    assert_response :created
    assert_equal "cyan", response.parsed_body["color"]
    assert_not response.parsed_body.key?("normalized_name")
  end

  test "should not create appointment_type with a taken name" do
    assert_no_difference("AppointmentType.count") do
      post appointment_types_url, params: { appointment_type: { name: "SALUD" } }, as: :json
    end

    assert_response :unprocessable_content
    assert_equal({ "name" => [ "Ya existe un tipo de cita con ese nombre" ] }, response.parsed_body)
  end

  test "should show appointment_type" do
    get appointment_type_url(@appointment_type), as: :json

    assert_response :success
    assert_equal %w[color id name], response.parsed_body.keys.sort
  end

  test "should update appointment_type" do
    patch appointment_type_url(@appointment_type), params: { appointment_type: { name: @appointment_type.name } }, as: :json
    assert_response :success
  end

  test "should destroy appointment_type without appointments" do
    appointment_type = AppointmentType.create!(name: "Sin citas")

    assert_difference("AppointmentType.count", -1) do
      delete appointment_type_url(appointment_type), as: :json
    end

    assert_response :no_content
  end

  test "should not destroy appointment_type with appointments" do
    assert_no_difference("AppointmentType.count") do
      delete appointment_type_url(@appointment_type), as: :json
    end

    assert_response :unprocessable_content
    assert_equal [ "No se puede eliminar: hay citas con este tipo. Cambia su tipo o elimínalas primero" ], response.parsed_body["base"]
  end
end
