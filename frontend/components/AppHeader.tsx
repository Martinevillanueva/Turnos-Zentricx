'use client';

import React from 'react';

interface AppHeaderProps {
  readonly viewType: 'list' | 'calendar' | 'patients';
  readonly onViewTypeChange: (viewType: 'list' | 'calendar' | 'patients') => void;
  readonly error?: string | null;
  readonly onRetry?: () => void;
}

export default function AppHeader({
  viewType,
  onViewTypeChange,
  error,
  onRetry
}: AppHeaderProps) {
  return (
    <div className="space-y-6">
      {/* Header con título y toggle de vista */}
      <div className="flex justify-between items-center">
        <div>
          <h1 className="text-2xl font-bold text-gray-900">
            Sistema de Turnos
          </h1>
          <p className="text-gray-600 mt-1">
            Estándar FHIR HL7
          </p>
        </div>
        <div className="flex items-center gap-4">
          {/* Toggle de vista */}
          <div className="flex items-center bg-gray-100 rounded-lg p-1">
            <button
              onClick={() => onViewTypeChange("list")}
              className={`px-3 py-2 text-sm font-medium rounded-md transition-colors ${
                viewType === "list"
                  ? "bg-white text-gray-900 shadow"
                  : "text-gray-600 hover:text-gray-900"
              }`}
            >
              📋 Recepción
            </button>
            <button
              onClick={() => onViewTypeChange("calendar")}
              className={`px-3 py-2 text-sm font-medium rounded-md transition-colors ${
                viewType === "calendar"
                  ? "bg-white text-gray-900 shadow"
                  : "text-gray-600 hover:text-gray-900"
              }`}
            >
              📅 Turnos por fecha
            </button>
            <button
              onClick={() => onViewTypeChange("patients")}
              className={`px-3 py-2 text-sm font-medium rounded-md transition-colors ${
                viewType === "patients"
                  ? "bg-white text-gray-900 shadow"
                  : "text-gray-600 hover:text-gray-900"
              }`}
            >
              👥 Pacientes
            </button>
          </div>
        </div>
      </div>

      {/* Mensaje de error si existe */}
      {error && (
        <div className="bg-red-50 border border-red-200 text-red-700 px-4 py-3 rounded-md">
          <p className="font-medium">Error:</p>
          <p>{error}</p>
          {onRetry && (
            <button
              onClick={onRetry}
              className="mt-2 text-sm text-red-600 hover:text-red-800 underline"
            >
              Reintentar
            </button>
          )}
        </div>
      )}
    </div>
  );
}
