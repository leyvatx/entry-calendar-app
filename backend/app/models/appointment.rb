class Appointment < ApplicationRecord
  belongs_to :appointment_type
  has_many :people, -> { order(:id) }, dependent: :destroy, inverse_of: :appointment, index_errors: :nested_attributes_order

  accepts_nested_attributes_for :people, allow_destroy: true

  normalizes :title, with: ->(title) { title.squish }
  normalizes :location, with: ->(location) { location.squish.presence }

  validates :title, :starts_at, presence: true
  validate :ends_at_not_before_starts_at

  scope :chronological, -> { order(:starts_at, :id) }
  scope :overlapping, ->(from, to) {
    relation = from ? where("COALESCE(ends_at, starts_at) >= ?", from) : all
    to ? relation.where(starts_at: ...to) : relation
  }

  def as_json(options = nil)
    super({ include: { appointment_type: { only: %i[id name color] }, people: { only: %i[id name] } } }.merge(options || {}))
  end

  private
    def ends_at_not_before_starts_at
      errors.add(:ends_at, :before_starts_at) if starts_at && ends_at && ends_at < starts_at
    end
end
