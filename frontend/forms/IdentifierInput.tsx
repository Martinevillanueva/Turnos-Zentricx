import React from 'react';

interface IdentifierInputProps {
  value: string;
  onChange: (value: string) => void;
  disabled?: boolean;
  className?: string;
}

export default function IdentifierInput({
  value,
  onChange,
  disabled = false,
  className = '',
}: IdentifierInputProps) {
  return (
    <div className={className}>
      <label htmlFor="identifier" className="block text-sm font-medium text-gray-700 mb-1">
        Identificador Externo (Opcional)
      </label>
      <input
        type="text"
        id="identifier"
        value={value}
        onChange={(e) => onChange(e.target.value)}
        disabled={disabled}
        placeholder="Ej: OSDE-2024-789456, EXT-ORG-12345"
        className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-primary-500"
      />
      <p className="mt-1 text-xs text-gray-500">
        Para integración con obras sociales o sistemas externos
      </p>
    </div>
  );
}
