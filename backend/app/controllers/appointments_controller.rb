class AppointmentsController < ApplicationController
  before_action :set_appointment, only: %i[ show update destroy ]

  # GET /appointments
  def index
    range = %i[from to].index_with { |name| time_param(name) }
    invalid = range.keys.select { |name| params[name].present? && range[name].nil? }

    if invalid.any?
      render json: invalid.index_with { [ I18n.t("api.errors.invalid_datetime") ] }, status: :bad_request
    else
      @appointments = Appointment.includes(:appointment_type, :people).chronological.overlapping(range[:from], range[:to])
      render json: @appointments
    end
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
end
