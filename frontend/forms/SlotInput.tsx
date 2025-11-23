import React from 'react';

interface SlotInputProps {
  value: string;
  onChange: (value: string) => void;
  doctorName?: string;
  date?: string;
  time?: string;
  disabled?: boolean;
  className?: string;
}

export default function SlotInput({
  value,
  onChange,
  doctorName,
  date,
  time,
  disabled = false,
  className = '',
}: SlotInputProps) {
  // Auto-generar slot ID si hay datos disponibles
  const generateSlotId = () => {
    if (!date || !time || !doctorName) return '';
    
    const dateStr = date.replace(/-/g, '');
    const timeStr = time.replace(/:/g, '');
    const doctorInitials = doctorName
      .split(' ')
      .map(n => n[0])
      .join('')
      .toUpperCase()
      .substring(0, 3);
    
    return `SLOT-${dateStr}-${timeStr}-${doctorInitials}`;
  };

  const handleAutoGenerate = () => {
    const generated = generateSlotId();
    if (generated) {
      onChange(generated);
    }
  };

  return (
    <div className={className}>
      <label htmlFor="slotId" className="block text-sm font-medium text-gray-700 mb-1">
        Slot ID (Opcional)
      </label>
      <div className="flex gap-2">
        <input
          type="text"
          id="slotId"
          value={value}
          onChange={(e) => onChange(e.target.value)}
          disabled={disabled}
          placeholder="Ej: SLOT-20241122-1000-DRG"
          className="flex-1 px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-primary-500"
        />
        {date && time && doctorName && !value && (
          <button
            type="button"
            onClick={handleAutoGenerate}
            className="px-3 py-2 text-sm bg-gray-100 hover:bg-gray-200 text-gray-700 rounded-md transition-colors"
            title="Generar automáticamente"
          >
            🔄 Auto
          </button>
        )}
      </div>
      <p className="mt-1 text-xs text-gray-500">
        Identificador único del bloque horario
      </p>
    </div>
  );
}
