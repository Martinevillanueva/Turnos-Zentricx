import React from 'react';

interface FhirFiltersProps {
  readonly appointmentType: string;
  readonly priority: string;
  readonly onAppointmentTypeChange: (value: string) => void;
  readonly onPriorityChange: (value: string) => void;
}

const APPOINTMENT_TYPE_OPTIONS = [
  { value: '', label: 'Todos los tipos' },
  { value: 'routine', label: '📋 Consulta Rutinaria' },
  { value: 'follow-up', label: '🔄 Seguimiento' },
  { value: 'emergency', label: '🚨 Urgencia' },
  { value: 'checkup', label: '✅ Revisión Preventiva' },
  { value: 'consultation', label: '💬 Consulta' },
];

const PRIORITY_OPTIONS = [
  { value: '', label: 'Todas las prioridades' },
  { value: '9', label: '🔴 P9 - Urgente' },
  { value: '8', label: '🔴 P8 - Muy Alta' },
  { value: '7', label: '🟠 P7 - Alta' },
  { value: '6', label: '🟠 P6 - Media-Alta' },
  { value: '5', label: '🟡 P5 - Normal' },
  { value: '4', label: '🟢 P4 - Media-Baja' },
  { value: '0-3', label: '⚪ P0-P3 - Baja' },
];

export default function FhirFilters({
  appointmentType,
  priority,
  onAppointmentTypeChange,
  onPriorityChange,
}: FhirFiltersProps) {
  return (
    <div className="p-1">
      <div className="grid grid-cols-1 md:grid-cols-2 gap-3">
        {/* Filtro por Tipo de Cita */}
        <div>
          <label htmlFor="fhir-appointment-type" className="block text-xs font-medium text-gray-700 mb-1">
            Tipo de Cita
          </label>
          <select
            id="fhir-appointment-type"
            value={appointmentType}
            onChange={(e) => onAppointmentTypeChange(e.target.value)}
            className="w-full px-2 py-1.5 text-sm border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-gray-500"
          >
            {APPOINTMENT_TYPE_OPTIONS.map((option) => (
              <option key={option.value} value={option.value}>
                {option.label}
              </option>
            ))}
          </select>
        </div>

        {/* Filtro por Prioridad */}
        <div>
          <label htmlFor="fhir-priority" className="block text-xs font-medium text-gray-700 mb-1">
            Prioridad
          </label>
          <select
            id="fhir-priority"
            value={priority}
            onChange={(e) => onPriorityChange(e.target.value)}
            className="w-full px-2 py-1.5 text-sm border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-gray-500"
          >
            {PRIORITY_OPTIONS.map((option) => (
              <option key={option.value} value={option.value}>
                {option.label}
              </option>
            ))}
          </select>
        </div>
      </div>
    </div>
  );
}