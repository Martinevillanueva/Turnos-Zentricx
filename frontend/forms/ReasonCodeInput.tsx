import React, { useState } from 'react';

interface ReasonCodeInputProps {
  value: string;
  onChange: (value: string) => void;
  disabled?: boolean;
  className?: string;
}

// Códigos ICD-10 comunes
const COMMON_ICD10_CODES = [
  { code: 'Z00.00', description: 'Examen médico general' },
  { code: 'I10', description: 'Hipertensión esencial' },
  { code: 'E11', description: 'Diabetes tipo 2' },
  { code: 'J44.0', description: 'EPOC' },
  { code: 'R50.9', description: 'Fiebre no especificada' },
  { code: 'M79.3', description: 'Dolor articular' },
  { code: 'R51', description: 'Cefalea' },
  { code: 'K21.9', description: 'Reflujo gastroesofágico' },
];

export default function ReasonCodeInput({
  value,
  onChange,
  disabled = false,
  className = '',
}: ReasonCodeInputProps) {
  const [showSuggestions, setShowSuggestions] = useState(false);
  const selectedCode = COMMON_ICD10_CODES.find(c => c.code === value);

  return (
    <div className={className}>
      <label htmlFor="reasonCode" className="block text-sm font-medium text-gray-700 mb-1">
        Código de Razón (ICD-10/SNOMED)
      </label>
      <div className="relative">
        <input
          type="text"
          id="reasonCode"
          value={value}
          onChange={(e) => onChange(e.target.value)}
          onFocus={() => setShowSuggestions(true)}
          onBlur={() => setTimeout(() => setShowSuggestions(false), 200)}
          disabled={disabled}
          placeholder="Ej: I10, E11, Z00.00"
          className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-primary-500"
        />
        
        {showSuggestions && !value && (
          <div className="absolute z-10 w-full mt-1 bg-white border border-gray-300 rounded-md shadow-lg max-h-60 overflow-auto">
            <div className="px-3 py-2 bg-gray-50 border-b text-xs font-medium text-gray-500">
              Códigos ICD-10 comunes:
            </div>
            {COMMON_ICD10_CODES.map((item) => (
              <button
                key={item.code}
                type="button"
                onClick={() => {
                  onChange(item.code);
                  setShowSuggestions(false);
                }}
                className="w-full text-left px-3 py-2 hover:bg-gray-50 border-b last:border-b-0"
              >
                <div className="font-medium text-sm">{item.code}</div>
                <div className="text-xs text-gray-600">{item.description}</div>
              </button>
            ))}
          </div>
        )}
      </div>
      {selectedCode && (
        <p className="mt-1 text-xs text-gray-600">
          📋 {selectedCode.description}
        </p>
      )}
      {!selectedCode && value && (
        <p className="mt-1 text-xs text-gray-500">
          Código personalizado: {value}
        </p>
      )}
    </div>
  );
}
