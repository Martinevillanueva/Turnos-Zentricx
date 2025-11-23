import { useState, useCallback } from 'react';
import AppointmentService from '@/services/appointmentService';

interface Patient {
  id: string;
  firstName: string;
  lastName: string;
  fullName?: string;
  documentNumber?: string;
}

export const usePatientSearch = () => {
  const [patientName, setPatientName] = useState('');
  const [selectedPatient, setSelectedPatient] = useState<Patient | null>(null);
  const [patientSuggestions, setPatientSuggestions] = useState<Patient[]>([]);
  const [showPatientSuggestions, setShowPatientSuggestions] = useState(false);
  const [isSearching, setIsSearching] = useState(false);

  const searchPatients = useCallback(async (query: string) => {
    if (query.length < 3) {
      setPatientSuggestions([]);
      setShowPatientSuggestions(false);
      return;
    }

    try {
      setIsSearching(true);
      const patients = await AppointmentService.searchPatients(query);
      setPatientSuggestions(patients.slice(0, 5)); // Máximo 5 sugerencias
      setShowPatientSuggestions(patients.length > 0);
    } catch (error) {
      console.error('Error searching patients:', error);
      setPatientSuggestions([]);
      setShowPatientSuggestions(false);
    } finally {
      setIsSearching(false);
    }
  }, []);

  const handlePatientNameChange = useCallback((value: string) => {
    // Solo permitir búsqueda si no hay paciente seleccionado
    if (!selectedPatient) {
      setPatientName(value);
      searchPatients(value);
    }
  }, [selectedPatient, searchPatients]);

  const handlePatientSelect = useCallback((patient: Patient) => {
    const fullName = patient.fullName || `${patient.firstName} ${patient.lastName}`;
    setSelectedPatient(patient);
    setPatientName(fullName);
    setShowPatientSuggestions(false);
    setPatientSuggestions([]);
  }, []);

  const handleClearPatient = useCallback(() => {
    setSelectedPatient(null);
    setPatientName('');
    setPatientSuggestions([]);
    setShowPatientSuggestions(false);
  }, []);

  const handlePatientCreated = useCallback((newPatient: any) => {
    const fullName = newPatient.fullName || `${newPatient.firstName} ${newPatient.lastName}`;
    setSelectedPatient(newPatient);
    setPatientName(fullName);
    setPatientSuggestions([]);
    setShowPatientSuggestions(false);
  }, []);

  const resetSearch = useCallback(() => {
    setPatientName('');
    setSelectedPatient(null);
    setPatientSuggestions([]);
    setShowPatientSuggestions(false);
  }, []);

  return {
    // Estados
    patientName,
    selectedPatient,
    patientSuggestions,
    showPatientSuggestions,
    isSearching,

    // Handlers
    handlePatientNameChange,
    handlePatientSelect,
    handleClearPatient,
    handlePatientCreated,

    // Utilidades
    resetSearch,
    setPatientName,
    setSelectedPatient
  };
};