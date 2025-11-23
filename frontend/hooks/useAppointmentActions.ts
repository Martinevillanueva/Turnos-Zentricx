import { useState } from 'react';
import { AppointmentStatus } from '@/types/fhir';

interface UseAppointmentActionsProps {
  appointmentId: string | undefined;
  onStatusChange?: (id: string, status: AppointmentStatus) => void;
}

export function useAppointmentActions({ appointmentId, onStatusChange }: UseAppointmentActionsProps) {
  const [showCancelConfirm, setShowCancelConfirm] = useState(false);

  const handleStatusChange = (status: AppointmentStatus) => {
    if (appointmentId && onStatusChange) {
      onStatusChange(appointmentId, status);
    }
  };

  const handleCancel = () => {
    setShowCancelConfirm(true);
  };

  const confirmCancel = () => {
    handleStatusChange('cancelled' as AppointmentStatus);
    setShowCancelConfirm(false);
  };

  const cancelCancel = () => {
    setShowCancelConfirm(false);
  };

  return {
    showCancelConfirm,
    handleCancel,
    confirmCancel,
    cancelCancel,
    handleStatusChange,
  };
}