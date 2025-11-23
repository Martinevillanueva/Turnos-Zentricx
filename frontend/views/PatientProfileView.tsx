'use client';

import React, { useState, useEffect } from 'react';
import AppointmentCard from '@/components/AppointmentCard';
import { SimpleAppointment } from '@/types/fhir';
import { useAppointmentFilters } from '@/hooks/useAppointmentFilters';
import { usePagination } from '@/hooks/usePagination';

interface PatientProfileViewProps {
  readonly patient: any;
  readonly onBack: () => void;
  readonly onEditPatient?: (patient: any, onUpdated?: (updatedPatient: any) => void) => void;
}

export default function PatientProfileView({
  patient,
  onBack,
  onEditPatient
}: PatientProfileViewProps) {
  const [localPatient, setLocalPatient] = useState<any>(patient);
  const [appointments, setAppointments] = useState<SimpleAppointment[]>([]);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  // Usar hooks para filtros y paginación
  const {
    filterSpecialty,
    filterDoctor,
    setFilterSpecialty,
    setFilterDoctor,
    filteredAppointments,
    filterOptions
  } = useAppointmentFilters({ appointments });

  // Efecto para resetear el doctor cuando cambia la especialidad
  useEffect(() => {
    if (filterSpecialty && filterDoctor) {
      // Verificar si el doctor actual pertenece a la especialidad seleccionada
      const doctorBelongsToSpecialty = filterOptions.doctors.some(
        doctor => doctor.id === filterDoctor
      );
      
      // Si el doctor no pertenece a la especialidad, resetearlo
      if (!doctorBelongsToSpecialty) {
        setFilterDoctor('');
      }
    }
  }, [filterSpecialty, filterOptions.doctors, filterDoctor, setFilterDoctor]);

  const {
    currentPage,
    totalPages,
    paginatedItems,
    goToPage,
    goToNextPage,
    goToPreviousPage,
    getVisiblePages
  } = usePagination({
    totalItems: filteredAppointments.length,
    itemsPerPage: 10,
    initialPage: 1
  });

  useEffect(() => {
    if (patient) {
      setLocalPatient(patient);
      loadPatientAppointments();
    }
  }, [patient]);

  const loadPatientAppointments = async () => {
    try {
      setLoading(true);
      setError(null);

      const { apiUrl } = await import('@/api/config');
      const response = await fetch(apiUrl(`/api/appointments?patientId=${patient.id}&sortBy=date&sortOrder=desc`));

      if (!response.ok) {
        throw new Error('Error al cargar los turnos del paciente');
      }

      const data = await response.json();
      const appointmentsList = Array.isArray(data) ? data : (data.data || []);

      setAppointments(appointmentsList);

    } catch (err) {
      console.error('Error loading patient appointments:', err);
      setError(err instanceof Error ? err.message : 'Error al cargar los turnos');
    } finally {
      setLoading(false);
    }
  };

  const handleStatusChange = async (appointmentId: string, newStatus: string) => {
    try {
      const { apiUrl, apiHeaders } = await import('@/api/config');
      const response = await fetch(apiUrl(`/api/appointments/${appointmentId}/status`), {
        method: 'PATCH',
        headers: apiHeaders,
        body: JSON.stringify({ status: newStatus }),
      });

      if (!response.ok) {
        throw new Error('Error al actualizar el estado del turno');
      }

      await loadPatientAppointments();
    } catch (err) {
      console.error('Error updating appointment status:', err);
      setError(err instanceof Error ? err.message : 'Error al actualizar el turno');
    }
  };

  // Avatar basado en género
  const getAvatarIcon = () => {
    const isMale = patient?.gender === 'M' || patient?.gender === 'male' || patient?.gender === 'Masculino';
    const isFemale = patient?.gender === 'F' || patient?.gender === 'female' || patient?.gender === 'Femenino';
    
    if (isMale) {
      return (
        <svg className="w-16 h-16 text-blue-500" fill="currentColor" viewBox="0 0 20 20">
          <path fillRule="evenodd" d="M10 9a3 3 0 100-6 3 3 0 000 6zm-7 9a7 7 0 1114 0H3z" clipRule="evenodd" />
        </svg>
      );
    } else if (isFemale) {
      return (
        <svg className="w-16 h-16 text-pink-500" fill="currentColor" viewBox="0 0 20 20">
          <path fillRule="evenodd" d="M10 9a3 3 0 100-6 3 3 0 000 6zm-7 9a7 7 0 1114 0H3z" clipRule="evenodd" />
        </svg>
      );
    } else {
      return (
        <svg className="w-16 h-16 text-gray-500" fill="currentColor" viewBox="0 0 20 20">
          <path fillRule="evenodd" d="M10 9a3 3 0 100-6 3 3 0 000 6zm-7 9a7 7 0 1114 0H3z" clipRule="evenodd" />
        </svg>
      );
    }
  };

  // Calcular paginación usando el hook
  const paginatedAppointments = filteredAppointments.slice(paginatedItems.startIndex, paginatedItems.endIndex);

  return (

    <div className="space-y-6">
      {/* Encabezado azul igual a gestión de pacientes */}
      <div className="bg-blue-600 text-white px-6 py-4 rounded-t-lg">
        <div className="flex items-center justify-between">
          <div className="flex items-center gap-4">
            <h2 className="text-xl font-semibold">Perfil del Paciente</h2>
          </div>
          <div>
            <button
              onClick={onBack}
              className="flex items-center text-blue-100 text-white hover:text-gray-300 transition-colors"
            >
              <svg className="w-4 h-4 mr-2" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M8 19l-7-7m0 0l7-7m-7 7h18" />
              </svg>
              Volver a Pacientes
            </button>
          </div>
        </div>
      </div>

      {/* Patient Info Card */}
      <div className="bg-white rounded-b-lg shadow-sm p-6">
        <div className="flex items-start space-x-2">
          {/* Avatar */}
          <div className="flex-shrink-0">
            <div className="w-24 h-24 bg-gray-100 rounded-full flex items-center justify-center">
              {getAvatarIcon()}
            </div>
          </div>
          {/* Patient Details */}
          <div className="flex-1 min-w-0">
            <p className="mt-2 grid"></p>
            <div className="flex items-center justify-between mb-4px-6 py-2 p-1">
              <h3 className="mt-4 grid text-2xl font-bold text-gray-900">
                {localPatient?.firstName} {localPatient?.lastName}
              </h3>
              <button
                onClick={() => {
                  if (onEditPatient) {
                    onEditPatient(localPatient, (updatedPatient) => {
                      setLocalPatient(updatedPatient);
                    });
                  }
                }}
                className="px-6 py-2 bg-blue-600 text-white rounded-md hover:bg-blue-700 transition-colors flex items-center gap-1.5 shadow text-sm font-medium"
              >
                <svg className="w-3.5 h-3.5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M11 5H6a2 2 0 00-2 2v11a2 2 0 002 2h11a2 2 0 002-2v-5m-1.414-9.414a2 2 0 112.828 2.828L11.828 15H9v-2.828l8.586-8.586z" />
                </svg>
                Editar
              </button>
            </div>
            <p className="mt-4 grid"></p>
            <div className="mt-4 grid grid-cols-1 md:grid-cols-3 lg:grid-cols-3 gap-4">
              <div>
                <dt className="text-sm font-medium text-gray-500">Documento</dt>
                <dd className="mt-1 text-sm text-gray-900">{localPatient?.documentNumber || '-'}</dd>
              </div>
              <div>
                <dt className="text-sm font-medium text-gray-500">Teléfono</dt>
                <dd className="mt-1 text-sm text-gray-900">{localPatient?.phone || '-'}</dd>
              </div>
              <div>
                <dt className="text-sm font-medium text-gray-500">Email</dt>
                <dd className="mt-1 text-sm text-gray-900">{localPatient?.email || '-'}</dd>
              </div>
              <div>
                <dt className="text-sm font-medium text-gray-500">Fecha de Nacimiento</dt>
                <dd className="mt-1 text-sm text-gray-900">
                  {localPatient?.birthDate ? new Date(localPatient.birthDate).toLocaleDateString('es-ES') : '-'}
                </dd>
              </div>
              <div>
                <dt className="text-sm font-medium text-gray-500">Género</dt>
                <dd className="mt-1 text-sm text-gray-900">
                  {(() => {
                    if (localPatient?.gender === 'M') return 'Masculino';
                    if (localPatient?.gender === 'F') return 'Femenino';
                    return localPatient?.gender || '-';
                  })()}
                </dd>
              </div>
              <div>
                <dt className="text-sm font-medium text-gray-500">Edad</dt>
                <dd className="mt-1 text-sm text-gray-900">{localPatient?.age || '-'} años</dd>
              </div>
            </div>
          </div>
        </div>
      </div>
      {/* Turnos Section */}
      <div className="bg-white rounded-lg shadow-sm">
        {/* Encabezado azul con total de turnos */}
        <div className="bg-blue-600 text-white px-6 py-4 rounded-t-lg flex items-center justify-between">
          <h3 className="text-lg font-semibold">Historial de Turnos</h3>
          <span className="text-base font-normal opacity-90">Total: {appointments.length} turnos</span>
        </div>
        {/* Filtros dentro del box blanco */}
        <div className="px-6 py-4 border-b border-gray-200">
          <div className="flex items-center justify-between mb-4">
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4 flex-1">
            {/* Filtro por especialidad */}
            <div>
              <label htmlFor="filter-specialty" className="block text-sm font-medium text-gray-700 mb-1">
                Especialidad
              </label>
              <select
                id="filter-specialty"
                value={filterSpecialty}
                onChange={(e) => setFilterSpecialty(e.target.value)}
                className="w-full border border-gray-300 rounded-md px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-blue-500"
              >
                <option value="">Todas</option>
                {filterOptions.specialties.map((specialty) => (
                  <option key={specialty.id} value={specialty.id}>
                    {specialty.name}
                  </option>
                ))}
              </select>
            </div>

            {/* Filtro por doctor */}
            <div>
              <label htmlFor="filter-doctor" className="block text-sm font-medium text-gray-700 mb-1">
                Doctor
              </label>
              <select
                id="filter-doctor"
                value={filterDoctor}
                onChange={(e) => setFilterDoctor(e.target.value)}
                className="w-full border border-gray-300 rounded-md px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-blue-500"
              >
                <option value="">Todos</option>
                {filterOptions.doctors.map((doctor) => (
                  <option key={doctor.id} value={doctor.id}>
                    {doctor.name}
                  </option>
                ))}
              </select>
            </div>            
            </div>
          </div>
        </div>

        {/* Lista de turnos */}
        <div className="p-6">
          {(() => {
            if (loading) {
              return (
                <div className="flex justify-center items-center py-12">
                  <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-blue-600"></div>
                  <span className="ml-3 text-gray-600">Cargando turnos...</span>
                </div>
              );
            }

            if (error) {
              return (
                <div className="bg-red-50 border border-red-200 rounded-md p-4">
                  <p className="text-red-700">{error}</p>
                </div>
              );
            }

            if (filteredAppointments.length === 0) {
              return (
                <div className="text-center py-12">
                  <div className="w-24 h-24 mx-auto bg-gray-100 rounded-full flex items-center justify-center mb-4">
                    <svg className="w-12 h-12 text-gray-400" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1} d="M8 7V3m8 4V3m-9 8h10M5 21h14a2 2 0 002-2V7a2 2 0 00-2-2H5a2 2 0 00-2 2v12a2 2 0 002 2z" />
                    </svg>
                  </div>
                  <h4 className="text-lg font-medium text-gray-900 mb-2">
                    {appointments.length === 0 ? 'Sin turnos registrados' : 'No hay turnos que coincidan'}
                  </h4>
                  <p className="text-gray-500">
                    {appointments.length === 0
                      ? 'Este paciente no tiene turnos registrados en el sistema.'
                      : 'Prueba ajustando los filtros para ver más resultados.'
                    }
                  </p>
                </div>
              );
            }

            return (
              <>
                {/* Resumen */}
                <div className="flex justify-between items-center mb-6">
                  <p className="text-sm text-gray-600">
                    Mostrando {paginatedItems.startIndex + 1}-{Math.min(paginatedItems.endIndex, filteredAppointments.length)} de {filteredAppointments.length} turnos
                  </p>
                </div>

                {/* Lista de turnos */}
                <div className="space-y-4">
                  {paginatedAppointments.map((appointment, index) => (
                    <AppointmentCard
                      key={appointment.id}
                      appointment={appointment}
                      onStatusChange={handleStatusChange}
                      index={index}
                      showPatientInfo={false}
                    />
                  ))}
                </div>

                {/* Paginación */}
                {totalPages > 1 && (
                  <div className="flex justify-center items-center space-x-2 mt-8">
                    <button
                      onClick={goToPreviousPage}
                      disabled={currentPage === 1}
                      className="px-3 py-1 text-sm border border-gray-300 rounded-md hover:bg-gray-50 disabled:opacity-50 disabled:cursor-not-allowed"
                    >
                      Anterior
                    </button>
                    <div className="flex space-x-1">
                      {getVisiblePages().map((page, index) => {
                        if (page === '...') {
                          return (
                            <span key={`ellipsis-${currentPage}-${index}`} className="px-2 text-gray-400">
                              ...
                            </span>
                          );
                        }
                        const pageNum = page as number;
                        return (
                          <button
                            key={pageNum}
                            onClick={() => goToPage(pageNum)}
                            className={`px-3 py-1 text-sm border rounded-md ${
                              currentPage === pageNum
                                ? 'bg-blue-600 text-white border-blue-600'
                                : 'border-gray-300 hover:bg-gray-50'
                            }`}
                          >
                            {pageNum}
                          </button>
                        );
                      })}
                    </div>
                    <button
                      onClick={goToNextPage}
                      disabled={currentPage === totalPages}
                      className="px-3 py-1 text-sm border border-gray-300 rounded-md hover:bg-gray-50 disabled:opacity-50 disabled:cursor-not-allowed"
                    >
                      Siguiente
                    </button>
                  </div>
                )}
              </>
            );
          })()}
        </div>
      </div>
    </div>
  );
}