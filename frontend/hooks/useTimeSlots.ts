import { useMemo } from 'react';

export interface TimeSlot {
  hour: number;
  minute: number;
  time: string;
  display: string;
}

export const useTimeSlots = () => {
  const timeSlots = useMemo((): TimeSlot[] => {
    const slots: TimeSlot[] = [];
    for (let hour = 8; hour <= 20; hour++) {
      for (let minute = 0; minute < 60; minute += 30) {
        if (hour === 20 && minute > 0) break; // Terminar a las 20:00

        const time = `${hour.toString().padStart(2, '0')}:${minute.toString().padStart(2, '0')}`;
        slots.push({
          hour,
          minute,
          time,
          display: time
        });
      }
    }
    return slots;
  }, []);

  return timeSlots;
};