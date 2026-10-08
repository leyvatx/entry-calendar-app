types = { "Salud" => "green", "Trabajo" => "blue", "Personal" => "purple", "Trámites" => "orange", "Cumpleaños" => "gold" }
  .to_h { |name, color| [ name, AppointmentType.find_or_create_by!(name: name) { |type| type.color = color } ] }

unless Appointment.exists?
  today = Time.zone.today
  at = ->(day, time) { Time.zone.parse("#{day} #{time}") }
  people = ->(*names) { names.map { |name| { name: name } } }

  Appointment.create!([
    { title: "Junta semanal de equipo", appointment_type: types["Trabajo"], starts_at: at[today, "08:00"], ends_at: at[today, "09:00"],
      location: "Sala de juntas 2", notes: "Revisar avances del sprint", people_attributes: people["Laura Méndez", "Carlos Ruiz"] },
    { title: "Cita médica", appointment_type: types["Salud"], starts_at: at[today, "18:30"], ends_at: at[today, "19:30"],
      location: "Hospital general", notes: "Llevar estudios de laboratorio", people_attributes: people["Dra. Ana López"] },
    { title: "Congreso de tecnología", appointment_type: types["Trabajo"], starts_at: at[today - 1, "10:00"], ends_at: at[today + 1, "18:00"],
      location: "Centro de convenciones", notes: "Recoger el gafete en registro" },
    { title: "Comida familiar", appointment_type: types["Personal"], starts_at: at[today + 1, "14:00"], ends_at: at[today + 1, "16:00"],
      location: "Restaurante del centro", people_attributes: people["Mamá", "Papá", "Sofía"] },
    { title: "Renovar pasaporte", appointment_type: types["Trámites"], starts_at: at[today + 3, "09:00"],
      location: "Oficina de pasaportes", notes: "Llevar acta de nacimiento y comprobante de domicilio" },
    { title: "Clase de natación", appointment_type: types["Personal"], starts_at: at[today + 7, "17:00"], ends_at: at[today + 7, "18:00"],
      location: "Deportivo municipal" },
    { title: "Dentista", appointment_type: types["Salud"], starts_at: at[today - 5, "11:00"], ends_at: at[today - 5, "12:00"],
      location: "Clínica dental", notes: "Limpieza semestral" },
    { title: "Revisión anual del auto", appointment_type: types["Trámites"], starts_at: at[today + 20, "08:30"], ends_at: at[today + 20, "10:00"],
      location: "Agencia" },
    { title: "Entrega de proyecto", appointment_type: types["Trabajo"], starts_at: at[today.next_month.beginning_of_month + 1, "10:00"],
      ends_at: at[today.next_month.beginning_of_month + 1, "11:00"] }
  ])
end
