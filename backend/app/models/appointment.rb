class Appointment < ApplicationRecord
  belongs_to :appointment_type

  normalizes :title, with: ->(title) { title.squish }
  normalizes :location, with: ->(location) { location.squish.presence }

  validates :title, :starts_at, presence: true
  validate :ends_at_not_before_starts_at

  def as_json(options = nil)
    super({ include: { appointment_type: { only: %i[id name color] } } }.merge(options || {}))
  end

  private
    def ends_at_not_before_starts_at
      errors.add(:ends_at, :before_starts_at) if starts_at && ends_at && ends_at < starts_at
    end
end
