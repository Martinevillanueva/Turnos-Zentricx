import React from 'react';
import PatientProfileView from '../views/PatientProfileView';

interface PatientsSectionProps {
  // State
  patients: any[];
  loadingPatients: boolean;
  patientSearchQuery: string;
  setPatientSearchQuery: (value: string) => void;
  showPatientProfile: boolean;
  selectedPatientForProfile: any;
  
  // Callbacks
  loadPatients: () => void;
  setShowPatientModal: (value: boolean) => void;
  handleBackFromProfile: () => void;
  handleRowClick: (patient: any) => void;
  setEditingPatient: (patient: any) => void;
  setPatientModalMode: (mode: 'create' | 'edit') => void;
  
  // Pagination
  patientsPagination: {
    total: number;
    totalPages: number;
    page: number;
    limit: number;
  };
  setPatientsPagination: React.Dispatch<React.SetStateAction<{
    total: number;
    totalPages: number;
    page: number;
    limit: number;
  }>>;
}

const PatientsSection: React.FC<PatientsSectionProps> = ({
  patients,
  loadingPatients,
  patientSearchQuery,
  setPatientSearchQuery,
  showPatientProfile,
  selectedPatientForProfile,
  loadPatients,
  setShowPatientModal,
  handleBackFromProfile,
  handleRowClick,
  setEditingPatient,
  setPatientModalMode,
  patientsPagination,
  setPatientsPagination,
}) => {
  const totalPages = patientsPagination.totalPages;
  const currentPage = patientsPagination.page;

  return (
    <>
      {showPatientProfile && selectedPatientForProfile ? (
        <PatientProfileView 
          patient={selectedPatientForProfile}
          onBack={handleBackFromProfile}
          onEditPatient={(patient: any, onUpdated: any) => {
            // Transformar el paciente al formato esperado por el formulario
            const formattedPatient = {
              ...patient,
              // Convertir birthDate al formato YYYY-MM-DD si existe
              birthDate: patient.birthDate 
                ? new Date(patient.birthDate).toISOString().split('T')[0]
                : '',
              // Asegurar que todos los campos opcionales tengan valores
              phone: patient.phone || '',
              email: patient.email || '',
              address: patient.address || '',
              gender: patient.gender || '',
            };
            // setEditingPatient es en realidad openEditModal del hook
            setEditingPatient(formattedPatient);
            globalThis.__onPatientProfileUpdated = onUpdated;
          }}
        />
      ) : (
        <div className="space-y-0 bg-white rounded-lg border border-gray-200 shadow-sm overflow-hidden">
          {/* Filtros para búsqueda de pacientes */}
          <div className="bg-gray-50 px-6 py-4 border-b border-gray-200">
            <div className="flex gap-2">
              <input
                type="text"
                value={patientSearchQuery}
                onChange={(e) => setPatientSearchQuery(e.target.value)}
                onKeyDown={(e) => {
                  if (e.key === 'Enter') {
                    setPatientsPagination(prev => ({ ...prev, page: 1 }));
                    loadPatients();
                  }
                }}
                placeholder="Buscar por nombre, apellido, DNI o email..."
                className="flex-1 px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent text-sm"
              />
              <button
                onClick={() => {
                  setPatientsPagination(prev => ({ ...prev, page: 1 }));
                  loadPatients();
                }}
                disabled={loadingPatients || patientSearchQuery.trim().length < 3}
                className="px-4 py-2 bg-blue-600 text-white rounded-md hover:bg-blue-700 disabled:bg-gray-400 disabled:cursor-not-allowed transition-colors flex items-center gap-2"
                title={patientSearchQuery.trim().length < 3 ? "Ingrese al menos 3 caracteres para buscar" : ""}
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
                onClick={() => setShowPatientModal(true)}
                className="px-4 py-2 bg-green-600 text-white rounded-md hover:bg-green-700 transition-colors flex items-center gap-2"
              >
                + Nuevo Paciente
              </button>
            </div>
          </div>

          {patients.length === 0 ? (
            /* Mensaje cuando no hay pacientes */
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
                  onClick={() => setShowPatientModal(true)}
                  className="px-4 py-2 bg-green-600 text-white rounded-md hover:bg-green-700 transition-colors"
                >
                  + Nuevo Paciente
                </button>
              </div>
            </div>
          ) : (
            <>
              {/* Tabla de pacientes */}
              <div className="overflow-x-auto shadow-sm">
                <table className="min-w-full divide-y divide-gray-200">
                  <thead className="bg-gradient-to-r from-blue-600 to-blue-700">
                    <tr>
                      <th scope="col" className="px-6 py-4 text-left text-xs font-semibold text-white uppercase tracking-wider">
                        Paciente
                      </th>
                      <th scope="col" className="px-6 py-4 text-left text-xs font-semibold text-white uppercase tracking-wider">
                        DNI
                      </th>
                      <th scope="col" className="px-6 py-4 text-left text-xs font-semibold text-white uppercase tracking-wider">
                        Email
                      </th>
                      <th scope="col" className="px-6 py-4 text-left text-xs font-semibold text-white uppercase tracking-wider">
                        Teléfono
                      </th>
                      <th scope="col" className="px-6 py-4 text-left text-xs font-semibold text-white uppercase tracking-wider">
                        Estado
                      </th>
                    </tr>
                  </thead>
                  <tbody className="bg-white divide-y divide-gray-200">
                    {patients.map((patient) => (
                      <tr 
                        key={patient.id} 
                        onClick={() => handleRowClick(patient)}
                        className="hover:bg-gray-50 cursor-pointer transition-colors"
                      >
                        <td className="px-6 py-4 whitespace-nowrap">
                          <div className="text-sm font-medium text-gray-900">
                            {patient.firstName} {patient.lastName}
                          </div>
                        </td>
                        <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500">
                          {patient.dni || '-'}
                        </td>
                        <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500">
                          {patient.email || '-'}
                        </td>
                        <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500">
                          {patient.phone || '-'}
                        </td>
                        <td className="px-6 py-4 whitespace-nowrap">
                          <span className={`px-2 inline-flex text-xs leading-5 font-semibold rounded-full ${
                            patient.isActive 
                              ? 'bg-green-100 text-green-800' 
                              : 'bg-gray-100 text-gray-800'
                          }`}>
                            {patient.isActive ? 'Activo' : 'Inactivo'}
                          </span>
                        </td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>

              {/* Paginación */}
              {totalPages > 1 && (
                <div className="bg-white border-t border-gray-200 px-6 py-4">
                  <div className="flex items-center justify-between">
                    <div className="text-sm text-gray-700">
                      Mostrando {((currentPage - 1) * patientsPagination.limit) + 1} a {Math.min(currentPage * patientsPagination.limit, patientsPagination.total)} de {patientsPagination.total} pacientes
                    </div>
                    <div className="flex items-center space-x-2">
                      <button
                        onClick={() => setPatientsPagination(prev => ({ ...prev, page: Math.max(prev.page - 1, 1) }))}
                        disabled={currentPage === 1}
                        className={`px-3 py-2 text-sm font-medium rounded-md transition-colors ${
                          currentPage === 1
                            ? "bg-gray-100 text-gray-400 cursor-not-allowed"
                            : "bg-white text-gray-700 border border-gray-300 hover:bg-gray-50"
                        }`}
                      >
                        ← Anterior
                      </button>

                      <div className="flex space-x-1">
                        {Array.from({ length: totalPages }, (_, i) => i + 1)
                          .filter((page) => {
                            return (
                              Math.abs(page - currentPage) <= 2 ||
                              page === 1 ||
                              page === totalPages
                            );
                          })
                          .map((page, index, array) => {
                            const prevPage = array[index - 1];
                            const showEllipsis = prevPage && page - prevPage > 1;

                            return (
                              <React.Fragment key={page}>
                                {showEllipsis && (
                                  <span className="px-3 py-2 text-sm text-gray-500">...</span>
                                )}
                                <button
                                  onClick={() => setPatientsPagination(prev => ({ ...prev, page }))}
                                  className={`px-3 py-2 text-sm font-medium rounded-md transition-colors ${
                                    currentPage === page
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
                        onClick={() => setPatientsPagination(prev => ({ ...prev, page: Math.min(prev.page + 1, totalPages) }))}
                        disabled={currentPage === totalPages}
                        className={`px-3 py-2 text-sm font-medium rounded-md transition-colors ${
                          currentPage === totalPages
                            ? "bg-gray-100 text-gray-400 cursor-not-allowed"
                            : "bg-white text-gray-700 border border-gray-300 hover:bg-gray-50"
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
      )}
    </>
  );
};

export default PatientsSection;
