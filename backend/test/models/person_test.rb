require "test_helper"

class PersonTest < ActiveSupport::TestCase
  test "requires a name" do
    person = Person.new(appointment: appointments(:one), name: "   ")

    assert_not person.valid?
    assert_equal [ "El nombre de la persona es obligatorio" ], person.errors[:name]
  end
end
