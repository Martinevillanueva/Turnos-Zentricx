import React from 'react';

export interface FormInputProps {
  id: string;
  label: string;
  value: string;
  onChange: (value: string) => void;
  type?: string;
  required?: boolean;
  min?: string;
  max?: string;
  placeholder?: string;
  className?: string;
}

export default function FormInput({
  id,
  label,
  value,
  onChange,
  type = 'text',
  required = false,
  min,
  max,
  placeholder,
  className = '',
}: Readonly<FormInputProps>) {
  return (
    <div>
      <label htmlFor={id} className="form-label">
        {label} {required && '*'}
      </label>
      <input
        id={id}
        type={type}
        value={value}
        onChange={e => onChange(e.target.value)}
        required={required}
        min={min}
        max={max}
        placeholder={placeholder}
        className={`form-input ${className}`}
      />
    </div>
  );
}
