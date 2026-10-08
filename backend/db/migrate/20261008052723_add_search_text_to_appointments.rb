class AddSearchTextToAppointments < ActiveRecord::Migration[7.2]
  def change
    add_column :appointments, :search_text, :text, null: false, default: ""

    up_only do
      appointments = Class.new(ActiveRecord::Base) { self.table_name = "appointments" }
      appointments.find_each do |appointment|
        appointment.update_columns(search_text: TextNormalizer.call("#{appointment.title} #{appointment.notes}"))
      end
    end
  end
end
