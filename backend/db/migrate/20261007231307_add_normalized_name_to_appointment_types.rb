class AddNormalizedNameToAppointmentTypes < ActiveRecord::Migration[7.2]
  def change
    add_column :appointment_types, :normalized_name, :string

    up_only do
      types = Class.new(ActiveRecord::Base) { self.table_name = "appointment_types" }
      types.find_each do |type|
        name = type.name.to_s.squish.presence || "Tipo #{type.id}"
        type.update_columns(name: name, normalized_name: TextNormalizer.call(name))
      end
    end

    change_column_null :appointment_types, :name, false
    change_column_null :appointment_types, :normalized_name, false
    add_index :appointment_types, :normalized_name, unique: true
  end
end
