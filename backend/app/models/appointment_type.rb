class AppointmentType < ApplicationRecord
  has_many :appointments, dependent: :restrict_with_error

  normalizes :name, with: ->(name) { name.squish }

  before_validation { self.normalized_name = TextNormalizer.call(name) }

  validates :name, presence: true
  validate :name_must_be_unique

  def as_json(options = nil)
    super({ except: :normalized_name }.merge(options || {}))
  end

  private
    def name_must_be_unique
      errors.add(:name, :taken) if AppointmentType.where(normalized_name: normalized_name).where.not(id: id).exists?
    end
end
