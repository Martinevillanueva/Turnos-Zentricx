import React from 'react';

export interface FormTextareaProps {
  id: string;
  label: string;
  value: string;
  onChange: (value: string) => void;
  rows?: number;
  placeholder?: string;
  className?: string;
}

export default function FormTextarea({
  id,
  label,
  value,
  onChange,
  rows = 3,
  placeholder,
  className = '',
}: Readonly<FormTextareaProps>) {
  return (
    <div>
      <label htmlFor={id} className="form-label">
        {label}
      </label>
      <textarea
        id={id}
        value={value}
        onChange={e => onChange(e.target.value)}
        rows={rows}
        placeholder={placeholder}
        className={`form-input ${className}`}
      />
    </div>
  );
}
