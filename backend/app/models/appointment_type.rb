class AppointmentType < ApplicationRecord
  has_many :appointments, dependent: :restrict_with_error
end
