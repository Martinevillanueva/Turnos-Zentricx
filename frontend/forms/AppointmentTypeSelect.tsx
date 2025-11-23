import React from 'react';

interface AppointmentTypeSelectProps {
  value: string;
  onChange: (value: string) => void;
  disabled?: boolean;
  className?: string;
}

const APPOINTMENT_TYPES = [
  { value: 'routine', label: '📋 Consulta Rutinaria', description: 'Control regular' },
  { value: 'follow-up', label: '🔄 Seguimiento', description: 'Post-tratamiento' },
  { value: 'emergency', label: '🚨 Urgencia', description: 'Atención inmediata' },
  { value: 'checkup', label: '✅ Revisión Preventiva', description: 'Examen preventivo' },
  { value: 'consultation', label: '💬 Consulta', description: 'Primera visita' },
];

export default function AppointmentTypeSelect({
  value,
  onChange,
  disabled = false,
  className = '',
}: AppointmentTypeSelectProps) {
  const selectedType = APPOINTMENT_TYPES.find(t => t.value === value);

  return (
    <div className={className}>
      <label htmlFor="appointmentType" className="block text-sm font-medium text-gray-700 mb-1">
        Tipo de Cita FHIR
      </label>
      <select
        id="appointmentType"
        value={value}
        onChange={(e) => onChange(e.target.value)}
        disabled={disabled}
        className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-primary-500"
      >
        {APPOINTMENT_TYPES.map((type) => (
          <option key={type.value} value={type.value}>
            {type.label}
          </option>
        ))}
      </select>
      {selectedType && (
        <p className="mt-1 text-xs text-gray-500">
          {selectedType.description}
        </p>
      )}
    </div>
  );
}
