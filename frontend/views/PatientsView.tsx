'use client';

import React from 'react';
import PatientProfileView from '@/views/PatientProfileView';

interface PatientsViewProps {
  patients: any[];
  loadingPatients: boolean;
  patientSearchQuery: string;
  patientsPagination: {
    total: number;
    totalPages: number;
    page: number;
    limit: number;
  };
  showPatientProfile: boolean;
  selectedPatientForProfile: any;
  onSearchQueryChange: (value: string) => void;
  onSearch: () => void;
  onPageChange: (page: number) => void;
  onViewPatientProfile: (patient: any) => void;
  onBackFromProfile: () => void;
  onEditPatient: (patient: any, onUpdated?: (updatedPatient: any) => void) => void;
  onCreateNewPatient: () => void;
}

export default function PatientsView({
  patients,
  loadingPatients,
  patientSearchQuery,
  patientsPagination,
  showPatientProfile,
  selectedPatientForProfile,
  onSearchQueryChange,
  onSearch,
  onPageChange,
  onViewPatientProfile,
  onBackFromProfile,
  onEditPatient,
  onCreateNewPatient,
}: Readonly<PatientsViewProps>) {
  if (showPatientProfile && selectedPatientForProfile) {
    return (
      <PatientProfileView 
        patient={selectedPatientForProfile}
        onBack={onBackFromProfile}
        onEditPatient={onEditPatient}
      />
    );
  }

  return (
    <div className="space-y-0 bg-white rounded-lg border border-gray-200 shadow-sm overflow-hidden">
      {/* Filtros para búsqueda de pacientes */}
      <div className="bg-gray-50 px-6 py-4 border-b border-gray-200">
        <div className="flex gap-2">
          <input
            type="text"
            value={patientSearchQuery}
            onChange={(e) => onSearchQueryChange(e.target.value)}
            onKeyDown={(e) => {
              if (e.key === 'Enter') {
                onSearch();
              }
            }}
            placeholder="Buscar por nombre, apellido, DNI o email..."
            className="flex-1 px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent text-sm"
          />
          <button
            onClick={onSearch}
            disabled={loadingPatients}
            className="px-4 py-2 bg-blue-600 text-white rounded-md hover:bg-blue-700 disabled:bg-gray-400 disabled:cursor-not-allowed transition-colors flex items-center gap-2"
          >
            {loadingPatients ? (
              <>
                <div className="animate-spin rounded-full h-4 w-4 border-b-2 border-white"></div>
                Buscando...
              </>
            ) : (
              <>
                🔍 Buscar
              </>
            )}
          </button>
          <button
            onClick={onCreateNewPatient}
            className="px-4 py-2 bg-green-600 text-white rounded-md hover:bg-green-700 transition-colors flex items-center gap-2"
          >
            + Nuevo Paciente
          </button>
        </div>
      </div>

      {patients.length === 0 ? (
        <div className="text-center py-12">
          <div className="mx-auto h-24 w-24 text-gray-400">
            <svg fill="none" viewBox="0 0 24 24" stroke="currentColor">
              <path
                strokeLinecap="round"
                strokeLinejoin="round"
                strokeWidth={1}
                d="M12 4.354a4 4 0 110 5.292M15 21H3v-1a6 6 0 0112 0v1zm0 0h6v-1a6 6 0 00-9-5.197m13.5-9a2.5 2.5 0 11-5 0 2.5 2.5 0 015 0z"
              />
            </svg>
          </div>
          <h3 className="mt-4 text-lg font-medium text-gray-900">
            No hay pacientes
          </h3>
          <p className="mt-2 text-gray-500">
            {patientSearchQuery ? 
              `No se encontraron pacientes para "${patientSearchQuery}"` : 
              'Utilice el campo de búsqueda para encontrar pacientes'}
          </p>
          <div className="mt-6">
            <button 
              onClick={onCreateNewPatient}
              className="px-4 py-2 bg-green-600 text-white rounded-md hover:bg-green-700 transition-colors"
            >
              + Nuevo Paciente
            </button>
          </div>
        </div>
      ) : (
        <>
          {/* Encabezado de la lista */}
          <div className="bg-blue-600 text-white px-6 py-4">
            <div className="flex items-center justify-between">
              <div className="flex items-center gap-4">
                <h2 className="text-xl font-semibold">
                  Gestión de Pacientes
                </h2>
              </div>
              <div className="text-blue-100 text-sm text-right">
                <div className="text-white font-medium">
                  {patients.length} paciente{patients.length === 1 ? '' : 's'}
                </div>
                {patientsPagination.totalPages > 1 && (
                  <div className="text-blue-200 text-xs mt-1">
                    Página {patientsPagination.page}/{patientsPagination.totalPages}
                  </div>
                )}
              </div>
            </div>
          </div>

          {/* Tabla de pacientes */}
          <div className="overflow-x-auto">
            <table className="min-w-full divide-y divide-gray-200">
              <thead className="bg-gray-50">
                <tr>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                    Nombre
                  </th>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                    DNI
                  </th>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                    Email
                  </th>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                    Teléfono
                  </th>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                    Fecha de Nacimiento
                  </th>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                    Acciones
                  </th>
                </tr>
              </thead>
              <tbody className="bg-white divide-y divide-gray-200">
                {patients.map((patient) => (
                  <tr key={patient.id} className="hover:bg-gray-50">
                    <td className="px-6 py-4 whitespace-nowrap">
                      <div className="text-sm font-medium text-gray-900">
                        {patient.firstName} {patient.lastName}
                      </div>
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-900">
                      {patient.documentNumber}
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-900">
                      {patient.email || '-'}
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-900">
                      {patient.phone || '-'}
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-900">
                      {patient.birthDate ? new Date(patient.birthDate).toLocaleDateString('es-ES') : '-'}
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap text-sm font-medium">
                      <button 
                        onClick={() => onViewPatientProfile(patient)}
                        className="text-green-600 hover:text-green-900"
                      >
                        Ver Perfil
                      </button>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>

          {/* Controles de paginación */}
          {patientsPagination.totalPages > 1 && (
            <div className="bg-white border-t border-gray-200 px-6 py-4">
              <div className="flex items-center justify-between">
                <div className="text-sm text-gray-700">
                  Mostrando{" "}
                  <span className="font-medium">{(patientsPagination.page - 1) * patientsPagination.limit + 1}</span> a{" "}
                  <span className="font-medium">
                    {Math.min(patientsPagination.page * patientsPagination.limit, patientsPagination.total)}
                  </span>{" "}
                  de <span className="font-medium">{patientsPagination.total}</span> pacientes
                </div>

                <div className="flex items-center space-x-2">
                  <button
                    onClick={() => onPageChange(Math.max(patientsPagination.page - 1, 1))}
                    disabled={patientsPagination.page === 1}
                    className={`px-3 py-2 text-sm font-medium rounded-md transition-colors ${
                      patientsPagination.page === 1
                        ? "bg-gray-100 text-gray-400 cursor-not-allowed"
                        : "bg-white text-gray-700 border border-gray-300 hover:bg-gray-50 focus:ring-2 focus:ring-blue-500"
                    }`}
                  >
                    ← Anterior
                  </button>

                  <div className="flex space-x-1">
                    {Array.from({ length: patientsPagination.totalPages }, (_, i) => i + 1)
                      .filter((page) => {
                        return (
                          Math.abs(page - patientsPagination.page) <= 2 ||
                          page === 1 ||
                          page === patientsPagination.totalPages
                        );
                      })
                      .map((page, index, array) => {
                        const prevPage = array[index - 1];
                        const showEllipsis = prevPage && page - prevPage > 1;

                        return (
                          <React.Fragment key={page}>
                            {showEllipsis && (
                              <span className="px-2 py-2 text-sm text-gray-500">
                                ...
                              </span>
                            )}
                            <button
                              onClick={() => onPageChange(page)}
                              className={`px-3 py-2 text-sm font-medium rounded-md transition-colors ${
                                page === patientsPagination.page
                                  ? "bg-blue-600 text-white"
                                  : "bg-white text-gray-700 border border-gray-300 hover:bg-gray-50"
                              }`}
                            >
                              {page}
                            </button>
                          </React.Fragment>
                        );
                      })}
                  </div>

                  <button
                    onClick={() => onPageChange(Math.min(patientsPagination.page + 1, patientsPagination.totalPages))}
                    disabled={patientsPagination.page === patientsPagination.totalPages}
                    className={`px-3 py-2 text-sm font-medium rounded-md transition-colors ${
                      patientsPagination.page === patientsPagination.totalPages
                        ? "bg-gray-100 text-gray-400 cursor-not-allowed"
                        : "bg-white text-gray-700 border border-gray-300 hover:bg-gray-50 focus:ring-2 focus:ring-blue-500"
                    }`}
                  >
                    Siguiente →
                  </button>
                </div>
              </div>
            </div>
          )}
        </>
      )}
    </div>
  );
}
