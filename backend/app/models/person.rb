class Person < ApplicationRecord
  belongs_to :appointment, inverse_of: :people

  normalizes :name, with: ->(name) { name.squish }

  validates :name, presence: true
end
