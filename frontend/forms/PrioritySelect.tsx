import React from 'react';

interface PrioritySelectProps {
  value: number;
  onChange: (value: number) => void;
  disabled?: boolean;
  className?: string;
}

const PRIORITY_OPTIONS = [
  { value: 0, label: '⚪ P0 - Informativo', color: 'text-gray-500' },
  { value: 1, label: '⚪ P1 - Muy Baja', color: 'text-gray-400' },
  { value: 2, label: '⚪ P2 - Baja', color: 'text-gray-500' },
  { value: 3, label: '🟢 P3 - Baja-Media', color: 'text-green-600' },
  { value: 4, label: '🟢 P4 - Media-Baja', color: 'text-green-600' },
  { value: 5, label: '🟡 P5 - Normal', color: 'text-yellow-600' },
  { value: 6, label: '🟠 P6 - Media-Alta', color: 'text-orange-600' },
  { value: 7, label: '🟠 P7 - Alta', color: 'text-orange-600' },
  { value: 8, label: '🔴 P8 - Muy Alta', color: 'text-red-600' },
  { value: 9, label: '🔴 P9 - Urgente', color: 'text-red-700 font-bold' },
];

export default function PrioritySelect({
  value,
  onChange,
  disabled = false,
  className = '',
}: PrioritySelectProps) {
  const selectedOption = PRIORITY_OPTIONS.find(opt => opt.value === value);

  return (
    <div className={className}>
      <label htmlFor="priority" className="block text-sm font-medium text-gray-700 mb-1">
        Prioridad FHIR
      </label>
      <select
        id="priority"
        value={value}
        onChange={(e) => onChange(Number(e.target.value))}
        disabled={disabled}
        className={`w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-primary-500 ${
          selectedOption?.color || ''
        }`}
      >
        {PRIORITY_OPTIONS.map((option) => (
          <option key={option.value} value={option.value}>
            {option.label}
          </option>
        ))}
      </select>
      <p className="mt-1 text-xs text-gray-500">
        Escala 0-9: P5 = Normal, P6-P8 = Alta, P9 = Urgente
      </p>
    </div>
  );
}
