class AppointmentsController < ApplicationController
  before_action :set_appointment, only: %i[ show update destroy ]

  # GET /appointments
  def index
    from, to, type_ids = time_param(:from), time_param(:to), type_ids_param
    errors = {}
    errors[:from] = [ I18n.t("api.errors.invalid_datetime") ] if params[:from].present? && from.nil?
    errors[:to] = [ I18n.t("api.errors.invalid_datetime") ] if params[:to].present? && to.nil?
    errors[:appointment_type_ids] = [ I18n.t("api.errors.invalid_ids") ] if params[:appointment_type_ids].present? && type_ids.nil?
    return render json: errors, status: :bad_request if errors.any?

    @appointments = Appointment.includes(:appointment_type, :people).chronological.overlapping(from, to)
    @appointments = @appointments.search(params[:q]) if params[:q].present?
    @appointments = @appointments.of_types(type_ids) if type_ids
    render json: @appointments
  end

  # GET /appointments/1
  def show
    render json: @appointment
  end

  # POST /appointments
  def create
    @appointment = Appointment.new(appointment_params)

    if @appointment.save
      render json: @appointment, status: :created, location: @appointment
    else
      render json: @appointment.errors, status: :unprocessable_content
    end
  end

  # PATCH/PUT /appointments/1
  def update
    if @appointment.update(appointment_params)
      render json: @appointment
    else
      render json: @appointment.errors, status: :unprocessable_content
    end
  end

  # DELETE /appointments/1
  def destroy
    @appointment.destroy!
  end

  private
    # Use callbacks to share common setup or constraints between actions.
    def set_appointment
      @appointment = Appointment.find(params[:id])
    end

    # Only allow a list of trusted parameters through.
    def appointment_params
      params.require(:appointment).permit(:title, :notes, :location, :appointment_type_id, :starts_at, :ends_at, people_attributes: %i[id name _destroy])
    end

    def time_param(name)
      Time.zone.iso8601(params[name]) if params[name].present?
    rescue ArgumentError, TypeError
      nil
    end

    def type_ids_param
      ids = params[:appointment_type_ids]
      ids.split(",").map { |id| Integer(id, 10) } if ids.is_a?(String) && ids.present?
    rescue ArgumentError
      nil
    end
end
