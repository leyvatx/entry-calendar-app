class CreatePeople < ActiveRecord::Migration[7.2]
  def change
    create_table :people do |t|
      t.references :appointment, null: false, foreign_key: true
      t.string :name, null: false

      t.timestamps
    end
  end
end
