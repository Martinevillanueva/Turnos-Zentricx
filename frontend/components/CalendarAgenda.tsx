'use client';

import React, { useState, useEffect } from 'react';
import { SimpleAppointment, AppointmentStatus } from '@/types/fhir';
import StatusLegend from './StatusLegend';
import CancelAppointmentModal from '@/modals/CancelAppointmentModal';
import AppointmentGrid from './AppointmentGrid';
import { CalendarFilters } from '@/filters';
import AppointmentDetailsModal from '@/modals/AppointmentDetailsModal';
import { useCalendarFilters } from '@/hooks/useCalendarFilters';
import { useTimeSlots } from '@/hooks/useTimeSlots';
import { useAppointmentFiltering } from '@/hooks/useAppointmentFiltering';
import { useAppointmentFormatting } from '@/hooks/useAppointmentFormatting';

interface CalendarAgendaProps {
  appointments: SimpleAppointment[];
  selectedDate: string;
  specialties: Array<{id: string, name: string}>;
  doctors: Array<{id: string, name: string, firstName: string, lastName: string, specialtyId?: string}>;
  filterSpecialty: string;
  filterDoctor: string;
  onAppointmentClick?: (appointment: SimpleAppointment) => void;
  onStatusChange?: (id: string, status: AppointmentStatus) => void;
  onTimeSlotClick?: (date: string, time: string, context: {
    selectedSpecialty?: { id: string; name: string };
    selectedDoctor?: { id: string; name: string };
  }) => void;
  onFiltersChange?: (specialty: string, doctor: string, date: string) => void;
}

interface Doctor {
  id: string;
  firstName: string;
  lastName: string;
  fullName?: string;
}

interface Specialty {
  id: string;
  name: string;
}

interface TimeSlot {
  hour: number;
  minute: number;
  time: string;
  display: string;
}

