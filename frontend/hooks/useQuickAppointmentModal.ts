import { useState } from 'react';
import AppointmentService from '@/services/appointmentService';
import { CreateAppointmentRequest } from '@/types/fhir';

export const useQuickAppointmentModal = () => {
  const [isQuickModalOpen, setIsQuickModalOpen] = useState(false);
  const [quickModalDate, setQuickModalDate] = useState("");
  const [quickModalTime, setQuickModalTime] = useState("");
  const [quickModalContext, setQuickModalContext] = useState<{
    selectedSpecialty?: { id: string; name: string };
    selectedDoctor?: { id: string; name: string };
  }>({});
  const [isCreatingAppointment, setIsCreatingAppointment] = useState(false);
  const [modalSuccess, setModalSuccess] = useState(false);
  const [modalError, setModalError] = useState<string | null>(null);

  const openQuickModal = (date: string, time: string, context?: any) => {
    setQuickModalDate(date);
    setQuickModalTime(time);
    setQuickModalContext(context || {});
    setIsQuickModalOpen(true);
    setModalSuccess(false);
    setModalError(null);
  };

  const closeQuickModal = () => {
    setIsQuickModalOpen(false);
    setModalSuccess(false);
    setModalError(null);
  };

  const handleQuickAppointment = async (
    data: {
      patientName: string;
      doctorId: string;
      specialtyId: string;
      description?: string;
      priority?: number;
      appointmentType?: string;
      serviceType?: string;
      patientInstruction?: string;
    },
    onSuccess?: () => void
  ) => {
    try {
      setIsCreatingAppointment(true);
      setModalError(null);

      const [year, month, day] = quickModalDate.split("-").map(Number);
      const [hours, minutes] = quickModalTime.split(":").map(Number);

      const startDateTime = new Date(year, month - 1, day, hours, minutes);
      const endDateTime = new Date(startDateTime.getTime() + 30 * 60000);

      const appointmentData: CreateAppointmentRequest = {
        patientName: data.patientName,
        doctorName: "",
        start: startDateTime.toISOString(),
        end: endDateTime.toISOString(),
        description: data.description || "",
        priority: data.priority,
        appointmentType: data.appointmentType,
        serviceType: data.serviceType,
        patientInstruction: data.patientInstruction,
      };

      await AppointmentService.createAppointmentWithIds(
        appointmentData,
        data.doctorId,
        data.specialtyId
      );
      
      setModalSuccess(true);

      if (onSuccess) {
        await onSuccess();
      }

      setTimeout(() => {
        closeQuickModal();
      }, 2000);
    } catch (err) {
      console.error('Error creating appointment:', err);
      
      let errorMessage = "Error al crear el turno";
      
      if (err instanceof Error) {
        errorMessage = err.message;
      } else if (typeof err === 'object' && err !== null) {
        if ('response' in err && typeof (err as any).response === 'object') {
          const response = (err as any).response;
          if (response && 'data' in response && typeof response.data === 'object' && response.data) {
            if ('message' in response.data && typeof response.data.message === 'string') {
              errorMessage = response.data.message;
            } else if ('error' in response.data && typeof response.data.error === 'string') {
              errorMessage = response.data.error;
            }
          }
        }
        if ('message' in err && typeof (err as any).message === 'string') {
          errorMessage = (err as any).message;
        }
      }
      
      setModalError(errorMessage);
    } finally {
      setIsCreatingAppointment(false);
    }
  };

  return {
    isQuickModalOpen,
    quickModalDate,
    quickModalTime,
    quickModalContext,
    isCreatingAppointment,
    modalSuccess,
    modalError,
    openQuickModal,
    closeQuickModal,
    handleQuickAppointment,
  };
};
