class Appointment < ApplicationRecord
  belongs_to :appointment_type

  normalizes :title, with: ->(title) { title.squish }

  validates :title, :starts_at, presence: true
  validate :ends_at_not_before_starts_at

  private
    def ends_at_not_before_starts_at
      errors.add(:ends_at, :before_starts_at) if starts_at && ends_at && ends_at < starts_at
    end
end
