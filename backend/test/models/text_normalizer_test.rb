require "test_helper"

class TextNormalizerTest < ActiveSupport::TestCase
  test "removes accents and case and squishes spaces" do
    assert_equal "cita medica", TextNormalizer.call("  Cita   MÉDICA ")
    assert_equal "nandu", TextNormalizer.call("Ñandú")
  end

  test "keeps numbers and symbols and turns nil into an empty string" do
    assert_equal "tramites #2 (100%)", TextNormalizer.call("Trámites #2 (100%)")
    assert_equal "", TextNormalizer.call(nil)
  end
end
