import { useState, useEffect, useCallback } from 'react';
import AppointmentService from '@/services/appointmentService';

interface Specialty {
  id: string;
  name: string;
}

export const useSpecialties = () => {
  const [specialties, setSpecialties] = useState<Specialty[]>([]);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const loadSpecialties = useCallback(async () => {
    try {
      setLoading(true);
      setError(null);
      const data = await AppointmentService.getSpecialties();
      setSpecialties(data);
    } catch (err) {
      console.error('Error loading specialties:', err);
      setError(err instanceof Error ? err.message : 'Error al cargar especialidades');
    } finally {
      setLoading(false);
    }
  }, []);

  useEffect(() => {
    loadSpecialties();
  }, [loadSpecialties]);

  const getSpecialtyById = useCallback((id: string) => {
    return specialties.find(specialty => specialty.id === id);
  }, [specialties]);

  return {
    specialties,
    loading,
    error,
    loadSpecialties,
    getSpecialtyById
  };
};