import React from 'react';
import { SimpleAppointment } from '@/types/fhir';
import { TimeSlot } from '@/hooks/useTimeSlots';

interface AppointmentSlotProps {
  slot: TimeSlot;
  selectedDate: string;
  appointmentsInSlot: SimpleAppointment[];
  onTimeSlotClick?: (date: string, time: string, context: {
    selectedSpecialty?: { id: string; name: string };
    selectedDoctor?: { id: string; name: string };
  }) => void;
  filterSpecialty: string;
  filterDoctor: string;
  specialties: Array<{id: string, name: string}>;
  doctors: Array<{id: string, name: string, firstName: string, lastName: string, specialtyId?: string}>;
}

export default function AppointmentSlot({
  slot,
  selectedDate,
  appointmentsInSlot,
  onTimeSlotClick,
  filterSpecialty,
  filterDoctor,
  specialties,
  doctors
}: Readonly<AppointmentSlotProps>) {
  const hasAppointment = appointmentsInSlot.length > 0;

  const handleClick = () => {
    if (hasAppointment || !onTimeSlotClick) return;

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
  };

  const handleKeyDown = (e: React.KeyboardEvent) => {
    if (e.key === 'Enter' || e.key === ' ') {
      e.preventDefault();
      handleClick();
    }
  };

  return (
    <div
      className={`relative group transition-colors w-full text-left border-b border-gray-100 ${
        hasAppointment
          ? 'bg-gray-50 cursor-default'
          : 'hover:bg-blue-50 cursor-pointer bg-transparent'
      }`}
      style={{ height: '30px' }}
      onClick={handleClick}
      role={hasAppointment ? undefined : "button"}
      tabIndex={hasAppointment ? -1 : 0}
      onKeyDown={hasAppointment ? undefined : handleKeyDown}
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
}