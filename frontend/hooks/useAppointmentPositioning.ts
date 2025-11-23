import { useCallback } from 'react';
import { SimpleAppointment } from '@/types/fhir';

export interface AppointmentPosition {
  top: number;
  height: number;
}

export const useAppointmentPositioning = () => {
  const getAppointmentPosition = useCallback((appointment: SimpleAppointment): AppointmentPosition => {
    const startTime = new Date(appointment.start);

    const startHour = startTime.getHours();
    const startMinute = startTime.getMinutes();

    // Calcular posición desde las 8:00 usando minutos exactos
    const startMinutesFromEight = (startHour - 8) * 60 + startMinute;

    // Cada minuto = 1px, pero todos los turnos son de 30 minutos = 30px de altura
    const top = startMinutesFromEight;
    const height = 30; // Altura fija de 30px para turnos de 30 minutos

    return { top, height };
  }, []);

  return { getAppointmentPosition };
};