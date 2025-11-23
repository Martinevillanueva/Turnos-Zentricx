import React from 'react';

interface Patient {
  id: string;
  firstName: string;
  lastName: string;
  fullName?: string;
  documentNumber?: string;
}

interface PatientSearchInputProps {
  patientName: string;
  selectedPatient: Patient | null;
  patientSuggestions: Patient[];
  showPatientSuggestions: boolean;
  isSearching?: boolean;
  onPatientNameChange: (value: string) => void;
  onPatientSelect: (patient: Patient) => void;
  onClearPatient: () => void;
  onCreatePatient?: () => void;
  disabled?: boolean;
  className?: string;
  placeholder?: string;
}

export default function PatientSearchInput({
  patientName,
  selectedPatient,
  patientSuggestions,
  showPatientSuggestions,
  isSearching = false,
  onPatientNameChange,
  onPatientSelect,
  onClearPatient,
  onCreatePatient,
  disabled = false,
  className = '',
  placeholder = "Escriba el nombre del paciente para buscar..."
}: PatientSearchInputProps) {
  return (
    <div className={`relative ${className}`}>
      <div className="flex items-center justify-between mb-2">
        <label htmlFor="patient-name" className="form-label mb-0">
          Nombre del Paciente *
        </label>
        {onCreatePatient && (
          <button
            type="button"
            onClick={onCreatePatient}
            className="inline-flex items-center px-2 py-1 text-xs font-medium text-blue-600 bg-blue-100 rounded-md hover:bg-blue-200 transition-colors"
            title="Crear nuevo paciente"
            disabled={disabled}
          >
            <span className="text-sm mr-1">+</span>
            <span>Nuevo</span>
          </button>
        )}
      </div>

      {selectedPatient ? (
        /* Paciente seleccionado - Vista anclada */
        <div className="relative">
          <div className="form-input bg-green-50 border-green-200 text-green-800 pr-10">
            <div className="flex items-center justify-between">
              <div>
                <div className="font-medium">{patientName}</div>
                {selectedPatient.documentNumber && (
                  <div className="text-xs text-green-600">DNI: {selectedPatient.documentNumber}</div>
                )}
              </div>
              <span className="text-xs text-green-600 bg-green-100 px-2 py-1 rounded-full">
                ✓ Seleccionado
              </span>
            </div>
          </div>
          <button
            type="button"
            onClick={onClearPatient}
            className="absolute right-2 top-1/2 transform -translate-y-1/2 text-green-400 hover:text-green-600 bg-white rounded-full p-1 shadow-sm border border-green-200"
            title="Limpiar selección"
            disabled={disabled}
          >
            ✕
          </button>
        </div>
      ) : (
        /* Búsqueda de paciente - Input normal */
        <div className="relative">
          <input
            type="text"
            id="patient-name"
            value={patientName}
            onChange={(e) => onPatientNameChange(e.target.value)}
            onBlur={() => {
              // Retrasar el ocultamiento para permitir clicks en sugerencias
              setTimeout(() => {}, 150);
            }}
            onFocus={() => {
              if (patientName.length >= 3) {
                // El hook maneja esto automáticamente
              }
            }}
            placeholder={placeholder}
            className="form-input"
            disabled={disabled}
            autoFocus
            autoComplete="off"
          />

          {/* Sugerencias de pacientes */}
          {showPatientSuggestions && patientSuggestions.length > 0 && (
            <div className="absolute z-50 w-full mt-1 bg-white border border-gray-300 rounded-md shadow-lg max-h-40 overflow-y-auto">
              {patientSuggestions.map((patient) => {
                const displayName = patient.fullName || `${patient.firstName} ${patient.lastName}`;
                return (
                  <button
                    key={patient.id}
                    type="button"
                    className="w-full px-3 py-2 text-left hover:bg-blue-50 focus:bg-blue-50 border-0 text-sm"
                    onClick={() => onPatientSelect(patient)}
                  >
                    <div className="font-medium">{displayName}</div>
                    {patient.documentNumber && (
                      <div className="text-xs text-gray-500">DNI: {patient.documentNumber}</div>
                    )}
                  </button>
                );
              })}
            </div>
          )}

          {/* Mensaje de ayuda cuando no hay paciente seleccionado */}
          {!showPatientSuggestions && patientName.length > 0 && patientName.length < 3 && (
            <div className="absolute z-50 w-full mt-1 bg-yellow-50 border border-yellow-200 rounded-md p-3">
              <p className="text-xs text-yellow-700">Escriba al menos 3 caracteres para buscar pacientes</p>
            </div>
          )}

          {/* Mensaje cuando no se encuentran pacientes */}
          {!showPatientSuggestions && patientName.length >= 3 && (
            <div className="absolute z-50 w-full mt-1 bg-gray-50 border border-gray-200 rounded-md p-3">
              <p className="text-xs text-gray-600">No se encontraron pacientes. Use el botón "+ Nuevo" para crear uno.</p>
            </div>
          )}

          {/* Indicador de búsqueda */}
          {isSearching && (
            <div className="absolute right-3 top-1/2 transform -translate-y-1/2">
              <div className="animate-spin rounded-full h-4 w-4 border-b-2 border-blue-600"></div>
            </div>
          )}
        </div>
      )}
    </div>
  );
}