'use client';

import React from 'react';
import AppointmentCard from '@/components/AppointmentCard';
import { SelectFilter } from '@/filters';
import StatusLegend from '@/components/StatusLegend';
import { SimpleAppointment, AppointmentStatus } from '@/types/fhir';

interface AppointmentListViewProps {
  appointments: SimpleAppointment[];
  specialties: Array<{ id: string; name: string }>;
  doctors: Array<{
    id: string;
    name: string;
    firstName: string;
    lastName: string;
    specialtyId?: string;
    specialty?: any;
  }>;
  listFilterSpecialty: string;
  listFilterDoctor: string;
  listFilterPatientName: string;
  listShowCancelled: boolean;
  onSpecialtyChange: (value: string) => void;
  onDoctorChange: (value: string) => void;
  onPatientNameChange: (value: string) => void;
  onShowCancelledChange: (value: boolean) => void;
  onStatusChange: (id: string, status: AppointmentStatus) => void;
  onTimeSlotClick: (date: string, time: string, context?: any) => void;
  onLoadAppointments: () => void;
  currentPage: number;
  totalPages: number;
  total: number;
  startIndex: number;
  endIndex: number;
  onPageChange: (page: number) => void;
}

export default function AppointmentListView({
  appointments,
  specialties,
  doctors,
  listFilterSpecialty,
  listFilterDoctor,
  listFilterPatientName,
  listShowCancelled,
  onSpecialtyChange,
  onDoctorChange,
  onPatientNameChange,
  onShowCancelledChange,
  onStatusChange,
  onTimeSlotClick,
  onLoadAppointments,
  currentPage,
  totalPages,
  total,
  startIndex,
  endIndex,
  onPageChange,
}: Readonly<AppointmentListViewProps>) {
  return (
    <div className="space-y-0 bg-white rounded-lg border border-gray-200 shadow-sm overflow-hidden">
      {/* Filtros para lista */}
      <div className="bg-gray-50 px-6 py-4 border-b border-gray-200">
        <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
          <SelectFilter
            id="filter-specialty"
            label="Especialidad"
            value={listFilterSpecialty}
            options={[
              { id: "", label: "Todas las especialidades" },
              ...specialties.map(s => ({ id: s.id, label: s.name }))
            ]}
            onChange={onSpecialtyChange}
          />

          <SelectFilter
            id="filter-doctor"
            label="Médico"
            value={listFilterDoctor}
            options={[
              { id: "", label: "Todos los médicos" },
              ...doctors
                .filter(d => !listFilterSpecialty || String(d.specialtyId || d.specialty?.id || d.specialty) === String(listFilterSpecialty))
                .map(d => ({ id: d.id, label: `Dr. ${d.firstName} ${d.lastName}` }))
            ]}
            onChange={onDoctorChange}
            disabled={false}
            className={''}
          />

          <div>
            <label
              htmlFor="filter-patient"
              className="block text-sm font-medium text-gray-700 mb-1"
            >
              Paciente
            </label>
            <input
              id="filter-patient"
              type="text"
              value={listFilterPatientName}
              onChange={(e) => onPatientNameChange(e.target.value)}
              onKeyDown={(e) => {
                if (e.key === 'Enter') {
                  onLoadAppointments();
                }
              }}
              placeholder="Buscar por nombre..."
              className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500 text-sm"
            />
          </div>
        </div>

        <div className="mt-4">
          <label className="flex items-center text-sm text-gray-700">
            <input
              type="checkbox"
              checked={listShowCancelled}
              onChange={(e) => onShowCancelledChange(e.target.checked)}
              className="mr-2 h-4 w-4 text-blue-600 border-gray-300 rounded focus:ring-blue-500"
            />
            Mostrar turnos cancelados
          </label>
        </div>
      </div>

      {appointments.length === 0 ? (
        <div className="text-center py-12">
          <div className="mx-auto h-24 w-24 text-gray-400">
            <svg fill="none" viewBox="0 0 24 24" stroke="currentColor">
              <path
                strokeLinecap="round"
                strokeLinejoin="round"
                strokeWidth={1}
                d="M8 7V3a2 2 0 012-2h4a2 2 0 012 2v4h3a2 2 0 012 2v12a2 2 0 01-2 2H3a2 2 0 01-2-2V9a2 2 0 012-2h5z"
              />
            </svg>
          </div>
          <h3 className="mt-4 text-lg font-medium text-gray-900">
            No hay turnos
          </h3>
          <p className="mt-2 text-gray-500">
            {listFilterSpecialty || listFilterDoctor || listFilterPatientName
              ? "No hay turnos que coincidan con los filtros seleccionados."
              : "No se han registrado turnos aún."}
          </p>
        </div>
      ) : (
        <>
          {/* Encabezado de la lista */}
          <div className="bg-blue-600 text-white px-6 py-4">
            <div className="flex items-center justify-between">
              <div className="flex items-center gap-4">
                <h2 className="text-xl font-semibold">
                  Turnos de hoy para recepcionar
                </h2>
              </div>
              <div className="text-blue-100 text-sm text-right">
                <div className="text-white font-medium">
                  {total} turnos
                </div>
                {totalPages > 1 && (
                  <div className="text-blue-200 text-xs mt-1">
                    Página {currentPage}/{totalPages}
                  </div>
                )}
              </div>
            </div>
          </div>

          {/* Lista de turnos */}
          <div className="divide-y divide-gray-200">
            {appointments.map((appointment, index) => (
              <AppointmentCard
                key={appointment.id}
                appointment={appointment}
                onStatusChange={onStatusChange}
                onTimeSlotClick={onTimeSlotClick}
                index={index}
              />
            ))}
          </div>

          {/* Controles de paginación */}
          {totalPages > 1 && (
            <div className="bg-white border-t border-gray-200 px-6 py-4">
              <div className="flex items-center justify-between">
                <div className="text-sm text-gray-700">
                  Mostrando{" "}
                  <span className="font-medium">{startIndex}</span> a{" "}
                  <span className="font-medium">{endIndex}</span> de{" "}
                  <span className="font-medium">{total}</span> turnos
                </div>

                <div className="flex items-center space-x-2">
                  <button
                    onClick={() => onPageChange(Math.max(currentPage - 1, 1))}
                    disabled={currentPage === 1}
                    className={`px-3 py-2 text-sm font-medium rounded-md transition-colors ${
                      currentPage === 1
                        ? "bg-gray-100 text-gray-400 cursor-not-allowed"
                        : "bg-white text-gray-700 border border-gray-300 hover:bg-gray-50 focus:ring-2 focus:ring-blue-500"
                    }`}
                  >
                    ← Anterior
                  </button>

                  <div className="flex space-x-1">
                    {Array.from({ length: totalPages }, (_, i) => i + 1)
                      .filter((page) => {
                        return (
                          Math.abs(page - currentPage) <= 2 ||
                          page === 1 ||
                          page === totalPages
                        );
                      })
                      .map((page, index, array) => {
                        const prevPage = array[index - 1];
                        const showEllipsis = prevPage && page - prevPage > 1;

                        return (
                          <React.Fragment key={page}>
                            {showEllipsis && (
                              <span className="px-3 py-2 text-sm text-gray-500">
                                ...
                              </span>
                            )}
                            <button
                              onClick={() => onPageChange(page)}
                              className={`px-3 py-2 text-sm font-medium rounded-md transition-colors ${
                                currentPage === page
                                  ? "bg-blue-600 text-white"
                                  : "bg-white text-gray-700 border border-gray-300 hover:bg-gray-50 focus:ring-2 focus:ring-blue-500"
                              }`}
                            >
                              {page}
                            </button>
                          </React.Fragment>
                        );
                      })}
                  </div>

                  <button
                    onClick={() => onPageChange(Math.min(currentPage + 1, totalPages))}
                    disabled={currentPage === totalPages}
                    className={`px-3 py-2 text-sm font-medium rounded-md transition-colors ${
                      currentPage === totalPages
                        ? "bg-gray-100 text-gray-400 cursor-not-allowed"
                        : "bg-white text-gray-700 border border-gray-300 hover:bg-gray-50 focus:ring-2 focus:ring-blue-500"
                    }`}
                  >
                    Siguiente →
                  </button>
                </div>
              </div>
            </div>
          )}

          <StatusLegend />
        </>
      )}
    </div>
  );
}
