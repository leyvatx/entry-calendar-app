class RenameDescriptionToTitleInAppointments < ActiveRecord::Migration[7.2]
  def change
    rename_column :appointments, :description, :title
  end
end
