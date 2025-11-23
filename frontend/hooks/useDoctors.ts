import { useState, useEffect, useCallback } from 'react';
import AppointmentService from '@/services/appointmentService';

interface Doctor {
  id: string;
  firstName: string;
  lastName: string;
  fullName?: string;
  specialty?: {
    id: string;
    name: string;
  };
  specialtyId?: string;
}

export const useDoctors = (preSelectedDoctorId?: string) => {
  const [doctors, setDoctors] = useState<Doctor[]>([]);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [selectedDoctorId, setSelectedDoctorId] = useState(preSelectedDoctorId || '');

  const loadDoctors = useCallback(async () => {
    try {
      setLoading(true);
      setError(null);
      const data = await AppointmentService.getDoctors();
      setDoctors(data);
    } catch (err) {
      console.error('Error loading doctors:', err);
      setError(err instanceof Error ? err.message : 'Error al cargar médicos');
    } finally {
      setLoading(false);
    }
  }, []);

  useEffect(() => {
    loadDoctors();
  }, [loadDoctors]);

  useEffect(() => {
    if (preSelectedDoctorId) {
      setSelectedDoctorId(preSelectedDoctorId);
    }
  }, [preSelectedDoctorId]);

  const getDoctorById = useCallback((id: string) => {
    return doctors.find(doctor => doctor.id === id);
  }, [doctors]);

  const getDoctorSpecialty = useCallback((doctorId: string) => {
    const doctor = getDoctorById(doctorId);
    return doctor?.specialty || null;
  }, [getDoctorById]);

  const selectedDoctor = getDoctorById(selectedDoctorId);

  return {
    doctors,
    loading,
    error,
    selectedDoctorId,
    setSelectedDoctorId,
    selectedDoctor,
    loadDoctors,
    getDoctorById,
    getDoctorSpecialty
  };
};