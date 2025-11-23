import { useState, useCallback } from 'react';
import { CreatePatientData } from './usePatientValidation';

interface UsePatientOperationsOptions {
  onPatientCreated?: (patient: any) => void;
  onPatientUpdated?: (patient: any) => void;
  onPatientDeactivated?: (patient: any) => void;
  onSuccess?: () => void;
}

export const usePatientOperations = ({
  onPatientCreated,
  onPatientUpdated,
  onPatientDeactivated,
  onSuccess
}: UsePatientOperationsOptions = {}) => {
  const [isCreating, setIsCreating] = useState(false);
  const [isUpdating, setIsUpdating] = useState(false);
  const [isDeactivating, setIsDeactivating] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [success, setSuccess] = useState(false);
  const [successType, setSuccessType] = useState<'success' | 'error'>('success');

  const createPatient = useCallback(async (patientData: CreatePatientData): Promise<void> => {
    try {
      setIsCreating(true);
      setError(null);

      const { apiUrl, apiHeaders } = await import('@/api/config');
      const response = await fetch(apiUrl('/api/patients'), {
        method: 'POST',
        headers: apiHeaders,
        body: JSON.stringify(patientData),
      });

      if (!response.ok) {
        const errorData = await response.json();
        throw new Error(errorData.message || errorData.errors || 'Error al crear el paciente');
      }

      const result = await response.json();
      const newPatient = result.data || result;

      // Mostrar éxito
      setSuccessType('success');
      setSuccess(true);

      // Notificar al componente padre
      if (onPatientCreated) {
        onPatientCreated(newPatient);
      }

      // Llamar callback de éxito
      if (onSuccess) {
        onSuccess();
      }

    } catch (err) {
      console.error('Error creating patient:', err);
      let errorMessage: string;
      if (err instanceof Error) {
        errorMessage = err.message;
      } else {
        errorMessage = 'Error al crear el paciente';
      }
      setError(errorMessage);
      // Don't throw, let the UI handle the error display
    } finally {
      setIsCreating(false);
    }
  }, [onPatientCreated]);

  const updatePatient = useCallback(async (patientId: string, patientData: CreatePatientData): Promise<void> => {
    try {
      setIsUpdating(true);
      setError(null);

      const { apiUrl, apiHeaders } = await import('@/api/config');
      const response = await fetch(apiUrl(`/api/patients/${patientId}`), {
        method: 'PUT',
        headers: apiHeaders,
        body: JSON.stringify(patientData),
      });

      if (!response.ok) {
        const errorData = await response.json();
        throw new Error(errorData.message || errorData.errors || 'Error al actualizar el paciente');
      }

      const result = await response.json();
      const updatedPatient = result.data || result;

      // Mostrar éxito
      setSuccessType('success');
      setSuccess(true);

      // Notificar al componente padre
      if (onPatientUpdated) {
        onPatientUpdated(updatedPatient);
      }

      // Llamar callback de éxito
      if (onSuccess) {
        onSuccess();
      }

    } catch (err) {
      console.error('Error updating patient:', err);
      let errorMessage: string;
      if (err instanceof Error) {
        errorMessage = err.message;
      } else {
        errorMessage = 'Error al actualizar el paciente';
      }
      setError(errorMessage);
      // Don't throw, let the UI handle the error display
    } finally {
      setIsUpdating(false);
    }
  }, [onPatientUpdated]);

  const deactivatePatient = useCallback(async (patientId: string): Promise<void> => {
    try {
      setIsDeactivating(true);
      setError(null);

      const { apiUrl, apiHeaders } = await import('@/api/config');
      const response = await fetch(apiUrl(`/api/patients/${patientId}/deactivate`), {
        method: 'PATCH',
        headers: apiHeaders,
      });

      if (!response.ok) {
        const errorData = await response.json();
        throw new Error(errorData.message || 'Error al dar de baja el paciente');
      }

      // Mostrar mensaje de baja exitosa (en rojo)
      setSuccessType('error');
      setSuccess(true);

      // Notificar al componente padre
      if (onPatientDeactivated) {
        onPatientDeactivated({ id: patientId });
      }

      // Llamar callback de éxito
      if (onSuccess) {
        onSuccess();
      }

    } catch (err) {
      console.error('Error deactivating patient:', err);
      let errorMessage: string;
      if (err instanceof Error) {
        errorMessage = err.message;
      } else {
        errorMessage = 'Error al dar de baja el paciente';
      }
      setError(errorMessage);
      // Don't throw, let the UI handle the error display
    } finally {
      setIsDeactivating(false);
    }
  }, [onPatientDeactivated]);

  const resetState = useCallback(() => {
    setError(null);
    setSuccess(false);
  }, []);

  return {
    // Estados
    isCreating,
    isUpdating,
    isDeactivating,
    error,
    success,
    successType,

    // Operaciones
    createPatient,
    updatePatient,
    deactivatePatient,

    // Utilidades
    resetState
  };
};