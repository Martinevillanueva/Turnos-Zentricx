import { useState } from 'react';

export const usePatientModal = () => {
  const [showPatientModal, setShowPatientModal] = useState(false);
  const [editingPatient, setEditingPatient] = useState<any>(null);
  const [patientModalMode, setPatientModalMode] = useState<'create' | 'edit'>('create');

  const openCreateModal = () => {
    setEditingPatient(null);
    setPatientModalMode('create');
    setShowPatientModal(true);
  };

  const openEditModal = (patient: any) => {
    setEditingPatient(patient);
    setPatientModalMode('edit');
    setShowPatientModal(true);
  };

  const closeModal = () => {
    setShowPatientModal(false);
    setEditingPatient(null);
    setPatientModalMode('create');
  };

  return {
    showPatientModal,
    editingPatient,
    patientModalMode,
    openCreateModal,
    openEditModal,
    closeModal,
    setShowPatientModal,
    setEditingPatient,
    setPatientModalMode,
  };
};
