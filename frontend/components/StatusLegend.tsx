'use client';

import React from 'react';

interface StatusLegendProps {
  readonly className?: string;
}

export default function StatusLegend({ className = '' }: StatusLegendProps) {
  const statusItems = [
    { id: 'pending', color: 'bg-yellow-100 border-l-yellow-500', label: 'Pendiente' },
    { id: 'confirmed', color: 'bg-blue-100 border-l-blue-500', label: 'Confirmado' },
    { id: 'arrived', color: 'bg-indigo-100 border-l-indigo-500', label: 'Recepcionado' },
    { id: 'consultation', color: 'bg-orange-100 border-l-orange-500', label: 'En consulta' },
    { id: 'completed', color: 'bg-green-100 border-l-green-500', label: 'Completado' },
    { id: 'cancelled', color: 'bg-red-100 border-l-red-500', label: 'Cancelado' }
  ];

  return (
    <div className={`bg-gray-50 rounded-lg border border-gray-200 ${className}`}>
      <h4 className="text-sm font-medium text-gray-700 mb-2 px-3 pt-3">Referencias de Estado</h4>
      <div className="grid grid-cols-2 md:grid-cols-3 gap-3 px-3 pb-3">
        {statusItems.map((item) => (
          <div key={item.id} className="flex items-center gap-2">
            <div className={`w-4 h-4 ${item.color} border-l-4 rounded-sm`}></div>
            <span className="text-xs text-gray-600">{item.label}</span>
          </div>
        ))}
      </div>
    </div>
  );
}