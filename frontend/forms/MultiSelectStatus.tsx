import React, { useState, useRef, useEffect } from 'react';
import { AppointmentStatus } from '@/types/fhir';

interface StatusOption {
  value: AppointmentStatus;
  label: string;
  color: string;
}

const STATUS_OPTIONS: StatusOption[] = [
  { value: 'pending', label: 'Pendiente', color: 'bg-yellow-100 text-yellow-800 border-yellow-300' },
  { value: 'in-consultation', label: 'En consulta', color: 'bg-orange-100 text-orange-800 border-orange-300' },
  { value: 'booked', label: 'Confirmado', color: 'bg-blue-100 text-blue-800 border-blue-300' },
  { value: 'arrived', label: 'Recepcionado', color: 'bg-purple-100 text-purple-800 border-purple-300' },
  { value: 'fulfilled', label: 'Completado', color: 'bg-green-100 text-green-800 border-green-300' },
  { value: 'cancelled', label: 'Cancelado', color: 'bg-red-100 text-red-800 border-red-300' },
];

interface MultiSelectStatusProps {
  id?: string;
  label?: string;
  value: AppointmentStatus[];
  onChange: (selected: AppointmentStatus[]) => void;
  placeholder?: string;
  className?: string;
}

export default function MultiSelectStatus({
  id = 'multi-select-status',
  label = 'Estados',
  value,
  onChange,
  placeholder = 'Seleccionar estados...',
  className = ''
}: MultiSelectStatusProps) {
  const [isOpen, setIsOpen] = useState(false);
  const dropdownRef = useRef<HTMLDivElement>(null);

  // Cerrar dropdown al hacer clic fuera
  useEffect(() => {
    const handleClickOutside = (event: MouseEvent) => {
      if (dropdownRef.current && !dropdownRef.current.contains(event.target as Node)) {
        setIsOpen(false);
      }
    };

    document.addEventListener('mousedown', handleClickOutside);
    return () => document.removeEventListener('mousedown', handleClickOutside);
  }, []);

  const handleToggle = (statusValue: AppointmentStatus) => {
    if (value.includes(statusValue)) {
      onChange(value.filter(v => v !== statusValue));
    } else {
      onChange([...value, statusValue]);
    }
  };

  const handleSelectAll = () => {
    if (value.length === STATUS_OPTIONS.length) {
      onChange([]);
    } else {
      onChange(STATUS_OPTIONS.map(opt => opt.value));
    }
  };

  const handleClear = () => {
    onChange([]);
  };

  const getSelectedLabels = () => {
    if (value.length === 0) return placeholder;
    if (value.length === STATUS_OPTIONS.length) return 'Todos los estados';
    if (value.length === 1) {
      const selected = STATUS_OPTIONS.find(opt => opt.value === value[0]);
      return selected?.label || '';
    }
    return `${value.length} estados seleccionados`;
  };

  return (
    <div className={`relative ${className}`} ref={dropdownRef}>
      {label && (
        <label
          htmlFor={id}
          className="block text-sm font-medium text-gray-700 mb-1"
        >
          {label}
        </label>
      )}

      {/* Botón principal del select */}
      <button
        id={id}
        type="button"
        onClick={() => setIsOpen(!isOpen)}
        className="w-full h-[42px] px-3 py-2 text-left bg-white border border-gray-300 rounded-md text-sm focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-blue-500 flex items-center justify-between hover:bg-gray-50 transition-colors"
      >
        <span className={`text-sm truncate ${value.length === 0 ? 'text-gray-400' : 'text-gray-900'}`}>
          {getSelectedLabels()}
        </span>
        <svg
          width="16"
          height="16"
          className={`text-gray-400 transition-transform flex-shrink-0 ${isOpen ? 'transform rotate-180' : ''}`}
          fill="none"
          viewBox="0 0 24 24"
          stroke="currentColor"
          style={{ minWidth: 16, minHeight: 16 }}
        >
          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 9l-7 7-7-7" />
        </svg>
      </button>

      {/* Dropdown con opciones */}
      {isOpen && (
        <div className="absolute z-50 mt-1 w-full bg-white border border-gray-300 rounded-md shadow-lg max-h-80 overflow-y-auto">
          {/* Controles superiores */}
          <div className="sticky top-0 bg-gray-50 border-b border-gray-200 px-3 py-2 flex items-center justify-between">
            <button
              type="button"
              onClick={handleSelectAll}
              className="text-xs font-medium text-blue-600 hover:text-blue-800 transition-colors"
            >
              {value.length === STATUS_OPTIONS.length ? 'Deseleccionar todo' : 'Seleccionar todo'}
            </button>
            {value.length > 0 && (
              <button
                type="button"
                onClick={handleClear}
                className="text-xs font-medium text-gray-600 hover:text-gray-800 transition-colors"
              >
                Limpiar
              </button>
            )}
          </div>

          {/* Lista de opciones */}
          <div className="py-1">
            {STATUS_OPTIONS.map((option) => {
              const isSelected = value.includes(option.value);

              return (
                <label
                  key={option.value}
                  className="flex items-center px-3 py-2 hover:bg-gray-50 cursor-pointer transition-colors"
                >
                  <input
                    type="checkbox"
                    checked={isSelected}
                    onChange={() => handleToggle(option.value)}
                    className="h-4 w-4 text-blue-600 border-gray-300 rounded focus:ring-blue-500"
                  />
                  <span
                    className={`ml-1 text-sm px-2 py-1 rounded border ${option.color}`}
                  >
                    {option.label}
                  </span>
                </label>
              );
            })}
          </div>

          {/* Contador de seleccionados */}
          <div className="sticky bottom-0 bg-gray-50 border-t border-gray-200 px-3 py-2">
            <div className="text-xs text-gray-600">
              {value.length === 0 ? (
                'No hay estados seleccionados'
              ) : (
                `${value.length} de ${STATUS_OPTIONS.length} estados seleccionados`
              )}
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
