import React from 'react';

interface ServiceTypeInputProps {
  value: string;
  onChange: (value: string) => void;
  serviceCategory?: string;
  disabled?: boolean;
  className?: string;
}

// Tipos de servicio por categoría
const SERVICE_TYPES_BY_CATEGORY: Record<string, string[]> = {
  'Cardiología': [
    'Consulta cardiológica',
    'Ecocardiograma',
    'Holter de presión',
    'Ergometría',
    'Electrocardiograma',
  ],
  'Pediatría': [
    'Control de niño sano',
    'Vacunación',
    'Consulta pediátrica',
    'Control de desarrollo',
  ],
  'Traumatología': [
    'Consulta traumatológica',
    'Control post-quirúrgico',
    'Infiltración',
    'Estudio de marcha',
  ],
  'Medicina General': [
    'Consulta clínica',
    'Control de crónicos',
    'Certificado médico',
    'Receta',
  ],
  'default': [
    'Consulta',
    'Control',
    'Procedimiento',
    'Estudio',
  ],
};

export default function ServiceTypeInput({
  value,
  onChange,
  serviceCategory,
  disabled = false,
  className = '',
}: ServiceTypeInputProps) {
  const availableTypes = serviceCategory 
    ? (SERVICE_TYPES_BY_CATEGORY[serviceCategory] || SERVICE_TYPES_BY_CATEGORY['default'])
    : SERVICE_TYPES_BY_CATEGORY['default'];

  return (
    <div className={className}>
      <label htmlFor="serviceType" className="block text-sm font-medium text-gray-700 mb-1">
        Tipo de Servicio Específico
      </label>
      <input
        type="text"
        id="serviceType"
        value={value}
        onChange={(e) => onChange(e.target.value)}
        disabled={disabled}
        list="serviceTypeOptions"
        placeholder="Ej: Ecocardiograma, Consulta..."
        className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-primary-500"
      />
      <datalist id="serviceTypeOptions">
        {availableTypes.map((type) => (
          <option key={type} value={type} />
        ))}
      </datalist>
      <p className="mt-1 text-xs text-gray-500">
        {serviceCategory 
          ? `Servicios sugeridos para ${serviceCategory}`
          : 'Especifique el tipo de servicio a realizar'
        }
      </p>
    </div>
  );
}
