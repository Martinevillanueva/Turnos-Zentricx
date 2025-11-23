import React from 'react';

interface Specialty {
  id: string;
  name: string;
}

interface Doctor {
  id: string;
  name: string;
}

interface AppointmentFiltersProps {
  filterSpecialty: string;
  filterDoctor: string;
  filterStatus?: string;
  showCancelled?: boolean;
  specialties: Specialty[];
  doctors: Doctor[];
  onSpecialtyChange: (value: string) => void;
  onDoctorChange: (value: string) => void;
  onStatusChange?: (value: string) => void;
  onShowCancelledChange?: (value: boolean) => void;
  onClearFilters?: () => void;
  className?: string;
}

export default function AppointmentFilters({
  filterSpecialty,
  filterDoctor,
  filterStatus = '',
  showCancelled = true,
  specialties,
  doctors,
  onSpecialtyChange,
  onDoctorChange,
  onStatusChange,
  onShowCancelledChange,
  onClearFilters,
  className = ''
}: AppointmentFiltersProps) {
  return (
    <div className={`px-6 py-4 border-b border-gray-200 ${className}`}>
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
        {/* Filtro por especialidad */}
        <div>
          <label htmlFor="filter-specialty" className="block text-sm font-medium text-gray-700 mb-1">
            Especialidad
          </label>
          <select
            id="filter-specialty"
            value={filterSpecialty}
            onChange={(e) => onSpecialtyChange(e.target.value)}
            className="w-full border border-gray-300 rounded-md px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-blue-500"
          >
            <option value="">Todas</option>
            {specialties.map((specialty) => (
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
            onChange={(e) => onDoctorChange(e.target.value)}
            className="w-full border border-gray-300 rounded-md px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-blue-500"
          >
            <option value="">Todos</option>
            {doctors.map((doctor) => (
              <option key={doctor.id} value={doctor.id}>
                {doctor.name}
              </option>
            ))}
          </select>
        </div>

        {/* Filtro por estado (opcional) */}
        {onStatusChange && (
          <div>
            <label htmlFor="filter-status" className="block text-sm font-medium text-gray-700 mb-1">
              Estado
            </label>
            <select
              id="filter-status"
              value={filterStatus}
              onChange={(e) => onStatusChange(e.target.value)}
              className="w-full border border-gray-300 rounded-md px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-blue-500"
            >
              <option value="">Todos</option>
              <option value="pending">Pendiente</option>
              <option value="confirmed">Confirmado</option>
              <option value="fulfilled">Completado</option>
              <option value="cancelled">Cancelado</option>
            </select>
          </div>
        )}

        {/* Checkbox para mostrar cancelados (opcional) */}
        {onShowCancelledChange && (
          <div className="flex items-end">
            <label className="flex items-center">
              <input
                type="checkbox"
                checked={showCancelled}
                onChange={(e) => onShowCancelledChange(e.target.checked)}
                className="rounded border-gray-300 text-blue-600 focus:ring-blue-500"
              />
              <span className="ml-2 text-sm text-gray-700">Mostrar cancelados</span>
            </label>
          </div>
        )}
      </div>
    </div>
  );
}