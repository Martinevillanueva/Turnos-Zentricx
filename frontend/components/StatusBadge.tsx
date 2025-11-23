import React from 'react';
import { AppointmentStatus } from '@/types/fhir';

const statusColors: Record<AppointmentStatus, string> = {
  'pending': 'bg-yellow-100 text-yellow-800', 
  'booked': 'bg-blue-100 text-blue-800',
  'arrived': 'bg-purple-200 text-purple-900',
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

interface StatusBadgeProps {
  status: AppointmentStatus | string;
  label?: string;
}

export default function StatusBadge({ status, label }: StatusBadgeProps) {
  const colorClass = statusColors[status as AppointmentStatus] || statusColors['pending'];
  const text = label || statusLabels[status as AppointmentStatus] || 'Pendiente';
  return (
    <span className={`inline-flex items-center px-2 py-1 rounded-full text-xs font-medium ${colorClass}`}>
      {text}
    </span>
  );
}
