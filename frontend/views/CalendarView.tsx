'use client';

import React, { useState } from 'react';
import { SimpleAppointment, AppointmentStatus } from '@/types/fhir';
import StatusLegend from '@/components/StatusLegend';
import CancelAppointmentModal from '@/modals/CancelAppointmentModal';
import AppointmentGrid from '@/components/AppointmentGrid';
import { CalendarFilters } from '@/filters';
import AppointmentDetailsModal from '@/modals/AppointmentDetailsModal';

interface CalendarViewProps {
  appointments: SimpleAppointment[];
  selectedDate: string;
  specialties: Array<{ id: string; name: string }>;
  doctors: Array<{
    id: string;
    name: string;
    firstName: string;
    lastName: string;
    specialtyId?: string;
  }>;
  filterSpecialty: string;
  filterDoctor: string;
  timeSlots: Array<{
    hour: number;
    minute: number;
    time: string;
    display: string;
  }>;
  filteredAppointments: SimpleAppointment[];
  uniqueDoctors: Array<{ name: string; color: string }>;
  localSpecialty: string;
  localDoctor: string;
  localDate: string;
  onSpecialtyChange: (specialty: string) => void;
  onDoctorChange: (doctor: string) => void;
  onDateChange: (date: string) => void;
  onApplyFilters: () => void;
  onStatusChange?: (id: string, status: AppointmentStatus) => void;
  onTimeSlotClick?: (
    date: string,
    time: string,
    context: {
      selectedSpecialty?: { id: string; name: string };
      selectedDoctor?: { id: string; name: string };
    }
  ) => void;
}

export default function CalendarView({
  appointments,
  selectedDate,
  specialties,
  doctors,
  filterSpecialty,
  filterDoctor,
  timeSlots,
  filteredAppointments,
  uniqueDoctors,
  localSpecialty,
  localDoctor,
  localDate,
  onSpecialtyChange,
  onDoctorChange,
  onDateChange,
  onApplyFilters,
  onStatusChange,
  onTimeSlotClick,
}: Readonly<CalendarViewProps>) {
  const [selectedAppointment, setSelectedAppointment] =
    useState<SimpleAppointment | null>(null);
  const [showCancelConfirm, setShowCancelConfirm] = useState(false);

  const handleTimeSlotClick = (
    date: string,
    time: string,
    context: {
      selectedSpecialty?: { id: string; name: string };
      selectedDoctor?: { id: string; name: string };
    }
  ) => {
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
              {(() => {
                const date = new Date(selectedDate + 'T00:00:00');
                return date.toLocaleDateString('es-ES', {
                  weekday: 'long',
                  year: 'numeric',
                  month: 'long',
                  day: 'numeric',
                });
              })()}
            </p>
          </div>
          <div className="text-blue-100 text-center">
            <div className="text-2xl font-bold">
              {filteredAppointments.length}
            </div>
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
          onSpecialtyChange={onSpecialtyChange}
          onDoctorChange={onDoctorChange}
          onDateChange={onDateChange}
          onApplyFilters={onApplyFilters}
        />
      </div>

      {/* Leyenda de médicos */}
      {uniqueDoctors.length > 0 && filterSpecialty && filterDoctor && (
        <div className="border-b border-gray-200 p-4">
          <h3 className="text-sm font-medium text-gray-700 mb-2">
            Médico seleccionado:
          </h3>
          <div className="flex flex-wrap gap-2">
            {uniqueDoctors.map((doctor) => (
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
      {!filterSpecialty || !filterDoctor ? (
        <div className="border-b border-gray-200 p-8">
          <div className="text-center text-gray-500">
            <div className="mx-auto h-16 w-16 text-gray-400 mb-4">
              <svg fill="none" viewBox="0 0 24 24" stroke="currentColor">
                <path
                  strokeLinecap="round"
                  strokeLinejoin="round"
                  strokeWidth={1}
                  d="M8 7V3a2 2 0 012-2h4a2 2 0 012 2v4h3a2 2 0 012 2v12a2 2 0 01-2 2H3a2 2 0 01-2-2V9a2 2 0 012-2h5z"
                />
              </svg>
            </div>
            <h3 className="text-lg font-medium text-gray-900 mb-2">
              Seleccione especialidad y médico
            </h3>
            <p className="text-gray-500">
              Para ver la agenda, debe seleccionar una especialidad y un médico
              en los filtros de arriba.
            </p>
          </div>
        </div>
      ) : (
        <>
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
                  onStatusChange(
                    selectedAppointment.id,
                    'cancelled' as AppointmentStatus
                  );
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