export default function CalendarAgenda({ 
  appointments, 
  selectedDate, 
  specialties,
  doctors,
  filterSpecialty,
  filterDoctor,
  onAppointmentClick, 
  onStatusChange,
  onTimeSlotClick,
  onFiltersChange 
}: Readonly<CalendarAgendaProps>) {

  const [selectedAppointment, setSelectedAppointment] = useState<SimpleAppointment | null>(null);
  const [showCancelConfirm, setShowCancelConfirm] = useState(false);

  // Hook para filtros
  const {
    localSpecialty,
    localDoctor,
    localDate,
    setLocalSpecialty,
    setLocalDoctor,
    setLocalDate,
  } = useCalendarFilters({
    initialSpecialty: filterSpecialty,
    initialDoctor: filterDoctor,
    initialDate: selectedDate,
  });

  // Hooks para lógica modular
  const timeSlots = useTimeSlots();
  const { formatFullDate } = useAppointmentFormatting();
  // Usar los filtros aplicados (props) en lugar de los locales para mostrar las citas
  const filteredAppointments = useAppointmentFiltering({
    appointments,
    selectedDate,
    filterSpecialty: filterSpecialty,
    filterDoctor: filterDoctor,
    specialties,
    doctors
  });

  // Verificar si se deben mostrar filtros de selección
  const showSelectionPrompt = !localSpecialty || !localDoctor;

  // Resetear médico cuando cambia la especialidad
  useEffect(() => {
    if (localSpecialty) {
      const doctorsForSpecialty = doctors.filter(doctor => 
        String(doctor.specialtyId) === String(localSpecialty)
      );
      
      if (doctorsForSpecialty.length > 0) {
        // Si el médico actual no pertenece a la especialidad, seleccionar el primero
        const currentDoctorBelongs = doctorsForSpecialty.some(doctor => 
          String(doctor.id) === String(localDoctor)
        );
        
        if (!currentDoctorBelongs) {
          setLocalDoctor(doctorsForSpecialty[0].id);
        }
      } else {
        // Si no hay médicos para esta especialidad, limpiar
        setLocalDoctor("");
      }
    } else {
      // Si no hay especialidad seleccionada, limpiar médico
      setLocalDoctor("");
    }
  }, [localSpecialty, doctors]);

  // Obtener médicos únicos de las citas filtradas
  const getUniqueDoctors = () => {
    const uniqueDoctors = new Map<string, { name: string; color: string }>();
    const colors = [
      'bg-blue-100 border-blue-300 text-blue-800',
      'bg-green-100 border-green-300 text-green-800',
      'bg-purple-100 border-purple-300 text-purple-800',
      'bg-orange-100 border-orange-300 text-orange-800',
      'bg-pink-100 border-pink-300 text-pink-800',
      'bg-indigo-100 border-indigo-300 text-indigo-800',
      'bg-yellow-100 border-yellow-300 text-yellow-800',
      'bg-red-100 border-red-300 text-red-800'
    ];

    let colorIndex = 0;
    for (const appointment of filteredAppointments) {
      let doctorName = appointment.doctorName || 'Sin médico';
      if (appointment.doctor?.fullName) {
        doctorName = appointment.doctor.fullName;
      } else if (appointment.doctor?.firstName && appointment.doctor?.lastName) {
        doctorName = `${appointment.doctor.firstName} ${appointment.doctor.lastName}`;
      }

      if (!uniqueDoctors.has(doctorName)) {
        uniqueDoctors.set(doctorName, {
          name: doctorName,
          color: colors[colorIndex % colors.length]
        });
        colorIndex++;
      }
    }

    return Array.from(uniqueDoctors.entries()).map(([doctorName, data]) => ({ 
      name: doctorName, 
      color: data.color 
    }));
  };

  const uniqueDoctors = getUniqueDoctors();

  const handleTimeSlotClick = (date: string, time: string, context: {
    selectedSpecialty?: { id: string; name: string };
    selectedDoctor?: { id: string; name: string };
  }) => {
    if (onTimeSlotClick) {
      onTimeSlotClick(date, time, context);
    }
  };



  return (
    <div className="bg-white rounded-lg shadow-lg overflow-hidden">
      {/* Header con filtros */}
      <div className="bg-gradient-to-r from-blue-600 to-blue-700 text-white p-6">
        <div className="flex items-center justify-between mb-4">
          <div>
            <h2 className="text-2xl font-bold">Agenda por fecha:</h2>
            <p className="text-blue-100">
              {formatFullDate(new Date(selectedDate + 'T00:00:00'))}
            </p>
          </div>
          <div className="text-blue-100 text-center">
            <div className="text-2xl font-bold">{filteredAppointments.length}</div>
            <div className="text-sm">turnos</div>
          </div>
        </div>

        {/* Filtros */}
        <CalendarFilters
          localSpecialty={localSpecialty}
          localDoctor={localDoctor}
          localDate={localDate}
          specialties={specialties}
          doctors={doctors}
          onSpecialtyChange={setLocalSpecialty}
          onDoctorChange={setLocalDoctor}
          onDateChange={setLocalDate}
          onApplyFilters={() => onFiltersChange?.(localSpecialty, localDoctor, localDate)}
        />
      </div>

      {/* Leyenda de médicos */}
      {uniqueDoctors.length > 0 && !showSelectionPrompt && (
        <div className="border-b border-gray-200 p-4">
          <h3 className="text-sm font-medium text-gray-700 mb-2">Médico seleccionado:</h3>
          <div className="flex flex-wrap gap-2">
            {uniqueDoctors.map(doctor => (
              <div
                key={doctor.name}
                className={`px-3 py-1 rounded-full text-xs font-medium border ${doctor.color}`}
              >
                {doctor.name}
              </div>
            ))}
          </div>
        </div>
      )}

      {/* Si falta especialidad o médico, solo mostrar mensaje de selección */}
      {(!filterSpecialty || !filterDoctor) ? (
        <div className="border-b border-gray-200 p-8">
          <div className="text-center text-gray-500">
            <div className="mx-auto h-16 w-16 text-gray-400 mb-4">
              <svg fill="none" viewBox="0 0 24 24" stroke="currentColor">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1} 
                  d="M8 7V3a2 2 0 012-2h4a2 2 0 012 2v4h3a2 2 0 012 2v12a2 2 0 01-2 2H3a2 2 0 01-2-2V9a2 2 0 012-2h5z" />
              </svg>
            </div>
            <h3 className="text-lg font-medium text-gray-900 mb-2">
              Seleccione especialidad y médico
            </h3>
            <p className="text-gray-500">
              Para ver la agenda, debe seleccionar una especialidad y un médico en los filtros de arriba.
            </p>
          </div>
        </div>
      ) : (
        <>
          {/* Agenda y modales solo si ambos filtros están seleccionados */}
          {/* Agenda */}
          <AppointmentGrid
            timeSlots={timeSlots}
            appointments={filteredAppointments}
            selectedAppointment={selectedAppointment}
            onAppointmentClick={setSelectedAppointment}
            onTimeSlotClick={handleTimeSlotClick}
            selectedDate={selectedDate}
            filterSpecialty={filterSpecialty}
            filterDoctor={filterDoctor}
            specialties={specialties}
            doctors={doctors}
          />

          {/* Modal de detalles de cita */}
          {selectedAppointment && (
            <AppointmentDetailsModal
              appointment={selectedAppointment}
              isOpen={!!selectedAppointment}
              onClose={() => setSelectedAppointment(null)}
              onStatusChange={onStatusChange}
              onTimeSlotClick={onTimeSlotClick}
              onCancelAppointment={() => setShowCancelConfirm(true)}
            />
          )}

          {/* Modal de confirmación para cancelar turno */}
          {showCancelConfirm && selectedAppointment && (
            <CancelAppointmentModal
              patientName={selectedAppointment.patientName}
              isOpen={showCancelConfirm}
              onCancel={() => setShowCancelConfirm(false)}
              onConfirm={() => {
                if (selectedAppointment.id && onStatusChange) {
                  onStatusChange(selectedAppointment.id, 'cancelled' as AppointmentStatus);
                  setSelectedAppointment(null);
                  setShowCancelConfirm(false);
                }
              }}
            />
          )}
        </>
      )}

      {/* Leyenda de colores */}
      <StatusLegend />
    </div>
  );
}