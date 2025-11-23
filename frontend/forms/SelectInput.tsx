import React from 'react';

interface SelectInputProps {
  id: string;
  label: string;
  value: string;
  options: Array<{ id: string; label: string }>;
  onChange: (value: string) => void;
  disabled?: boolean;
  className?: string;
  placeholder?: string;
}

export default function SelectInput({
  id,
  label,
  value,
  options,
  onChange,
  disabled = false,
  className = '',
  placeholder = 'Seleccionar',
}: Readonly<SelectInputProps>) {
  return (
    <div>
      <label htmlFor={id} className="form-label">{label}</label>
      <select
        id={id}
        value={value}
        onChange={e => onChange(e.target.value)}
        disabled={disabled}
        className={`form-input ${className}`}
      >
        <option value="">{placeholder}</option>
        {options.map(opt => (
          <option key={opt.id} value={opt.id}>{opt.label}</option>
        ))}
      </select>
    </div>
  );
}
