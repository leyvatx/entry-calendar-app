# This file is auto-generated from the current state of the database. Instead
# of editing this file, please use the migrations feature of Active Record to
# incrementally modify your database, and then regenerate this schema definition.
#
# This file is the source Rails uses to define your schema when running `bin/rails
# db:schema:load`. When creating a new database, `bin/rails db:schema:load` tends to
# be faster and is potentially less error prone than running all of your
# migrations from scratch. Old migrations may fail to apply correctly if those
# migrations use external dependencies or application code.
#
# It's strongly recommended that you check this file into your version control system.

ActiveRecord::Schema[7.2].define(version: 2026_10_08_052314) do
  create_table "appointment_types", force: :cascade do |t|
    t.string "name", null: false
    t.datetime "created_at", null: false
    t.datetime "updated_at", null: false
    t.string "normalized_name", null: false
    t.string "color", default: "blue", null: false
    t.index ["normalized_name"], name: "index_appointment_types_on_normalized_name", unique: true
  end

  create_table "appointments", force: :cascade do |t|
    t.string "title", null: false
    t.text "notes"
    t.integer "appointment_type_id", null: false
    t.datetime "starts_at", null: false
    t.datetime "ends_at"
    t.datetime "created_at", null: false
    t.datetime "updated_at", null: false
    t.string "location"
    t.index ["appointment_type_id"], name: "index_appointments_on_appointment_type_id"
    t.index ["starts_at"], name: "index_appointments_on_starts_at"
  end

  create_table "people", force: :cascade do |t|
    t.integer "appointment_id", null: false
    t.string "name", null: false
    t.datetime "created_at", null: false
    t.datetime "updated_at", null: false
    t.index ["appointment_id"], name: "index_people_on_appointment_id"
  end

  add_foreign_key "appointments", "appointment_types"
  add_foreign_key "people", "appointments"
end
