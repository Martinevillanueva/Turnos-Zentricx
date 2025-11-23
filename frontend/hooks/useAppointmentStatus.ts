import { useCallback } from 'react';
import { SimpleAppointment, AppointmentStatus } from '@/types/fhir';

export const useAppointmentStatus = () => {
  const getStatusColor = useCallback((appointment: SimpleAppointment): string => {
    const status = appointment.status?.slug || appointment.status || 'pending';

    switch (status) {
      case 'pending':
        return 'bg-yellow-100 border-yellow-300 text-yellow-800 border-l-yellow-500';
      case 'booked':
        return 'bg-blue-100 border-blue-300 text-blue-800 border-l-blue-500';
      case 'arrived':
        return 'bg-green-100 border-green-300 text-green-800 border-l-green-500';
      case 'in-consultation':
        return 'bg-orange-100 border-orange-300 text-orange-800 border-l-orange-500';
      case 'fulfilled':
        return 'bg-purple-100 border-purple-300 text-purple-800 border-l-purple-500';
      case 'cancelled':
        return 'bg-red-100 border-red-300 text-red-800 border-l-red-500';
      default:
        return 'bg-gray-100 border-gray-300 text-gray-800 border-l-gray-500';
    }
  }, []);

  const getStatusActions = useCallback((appointment: SimpleAppointment): string[] => {
    const status = appointment.status?.slug || appointment.status || 'pending';
    switch (status) {
      case 'pending':
        return ['booked'];
      case 'booked':
        return ['arrived'];
      case 'arrived':
        return ['in-consultation', 'fulfilled'];
      case 'in-consultation':
        return ['fulfilled'];
      case 'cancelled':
        return []; // No mostrar botones de cambio de estado para turnos cancelados
      case 'fulfilled':
        return [];
      default:
        return [];
    }
  }, []);

  const getStatusColorClass = useCallback((statusSlug: string): string => {
    switch (statusSlug) {
      case 'cancelled':
        return 'bg-red-100 text-red-800';
      case 'fulfilled':
        return 'bg-purple-100 text-purple-800';
      case 'in-consultation':
        return 'bg-orange-100 text-orange-800';
      case 'arrived':
        return 'bg-green-100 text-green-800';
      case 'booked':
        return 'bg-blue-100 text-blue-800';
      case 'pending':
        return 'bg-yellow-100 text-yellow-800';
      case 'noshow':
        return 'bg-gray-100 text-gray-600';
      default:
        return 'bg-gray-100 text-gray-800';
    }
  }, []);

  const getButtonStyle = useCallback((status: string): string => {
    if (status === 'cancelled') {
      return 'border-red-300 text-red-700 hover:bg-red-50';
    }
    if (status === 'in-consultation') {
      return 'border-orange-300 text-orange-700 hover:bg-orange-50';
    }
    return 'border-green-300 text-green-700 hover:bg-green-50';
  }, []);

  const formatAppointmentTime = useCallback((appointment: SimpleAppointment) => {
    const startTime = new Date(appointment.start);
    const endTime = new Date(appointment.end);
    
    return `${startTime.toLocaleTimeString('es-ES', { hour: '2-digit', minute: '2-digit' })} - ${endTime.toLocaleTimeString('es-ES', { hour: '2-digit', minute: '2-digit' })}`;
  }, []);

  const statusLabels: Record<string, string> = {
    'pending': 'Pendiente',
    'booked': 'Confirmado',
    'arrived': 'Recepcionado',
    'in-consultation': 'En consulta',
    'fulfilled': 'Completado',
    'cancelled': 'Cancelado'
  };

  return {
    getStatusColor,
    getStatusActions,
    getStatusColorClass,
    getButtonStyle,
    formatAppointmentTime,
    statusLabels
  };
};