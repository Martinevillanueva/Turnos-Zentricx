'use client';

import React, { useState, useEffect } from 'react';
import Modal from './Modal';
import PatientForm from '@/forms/PatientForm';
import { CreatePatientData } from '@/hooks/usePatientValidation';
import SuccessMessage from '@/components/SuccessMessage';
import ConfirmDeactivateModal from './ConfirmDeactivateModal';
import { usePatientOperations } from '@/hooks/usePatientOperations';

interface PatientModalProps {
  readonly isOpen: boolean;
  readonly onClose: () => void;
  readonly onPatientCreated?: (patient: any) => void;
  readonly onPatientUpdated?: (patient: any) => void;
  readonly onPatientDeactivated?: (patient: any) => void;
  readonly title?: string;
  readonly patient?: any; // Paciente existente para editar (opcional)
  readonly mode?: 'create' | 'edit';
}

export default function PatientModal({
  isOpen,
  onClose,
  onPatientCreated,
  onPatientUpdated,
  onPatientDeactivated,
  title = "Nuevo Paciente",
  patient = null,
  mode = 'create'
}: PatientModalProps) {
  const [showDeactivateConfirm, setShowDeactivateConfirm] = useState(false);
  const [showUpdateConfirm, setShowUpdateConfirm] = useState(false);
  const [pendingPatientData, setPendingPatientData] = useState<CreatePatientData | null>(null);

  const {
    isCreating,
    isUpdating,
    isDeactivating,
    error,
    success,
    successType,
    createPatient,
    updatePatient,
    deactivatePatient,
    resetState
  } = usePatientOperations({
    onPatientCreated,
    onPatientUpdated,
    onPatientDeactivated,
    onSuccess: () => {
      // Solo resetear estado y cerrar después de mostrar el mensaje de éxito
      setTimeout(() => {
        resetState();
        setShowUpdateConfirm(false);
        setPendingPatientData(null);
        onClose();
      }, 2000);
    }
  });

  // Resetear estado cuando se abre el modal (solo si no hay éxito activo)
  useEffect(() => {
    if (isOpen && !success) {
      resetState();
      setShowDeactivateConfirm(false);
      setShowUpdateConfirm(false);
      setPendingPatientData(null);
    }
  }, [isOpen, resetState, success]);

  const isEditMode = mode === 'edit' && patient;

  const handleSubmit = async (patientData: CreatePatientData): Promise<void> => {
    if (isEditMode && patient?.id) {
      // Para edición, mostrar confirmación primero
      setPendingPatientData(patientData);
      setShowUpdateConfirm(true);
    } else {
      await createPatient(patientData);
    }
  };

  const handleUpdateConfirm = async (): Promise<void> => {
    if (patient?.id && pendingPatientData) {
      await updatePatient(patient.id, pendingPatientData);
      setShowUpdateConfirm(false);
      setPendingPatientData(null);
    }
  };

  const handleDeactivatePatient = async (): Promise<void> => {
    if (patient?.id) {
      await deactivatePatient(patient.id);
      setShowDeactivateConfirm(false);
    }
  };

  const handleClose = () => {
    if (!isCreating && !isUpdating && !isDeactivating) {
      resetState();
      setShowDeactivateConfirm(false);
      setShowUpdateConfirm(false);
      setPendingPatientData(null);
      onClose();
    }
  };

  let modalTitle = title;
  if (success) {
    modalTitle = isEditMode ? '¡Paciente actualizado exitosamente!' : '¡Paciente creado exitosamente!';
  }

  // Determinar el contenido del mensaje de éxito
  const getSuccessTitle = () => {
    if (successType === 'error') {
      return '¡Paciente dado de baja exitosamente!';
    }
    return isEditMode ? '¡Paciente actualizado exitosamente!' : '¡Paciente creado exitosamente!';
  };

  const getSuccessDescription = () => {
    if (successType === 'error') {
      return 'El paciente ha sido dado de baja y no aparecerá en las búsquedas.';
    }
    return isEditMode
      ? 'Los datos del paciente han sido actualizados correctamente.'
      : 'El paciente ha sido registrado en el sistema.';
  };

  let modalContent: React.ReactNode;
  if (success) {
    modalContent = (
      <SuccessMessage
        title={getSuccessTitle()}
        description={getSuccessDescription()}
        type={successType}
      />
    );
  } else if (showDeactivateConfirm) {
    modalContent = (
      <ConfirmDeactivateModal
        patient={patient}
        isDeactivating={isDeactivating}
        onCancel={() => setShowDeactivateConfirm(false)}
        onConfirm={handleDeactivatePatient}
      />
    );
  } else if (showUpdateConfirm) {
    modalContent = (
      <div className="text-center">
        <div className="mx-auto flex items-center justify-center h-12 w-12 rounded-full bg-blue-100 mb-4">
          <svg className="h-6 w-6 text-blue-600" fill="none" viewBox="0 0 24 24" stroke="currentColor">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M5 13l4 4L19 7" />
          </svg>
        </div>
        <h3 className="text-lg font-medium text-gray-900 mb-2">
          Confirmar actualización
        </h3>
        <p className="text-sm text-gray-500 mb-6">
          ¿Está seguro de que desea actualizar los datos de <strong>{patient?.firstName} {patient?.lastName}</strong>?
        </p>
        <div className="flex justify-center space-x-3">
          <button
            onClick={() => {
              setShowUpdateConfirm(false);
              setPendingPatientData(null);
            }}
            className="px-4 py-2 border border-gray-300 rounded-md text-sm font-medium text-gray-700 bg-white hover:bg-gray-50 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-blue-500"
            disabled={isUpdating}
          >
            Cancelar
          </button>
          <button
            onClick={handleUpdateConfirm}
            className="px-4 py-2 border border-transparent rounded-md text-sm font-medium text-white bg-blue-600 hover:bg-blue-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-blue-500 disabled:opacity-50"
            disabled={isUpdating}
          >
            {isUpdating ? (
              <div className="flex items-center">
                <div className="animate-spin rounded-full h-4 w-4 border-b-2 border-white mr-2"></div>
                Actualizando...
              </div>
            ) : (
              'Confirmar actualización'
            )}
          </button>
        </div>
      </div>
    );
  } else {
    modalContent = (
      <PatientForm
        onSubmit={handleSubmit}
        onCancel={handleClose}
        isLoading={isCreating || isUpdating}
        error={error || undefined}
        initialData={isEditMode ? patient : undefined}
        mode={mode}
        onDeactivate={isEditMode ? () => setShowDeactivateConfirm(true) : undefined}
        isDeactivating={isDeactivating}
      />
    );
  }

  return (
    <Modal
      isOpen={isOpen}
      onClose={handleClose}
      title={modalTitle}
      size="xl"
      showCloseButton={!success}
      allowClose={!success}
    >
      {modalContent}
    </Modal>
  );
}