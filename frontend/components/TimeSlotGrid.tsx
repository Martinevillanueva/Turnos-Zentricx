import React from 'react';
import { TimeSlot } from '@/hooks/useTimeSlots';

interface TimeSlotGridProps {
  timeSlots: TimeSlot[];
}

export default function TimeSlotGrid({ timeSlots }: Readonly<TimeSlotGridProps>) {
  return (
    <div className="w-20 border-r border-gray-200 bg-gray-50">
      <div className="bg-gray-100 border-b border-gray-200 text-xs font-medium text-gray-700 text-center p-2" style={{ height: '32px' }}>
        Hora
      </div>
      {timeSlots.map(slot => (
        <div
          key={slot.time}
          className="text-xs text-gray-600 text-center flex items-center justify-center border-b border-gray-100"
          style={{ height: '30px' }}
        >
          {slot.display}
        </div>
      ))}
    </div>
  );
}