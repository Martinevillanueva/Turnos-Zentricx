import React from 'react';
import { SimpleAppointment } from '@/types/fhir';
import { TimeSlot } from '@/hooks/useTimeSlots';
import { useAppointmentPositioning } from '@/hooks/useAppointmentPositioning';
import { useAppointmentStatus } from '@/hooks/useAppointmentStatus';

interface AppointmentGridProps {
  timeSlots: TimeSlot[];
  appointments: SimpleAppointment[];
  selectedAppointment: SimpleAppointment | null;
  onAppointmentClick: (appointment: SimpleAppointment) => void;
  onTimeSlotClick?: (date: string, time: string, context: {
    selectedSpecialty?: { id: string; name: string };
    selectedDoctor?: { id: string; name: string };
  }) => void;
  selectedDate: string;
  filterSpecialty: string;
  filterDoctor: string;
  specialties: Array<{id: string, name: string}>;
  doctors: Array<{id: string, name: string, firstName: string, lastName: string, specialtyId?: string}>;
}

export default function AppointmentGrid({
  timeSlots,
  appointments,
  selectedAppointment,
  onAppointmentClick,
  onTimeSlotClick,
  selectedDate,
  filterSpecialty,
  filterDoctor,
  specialties,
  doctors
}: Readonly<AppointmentGridProps>) {
  const { getAppointmentPosition } = useAppointmentPositioning();
  const { getStatusColor } = useAppointmentStatus();

  const getCancellationCount = (appointment: SimpleAppointment) => {
    // Contar cuántos turnos cancelados hay para el mismo paciente y médico en el mismo horario
    const startTime = new Date(appointment.start || appointment.startTime || '');
    const timeKey = `${startTime.toDateString()}-${startTime.getHours()}:${startTime.getMinutes()}`;

    return appointments.filter(apt => {
      const aptStart = new Date(apt.start || apt.startTime || '');
      const aptTimeKey = `${aptStart.toDateString()}-${aptStart.getHours()}:${aptStart.getMinutes()}`;

      return aptTimeKey === timeKey &&
             apt.patientName === appointment.patientName &&
             apt.doctorName === appointment.doctorName &&
             (apt.status === 'cancelled' || apt.status?.slug === 'cancelled');
    }).length;
  };

  return (
    <div className="flex">
      {/* Columna de horarios */}
      <div className="w-20 border-r border-gray-200 bg-gray-50">
        <div className="bg-gray-100 border-b border-gray-200 text-xs font-medium text-gray-700 text-center p-2" style={{ height: '32px' }}>
          Hora
        </div>
        {timeSlots.map(slot => (
          <div
            key={slot.time}
            className="text-xs text-gray-600 text-center flex items-center justify-center border-b border-gray-100"
            style={{ height: '30px' }}
          >
            {slot.display}
          </div>
        ))}
      </div>

      {/* Columna de citas */}
      <div className="flex-1 relative flex flex-col min-w-0">
        {/* Header para alinear con la columna de hora */}
        <div className="bg-gray-100 border-b border-gray-200 text-xs font-medium text-gray-700 text-center p-2 z-20" style={{ height: '32px' }}>
          Agenda
        </div>

        <div className="relative">
          {/* Grid de fondo clickeable */}
          <div className="relative">
            {timeSlots.map(slot => {
              // Verificar si hay citas que se superponen con este slot
              const appointmentsInSlot = appointments.filter(appointment => {
                const appointmentStart = new Date(appointment.start);
                const slotStart = new Date(`${selectedDate}T${slot.time}:00`);
                const slotEnd = new Date(slotStart.getTime() + 30 * 60000); // +30 minutos

                // Verificar si la cita se superpone con este slot
                const appointmentEnd = new Date(appointment.end);
                return (
                  (appointmentStart < slotEnd && appointmentEnd > slotStart)
                );
              });

              const hasAppointment = appointmentsInSlot.length > 0;

              return (
                <div
                  key={slot.time}
                  className={`relative group transition-colors w-full text-left border-b border-gray-100 ${
                    hasAppointment
                      ? 'bg-gray-50 cursor-default'
                      : 'hover:bg-blue-50 cursor-pointer bg-transparent'
                  }`}
                  style={{ height: '30px' }}
                  onClick={hasAppointment ? undefined : (e) => {
                    e.preventDefault();
                    e.stopPropagation();
                    if (onTimeSlotClick) {
                      let selectedSpecialtyData = undefined;
                      let selectedDoctorData = undefined;
                      if (filterSpecialty) {
                        selectedSpecialtyData = specialties.find(s => s.id === filterSpecialty);
                      }
                      if (filterDoctor) {
                        const doctor = doctors.find(d => d.id === filterDoctor);
                        if (doctor) {
                          selectedDoctorData = {
                            id: doctor.id,
                            name: doctor.firstName && doctor.lastName
                              ? `${doctor.firstName} ${doctor.lastName}`
                              : doctor.name || 'Médico sin nombre'
                          };
                        }
                      }
                      const context = {
                        selectedSpecialty: selectedSpecialtyData,
                        selectedDoctor: selectedDoctorData
                      };
                      onTimeSlotClick(selectedDate, slot.time, context);
                    }
                  }}
                  role={hasAppointment ? undefined : "button"}
                  tabIndex={hasAppointment ? -1 : 0}
                  onKeyDown={hasAppointment ? undefined : (e) => {
                    if (e.key === 'Enter' || e.key === ' ') {
                      e.preventDefault();
                      if (onTimeSlotClick) {
                        let selectedSpecialtyData = undefined;
                        let selectedDoctorData = undefined;
                        if (filterSpecialty) {
                          selectedSpecialtyData = specialties.find(s => s.id === filterSpecialty);
                        }
                        if (filterDoctor) {
                          const doctor = doctors.find(d => d.id === filterDoctor);
                          if (doctor) {
                            selectedDoctorData = {
                              id: doctor.id,
                              name: doctor.firstName && doctor.lastName
                                ? `${doctor.firstName} ${doctor.lastName}`
                                : doctor.name || 'Médico sin nombre'
                            };
                          }
                        }
                        const context = {
                          selectedSpecialty: selectedSpecialtyData,
                          selectedDoctor: selectedDoctorData
                        };
                        onTimeSlotClick(selectedDate, slot.time, context);
                      }
                    }
                  }}
                >
                  {/* Indicador visual para espacios vacíos */}
                  {!hasAppointment && (
                    <div className="calendar-time-slot text-xs text-gray-600 text-center flex border-b border-gray-100 inset-0 flex items-center justify-center opacity-0 group-hover:opacity-100 transition-opacity bg-blue-50">
                      <div className="bg-blue-600 text-white px-3 py-1 rounded-md text-xs font-medium shadow-lg">
                        ✚ Nuevo turno {slot.time}
                      </div>
                    </div>
                  )}
                </div>
              );
            })}
          </div>

          {/* Citas posicionadas absolutamente */}
          <div className="absolute inset-0 pointer-events-none" style={{ top: 0 }}>
            {appointments.map((appointment, index) => {
              const position = getAppointmentPosition(appointment);
              const colorClass = getStatusColor(appointment);

              return (
                <button
                  key={`${appointment.id}-${index}`}
                  className={`pointer-events-auto ${colorClass} absolute border-l-4 p-1 rounded cursor-pointer transition-all hover:shadow-md text-left`}
                  style={{
                    top: `${position.top}px`,
                    height: `${position.height}px`,
                    left: `8px`,
                    right: `8px`,
                    minHeight: 'auto'
                  }}
                  onClick={(e) => {
                    e.preventDefault();
                    e.stopPropagation();
                    onAppointmentClick(appointment);
                  }}
                  onKeyDown={(e) => {
                    e.preventDefault();
                    e.stopPropagation();
                    if (e.key === 'Enter' || e.key === ' ') {
                      onAppointmentClick(appointment);
                    }
                  }}>
                  <div className="text-xs font-medium truncate">
                    {appointment.patientName} | {new Date(appointment.start).toLocaleTimeString('es-ES', { hour: '2-digit', minute: '2-digit' })} - {new Date(appointment.end).toLocaleTimeString('es-ES', { hour: '2-digit', minute: '2-digit' })}
                  </div>
                  {appointment.description && (
                    <div className="text-xs opacity-60 truncate mt-1">
                      {appointment.description}
                    </div>
                  )}

                  {/* Contador de cancelaciones */}
                  {(() => {
                    const cancellationCount = getCancellationCount(appointment);
                    return cancellationCount > 0 && (
                      <div className="absolute top-1 right-1 bg-red-500 text-white text-xs px-1 py-0.5 rounded-full min-w-[16px] text-center leading-none">
                        {cancellationCount}
                      </div>
                    );
                  })()}
                </button>
              );
            })}
          </div>
        </div>
      </div>
    </div>
  );
}