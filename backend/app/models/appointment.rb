class Appointment < ApplicationRecord
  belongs_to :appointment_type

  normalizes :title, with: ->(title) { title.squish }

  validates :title, :starts_at, presence: true
end
