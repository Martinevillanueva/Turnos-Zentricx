import { useState, useEffect, useCallback } from 'react';
import { useAppointmentFormatting } from './useAppointmentFormatting';
import AppointmentService from '@/services/appointmentService';

interface UseQuickAppointmentFormOptions {
  selectedDate: string;
  selectedTime: string;
  preSelectedSpecialty?: { id: string; name: string };
  preSelectedDoctor?: { id: string; name: string };
  doctors: any[];
  selectedDoctorId: string;
  onSubmit: (data: {
    patientName: string;
    doctorId: string;
    specialtyId: string;
    description?: string;
    priority?: number;
    appointmentType?: string;
    serviceType?: string;
    patientInstruction?: string;
  }) => void;
  patientName: string;
  selectedPatient: any;
  description: string;
  priority: number;
  appointmentType: string;
  serviceType: string;
  patientInstruction: string;
}

export const useQuickAppointmentForm = ({
  selectedDate,
  selectedTime,
  preSelectedSpecialty,
  preSelectedDoctor,
  doctors,
  selectedDoctorId,
  onSubmit,
  patientName,
  selectedPatient,
  description,
  priority,
  appointmentType,
  serviceType,
  patientInstruction
}: UseQuickAppointmentFormOptions) => {
  const [selectedSpecialtyId, setSelectedSpecialtyId] = useState(preSelectedSpecialty?.id || '');

  const { formatTime } = useAppointmentFormatting();

  // Actualizar especialidad cuando cambia el médico seleccionado
  useEffect(() => {
    if (selectedDoctorId && !preSelectedSpecialty) {
      const selectedDoctor = doctors.find(doctor => doctor.id === selectedDoctorId);
      if (selectedDoctor?.specialty) {
        setSelectedSpecialtyId(selectedDoctor.specialty.id);
      } else if (selectedDoctor?.specialtyId) {
        setSelectedSpecialtyId(selectedDoctor.specialtyId);
      }
    }
  }, [selectedDoctorId, doctors, preSelectedSpecialty]);

  const handleSubmit = useCallback(async () => {
    if (!selectedPatient) {
      alert('Debe seleccionar un paciente existente de la lista de sugerencias');
      return;
    }

    const finalDoctorId = preSelectedDoctor?.id || selectedDoctorId;
    let finalSpecialtyId = preSelectedSpecialty?.id || selectedSpecialtyId;

    if (!finalDoctorId) {
      alert('Debe seleccionar un médico');
      return;
    }

    // Si no hay especialidad seleccionada, intentar obtenerla del médico
    if (!finalSpecialtyId) {
      const selectedDoctor = doctors.find(doctor => doctor.id === finalDoctorId);
      if (selectedDoctor?.specialty) {
        finalSpecialtyId = selectedDoctor.specialty.id;
      } else if (selectedDoctor?.specialtyId) {
        finalSpecialtyId = selectedDoctor.specialtyId;
      }
    }

    if (!finalSpecialtyId) {
      alert('No se puede determinar la especialidad del médico seleccionado');
      return;
    }

    // Validar conflictos de horario antes de crear el turno
    try {
      const startDateTime = new Date(selectedDate + 'T' + selectedTime + ':00');
      const endDateTime = new Date(startDateTime.getTime() + 30 * 60000); // +30 minutos

      const conflictCheck = await AppointmentService.checkAppointmentConflicts(
        finalDoctorId,
        finalSpecialtyId,
        startDateTime,
        endDateTime
      );

      if (conflictCheck.hasConflict) {
        const conflictingTime = new Date(conflictCheck.conflictingAppointment!.start).toLocaleTimeString('es-ES', {
          hour: '2-digit',
          minute: '2-digit'
        });
        alert(`❌ Conflicto de horario: El médico ya tiene un turno programado a las ${conflictingTime} para esta especialidad.`);
        return;
      }
    } catch (error) {
      console.error('Error checking conflicts:', error);
      // Continuar con la creación si hay error en la validación
    }

    onSubmit({
      patientName: patientName.trim(),
      doctorId: finalDoctorId,
      specialtyId: finalSpecialtyId,
      description: description.trim() || undefined,
      priority: priority || 5,
      appointmentType: appointmentType || undefined,
      serviceType: serviceType || undefined,
      patientInstruction: patientInstruction?.trim() || undefined
    });
  }, [selectedPatient, preSelectedDoctor, selectedDoctorId, preSelectedSpecialty, selectedSpecialtyId, doctors, onSubmit, patientName, selectedDate, selectedTime, description, priority, appointmentType, serviceType, patientInstruction]);

  const formatDateTime = useCallback(() => {
    const [year, month, day] = selectedDate.split('-').map(Number);
    const date = new Date(year, month - 1, day);
    const dateStr = date.toLocaleDateString('es-ES', {
      weekday: 'long',
      year: 'numeric',
      month: 'long',
      day: 'numeric'
    });

    const [hours, minutes] = selectedTime.split(':').map(Number);
    const startTime = new Date(year, month - 1, day, hours, minutes);
    const endTime = new Date(startTime.getTime() + 30 * 60000);
    const endTimeStr = formatTime(endTime);

    return {
      date: dateStr,
      timeRange: `${selectedTime} - ${endTimeStr}`
    };
  }, [selectedDate, selectedTime, formatTime]);

  return {
    selectedSpecialtyId,
    setSelectedSpecialtyId,
    handleSubmit,
    formatDateTime
  };
};