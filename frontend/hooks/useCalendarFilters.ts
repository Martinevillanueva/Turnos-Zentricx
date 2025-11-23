import { useState, useEffect } from 'react';

interface UseCalendarFiltersProps {
  initialSpecialty?: string;
  initialDoctor?: string;
  initialDate?: string;
}

export function useCalendarFilters({ initialSpecialty = '', initialDoctor = '', initialDate }: UseCalendarFiltersProps) {
  // Obtener la fecha de hoy como valor por defecto
  const today = new Date().toISOString().split('T')[0];

  const [localSpecialty, setLocalSpecialty] = useState(initialSpecialty);
  const [localDoctor, setLocalDoctor] = useState(initialDoctor);
  const [localDate, setLocalDate] = useState(initialDate || today);

  // Actualizar los estados locales si cambian los props
  useEffect(() => {
    setLocalSpecialty(initialSpecialty || '');
    setLocalDoctor(initialDoctor || '');
    // Siempre actualizar la fecha si se proporciona, o usar hoy como fallback
    setLocalDate(initialDate || today);
  }, [initialSpecialty, initialDoctor, initialDate, today]);

  const updateFilters = (specialty: string, doctor: string, date: string) => {
    setLocalSpecialty(specialty);
    setLocalDoctor(doctor);
    setLocalDate(date);
  };

  return {
    localSpecialty,
    localDoctor,
    localDate,
    setLocalSpecialty,
    setLocalDoctor,
    setLocalDate,
    updateFilters,
  };
}