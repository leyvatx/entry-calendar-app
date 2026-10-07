class RequireTitleAndStartsAtInAppointments < ActiveRecord::Migration[7.2]
  def change
    change_column_null :appointments, :title, false, "Sin título"
    change_column_null :appointments, :starts_at, false, Time.current
  end
end
