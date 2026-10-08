class AddIndexToAppointmentsOnStartsAt < ActiveRecord::Migration[7.2]
  def change
    add_index :appointments, :starts_at
  end
end
