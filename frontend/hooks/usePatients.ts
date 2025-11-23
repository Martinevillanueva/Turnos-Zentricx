import { useState } from 'react';

export const usePatients = () => {
  const [patients, setPatients] = useState<any[]>([]);
  const [loadingPatients, setLoadingPatients] = useState(false);
  const [patientsPagination, setPatientsPagination] = useState({
    total: 0,
    totalPages: 0,
    page: 1,
    limit: 20
  });
  const [patientSearchQuery, setPatientSearchQuery] = useState<string>("");
  const [showPatientProfile, setShowPatientProfile] = useState(false);
  const [selectedPatientForProfile, setSelectedPatientForProfile] = useState<any>(null);

  const loadPatients = async () => {
    try {
      setLoadingPatients(true);
      // Limitar a máximo 40 resultados con 2 páginas de 20
      const maxLimit = 20; // 20 por página
      const { apiUrl } = await import('@/api/config');
      const response = await fetch(
        apiUrl(`/api/patients?page=${patientsPagination.page}&limit=${maxLimit}&search=${encodeURIComponent(patientSearchQuery)}`)
      );
      
      if (!response.ok) {
        throw new Error("Error al cargar pacientes");
      }
      
      const data = await response.json();
      setPatients(data.patients || []);
      setPatientsPagination(prev => ({
        ...prev,
        total: Math.min(data.total || 0, 40), // Máximo 40 resultados
        totalPages: Math.min(data.totalPages || 0, 2), // Máximo 2 páginas
        limit: maxLimit
      }));
    } catch (err) {
      console.error("Error loading patients:", err);
      throw err;
    } finally {
      setLoadingPatients(false);
    }
  };

  const handleViewPatientProfile = (patient: any) => {
    setSelectedPatientForProfile(patient);
    setShowPatientProfile(true);
  };

  const handleBackFromProfile = () => {
    setShowPatientProfile(false);
    setSelectedPatientForProfile(null);
  };

  return {
    patients,
    loadingPatients,
    patientsPagination,
    patientSearchQuery,
    showPatientProfile,
    selectedPatientForProfile,
    setPatientSearchQuery,
    setPatientsPagination,
    setSelectedPatientForProfile,
    loadPatients,
    handleViewPatientProfile,
    handleBackFromProfile,
  };
};
