import React, { useState } from 'react';
import { SelectFilter } from '@/filters';
import AppointmentCard from './AppointmentCard';
import StatusLegend from './StatusLegend';
import MultiSelectStatus from '@/forms/MultiSelectStatus';
import FhirFilters from '@/filters/components/FhirFilters';
import { SimpleAppointment, AppointmentStatus } from '@/types/fhir';

interface AppointmentListSectionProps {
  // Filters
  listFilterSpecialty: string;
  setListFilterSpecialty: (value: string) => void;
  listFilterDoctor: string;
  setListFilterDoctor: (value: string) => void;
  listFilterPatientName: string;
  setListFilterPatientName: (value: string) => void;
  listFilterStatus: AppointmentStatus[];
  setListFilterStatus: (value: AppointmentStatus[]) => void;
  
  // FHIR Filters
  fhirAppointmentType: string;
  setFhirAppointmentType: (value: string) => void;
  fhirPriority: string;
  setFhirPriority: (value: string) => void;
  
  // Data
  specialties: { id: string; name: string }[];
  doctors: { id: string; firstName: string; lastName: string; specialtyId?: string; specialty?: any }[];
  filteredAndSortedAppointments: SimpleAppointment[];
  currentAppointments: SimpleAppointment[];
  
  // Callbacks
  loadAppointments: () => void;
  handleStatusChange: (id: string, status: AppointmentStatus) => void;
  handleTimeSlotClick: (date: string, time: string, context?: any) => void;
  
  // Pagination
  useBackendPagination: boolean;
  paginationInfo: {
    total: number;
    totalPages: number;
    page: number;
    limit: number;
  };
  currentPage: number;
  setCurrentPage: React.Dispatch<React.SetStateAction<number>>;
  totalPages: number;
  startIndex: number;
  endIndex: number;
  total: number;
}

