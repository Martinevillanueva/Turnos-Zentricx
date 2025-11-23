import { AppointmentStatus } from '@/types/fhir';

export function useAppointmentFormatting() {
  const statusColors: Record<AppointmentStatus, string> = {
    'pending': 'bg-yellow-100 text-yellow-800',
    'booked': 'bg-blue-100 text-blue-800',
    'arrived': 'bg-purple-100 text-purple-800',
    'in-consultation': 'bg-orange-100 text-orange-800 animate-pulse',
    'fulfilled': 'bg-emerald-100 text-emerald-800',
    'cancelled': 'bg-red-100 text-red-800',
    'entered-in-error': 'bg-red-100 text-red-800',
    'checked-in': 'bg-indigo-100 text-indigo-800',
    'waitlist': 'bg-purple-100 text-purple-800'
  };

  const statusLabels: Record<AppointmentStatus, string> = {
    'pending': 'Pendiente',
    'booked': 'Confirmado',
    'arrived': 'Recepcionado',
    'in-consultation': 'En consulta',
    'fulfilled': 'Completado',
    'cancelled': 'Cancelado',
    'entered-in-error': 'Error de registro',
    'checked-in': 'Check-in realizado',
    'waitlist': 'Lista de espera'
  };

  const formatTime = (date: Date) => {
    return date.toLocaleTimeString('es-ES', {
      hour: '2-digit',
      minute: '2-digit'
    });
  };

  const formatTimeWithoutSeconds = (dateString: string) => {
    const date = new Date(dateString);
    return date.toLocaleTimeString('es-ES', {
      hour: '2-digit',
      minute: '2-digit'
    });
  };

  const formatDateTimeWithoutSeconds = (date: Date) => {
    // Formatear fecha en español: "22 de noviembre de 2025, 14:30"
    const day = date.getDate();
    const months = ['enero', 'febrero', 'marzo', 'abril', 'mayo', 'junio', 
                    'julio', 'agosto', 'septiembre', 'octubre', 'noviembre', 'diciembre'];
    const month = months[date.getMonth()];
    const year = date.getFullYear();
    const timeStr = date.toLocaleTimeString('es-ES', {
      hour: '2-digit',
      minute: '2-digit'
    });
    return `${day} de ${month} de ${year}, ${timeStr}`;
  };

  const formatFullDate = (date: Date) => {
    // Formatear fecha completa en español: "viernes, 22 de noviembre de 2025"
    const weekdays = ['domingo', 'lunes', 'martes', 'miércoles', 'jueves', 'viernes', 'sábado'];
    const months = ['enero', 'febrero', 'marzo', 'abril', 'mayo', 'junio', 
                    'julio', 'agosto', 'septiembre', 'octubre', 'noviembre', 'diciembre'];
    const weekday = weekdays[date.getDay()];
    const day = date.getDate();
    const month = months[date.getMonth()];
    const year = date.getFullYear();
    return `${weekday}, ${day} de ${month} de ${year}`;
  };

  const getLeftBarColor = (status: AppointmentStatus) => {
    switch (status) {
      case 'pending': return 'bg-yellow-400';
      case 'booked': return 'bg-blue-600';
      case 'arrived': return 'bg-green-600';
      case 'in-consultation': return 'bg-orange-400';
      case 'fulfilled': return 'bg-emerald-600';
      case 'cancelled': return 'bg-red-600';
      case 'entered-in-error': return 'bg-gray-600';
      case 'checked-in': return 'bg-orange-600';
      case 'waitlist': return 'bg-indigo-600';
      default: return 'bg-red-500';
    }
  };

  const getButtonLabel = (status: AppointmentStatus) => {
    switch (status) {
      case 'booked': return 'Confirmar';
      case 'arrived': return 'Recepcionar';
      case 'in-consultation': return 'Consulta';
      case 'fulfilled': return 'Finalizar';
      case 'cancelled': return 'Cancelar';
      default: return statusLabels[status];
    }
  };

  const getButtonStyle = (status: AppointmentStatus) => {
    if (status === 'cancelled') {
      return 'border-red-300 text-red-700 hover:bg-red-50';
    }
    if (status === 'in-consultation') {
      return 'border-orange-300 text-orange-700 hover:bg-orange-50';
    }
    return 'border-green-300 text-green-700 hover:bg-green-50';
  };

  const getExpandedButtonStyle = (status: AppointmentStatus) => {
    if (status === 'cancelled') {
      return 'border-red-300 text-red-700 hover:bg-red-50 hover:border-red-400';
    }
    if (status === 'in-consultation') {
      return 'border-orange-300 text-orange-700 hover:bg-orange-50 hover:border-orange-400';
    }
    return 'border-green-300 text-green-700 hover:bg-green-50 hover:border-green-400';
  };

  const getStatusActions = (status: AppointmentStatus): AppointmentStatus[] => {
    switch (status) {
      case 'pending':
        return ['booked'];
      case 'booked':
        return ['arrived'];
      case 'arrived':
        return ['in-consultation', 'fulfilled'];
      case 'in-consultation':
        return ['fulfilled'];
      case 'fulfilled':
      case 'cancelled':
        return []; // No mostrar botones de cambio de estado para turnos finalizados
      default:
        return [];
    }
  };

  const translateAppointmentType = (type: string): string => {
    const translations: Record<string, string> = {
      'routine': 'Consulta Rutinaria',
      'checkup': 'Revisión Preventiva',
      'follow-up': 'Seguimiento',
      'emergency': 'Emergencia',
      'consultation': 'Consulta',
      'walkin': 'Sin Cita Previa'
    };
    return translations[type] || type;
  };

  return {
    statusColors,
    statusLabels,
    formatTime,
    formatTimeWithoutSeconds,
    formatDateTimeWithoutSeconds,
    formatFullDate,
    getLeftBarColor,
    getButtonLabel,
    getButtonStyle,
    getExpandedButtonStyle,
    getStatusActions,
    translateAppointmentType,
  };
}