import { useState } from 'react';

export interface QuickAppointmentContext {
  selectedSpecialty?: { id: string; name: string };
  selectedDoctor?: { id: string; name: string };
}

export const useQuickAppointment = () => {
  const [isQuickModalOpen, setIsQuickModalOpen] = useState(false);
  const [quickModalDate, setQuickModalDate] = useState('');
  const [quickModalTime, setQuickModalTime] = useState('');
  const [quickModalContext, setQuickModalContext] = useState<QuickAppointmentContext>({});
  const [isCreatingAppointment, setIsCreatingAppointment] = useState(false);

  const openQuickModal = (date: string, time: string, context?: QuickAppointmentContext) => {
    setQuickModalDate(date);
    setQuickModalTime(time);
    setQuickModalContext(context || {});
    setIsQuickModalOpen(true);
  };

  const closeQuickModal = () => {
    setIsQuickModalOpen(false);
    setQuickModalDate('');
    setQuickModalTime('');
    setQuickModalContext({});
    setIsCreatingAppointment(false);
  };

  const handleSubmit = async (data: {
    patientName: string;
    doctorId: string;
    specialtyId: string;
    description?: string;
  }) => {
  };

  return {
    isQuickModalOpen,
    quickModalDate,
    quickModalTime,
    quickModalContext,
    isCreatingAppointment,
    setIsCreatingAppointment,
    openQuickModal,
    closeQuickModal,
    handleSubmit
  };
};