const AppointmentListSection: React.FC<AppointmentListSectionProps> = ({
  listFilterSpecialty,
  setListFilterSpecialty,
  listFilterDoctor,
  setListFilterDoctor,
  listFilterPatientName,
  setListFilterPatientName,
  listFilterStatus,
  setListFilterStatus,
  fhirAppointmentType,
  setFhirAppointmentType,
  fhirPriority,
  setFhirPriority,
  specialties,
  doctors,
  filteredAndSortedAppointments,
  currentAppointments,
  loadAppointments,
  handleStatusChange,
  handleTimeSlotClick,
  useBackendPagination,
  paginationInfo,
  currentPage,
  setCurrentPage,
  totalPages,
  startIndex,
  endIndex,
  total,
}) => {
  const [showFhirFilters, setShowFhirFilters] = useState(true); // Abierto por defecto

  return (
    <div className="space-y-0 bg-white rounded-lg border border-gray-200 shadow-sm overflow-hidden">
      {/* Filtros para lista */}
      <div className="bg-gray-50 px-6 py-4 border-b border-gray-200">
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
          <SelectFilter
            id="filter-specialty"
            label="Especialidad"
            value={listFilterSpecialty}
            options={[
              { id: "", label: "Todas las especialidades" },
              ...specialties.map(s => ({ id: s.id, label: s.name }))
            ]}
            onChange={setListFilterSpecialty}
          />

          {/* Filtro por médico - solo visible cuando hay especialidad seleccionada */}
          {listFilterSpecialty && (
            <SelectFilter
              id="filter-doctor"
              label="Médico"
              value={listFilterDoctor}
              options={[
                { id: "", label: "Todos los médicos" },
                ...doctors
                  .filter(d => String(d.specialtyId || d.specialty?.id || d.specialty) === String(listFilterSpecialty))
                  .map(d => ({ id: d.id, label: `Dr. ${d.firstName} ${d.lastName}` }))
              ]}
              onChange={setListFilterDoctor}
            />
          )}

          {/* Filtro por nombre de paciente */}
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
              onChange={(e) => setListFilterPatientName(e.target.value)}
              onKeyDown={(e) => {
                if (e.key === 'Enter') {
                  loadAppointments();
                }
              }}
              placeholder="Buscar por nombre..."
              className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500 text-sm"
            />
          </div>

          {/* Filtro por estados */}
          <MultiSelectStatus
            label="Estados"
            value={listFilterStatus}
            onChange={setListFilterStatus}
            placeholder="Todos los estados"
          />
        </div>

        {/* Botón para mostrar/ocultar filtros FHIR */}
        <div className="mt-3 flex justify-between items-center">
          <button
            onClick={() => setShowFhirFilters(!showFhirFilters)}
            className="px-3 py-1.5 text-sm bg-purple-100 text-purple-700 hover:bg-purple-200 rounded-md transition-colors flex items-center gap-2"
          >
            <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 6V4m0 2a2 2 0 100 4m0-4a2 2 0 110 4m-6 8a2 2 0 100-4m0 4a2 2 0 110-4m0 4v2m0-6V4m6 6v10m6-2a2 2 0 100-4m0 4a2 2 0 110-4m0 4v2m0-6V4" />
            </svg>
            {showFhirFilters ? 'Ocultar' : 'Mostrar'} Filtros FHIR
          </button>
          
          {(listFilterSpecialty ||
            listFilterDoctor ||
            listFilterPatientName ||
            listFilterStatus.length > 0 ||
            fhirAppointmentType ||
            fhirPriority) && (
            <button
              onClick={() => {
                setListFilterSpecialty("");
                setListFilterDoctor("");
                setListFilterPatientName("");
                setListFilterStatus([]);
                setFhirAppointmentType('');
                setFhirPriority('');
              }}
              className="px-3 py-1 text-sm text-gray-600 hover:text-gray-800 transition-colors"
            >
              Limpiar todos los filtros
            </button>
          )}
        </div>
        
        {/* Filtros FHIR expandibles */}
        {showFhirFilters && (
          <div className="mt-3">
            <FhirFilters
              appointmentType={fhirAppointmentType}
              priority={fhirPriority}
              onAppointmentTypeChange={setFhirAppointmentType}
              onPriorityChange={setFhirPriority}
            />
          </div>
        )}
      </div>

      {filteredAndSortedAppointments.length === 0 ? (
        // Mensaje cuando no hay turnos
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
        // Lista de turnos cuando hay resultados
        <>
          {/* Encabezado de la lista */}
          <div className="bg-blue-600 text-white px-6 py-4">
            <div className="flex items-center justify-between">
              <div className="flex items-center gap-4">
                <h2 className="text-xl font-semibold">
                  Próximos turnos de hoy
                </h2>
              </div>
              <div className="text-blue-100 text-sm text-right">
                <div className="text-white font-medium">
                  {useBackendPagination
                    ? paginationInfo.total
                    : filteredAndSortedAppointments.length}{" "}
                  turnos
                </div>
                {totalPages > 1 && (
                  <div className="text-blue-200 text-xs mt-1">
                    Página{" "}
                    {useBackendPagination
                      ? paginationInfo.page
                      : currentPage}
                    /{totalPages}
                  </div>
                )}
              </div>
            </div>
          </div>

          {/* Lista de turnos */}
          <div className="divide-y divide-gray-200">
            {currentAppointments.map((appointment, index) => (
              <AppointmentCard
                key={appointment.id}
                appointment={appointment}
                onStatusChange={handleStatusChange}
                onTimeSlotClick={handleTimeSlotClick}
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
                  <span className="font-medium">
                    {useBackendPagination
                      ? paginationInfo.total
                      : total}
                  </span>{" "}
                  turnos
                </div>

                <div className="flex items-center space-x-2">
                  {/* Botón Anterior */}
                  <button
                    onClick={() =>
                      setCurrentPage((prev) => Math.max(prev - 1, 1))
                    }
                    disabled={currentPage === 1}
                    className={`px-3 py-2 text-sm font-medium rounded-md transition-colors ${
                      currentPage === 1
                        ? "bg-gray-100 text-gray-400 cursor-not-allowed"
                        : "bg-white text-gray-700 border border-gray-300 hover:bg-gray-50 focus:ring-2 focus:ring-blue-500"
                    }`}
                  >
                    ← Anterior
                  </button>

                  {/* Números de página */}
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
                        const showEllipsis =
                          prevPage && page - prevPage > 1;

                        return (
                          <React.Fragment key={page}>
                            {showEllipsis && (
                              <span className="px-3 py-2 text-sm text-gray-500">
                                ...
                              </span>
                            )}
                            <button
                              onClick={() => setCurrentPage(page)}
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

                  {/* Botón Siguiente */}
                  <button
                    onClick={() =>
                      setCurrentPage((prev) =>
                        Math.min(prev + 1, totalPages)
                      )
                    }
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

          {/* Leyenda de colores para vista de lista */}
          <StatusLegend />
        </>
      )}
    </div>
  );
};

export default AppointmentListSection;
