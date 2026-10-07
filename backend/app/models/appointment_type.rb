class AppointmentType < ApplicationRecord
  COLORS = %w[blue purple cyan green magenta pink red orange yellow volcano geekblue lime gold].freeze

  has_many :appointments, dependent: :restrict_with_error

  normalizes :name, with: ->(name) { name.squish }
  normalizes :color, with: ->(color) { color.strip.downcase }

  before_validation { self.normalized_name = TextNormalizer.call(name) }

  validates :name, presence: true
  validates :color, inclusion: { in: COLORS }
  validate :name_must_be_unique

  scope :with_appointments_count, -> {
    left_joins(:appointments)
      .select("appointment_types.*, COUNT(appointments.id) AS appointments_count")
      .group("appointment_types.id")
  }

  def as_json(options = nil)
    super({ only: %i[id name color appointments_count] }.merge(options || {}))
  end

  private
    def name_must_be_unique
      errors.add(:name, :taken) if AppointmentType.where(normalized_name: normalized_name).where.not(id: id).exists?
    end
end
