import { useState, useCallback, useMemo } from 'react';
import { SimpleAppointment } from '@/types/fhir';

interface UseAppointmentFiltersOptions {
  appointments: SimpleAppointment[];
}

export const useAppointmentFilters = ({ appointments }: UseAppointmentFiltersOptions) => {
  const [filterSpecialty, setFilterSpecialty] = useState<string>("");
  const [filterDoctor, setFilterDoctor] = useState<string>("");
  const [filterStatus, setFilterStatus] = useState<string>("");
  const [showCancelled, setShowCancelled] = useState<boolean>(true);

  // Extraer opciones dinámicas de filtros
  const filterOptions = useMemo(() => {
    const specialties = new Map();
    const doctors = new Map();

    appointments.forEach(appointment => {
      if (appointment.specialty && typeof appointment.specialty === 'object') {
        specialties.set(appointment.specialty.id, {
          id: appointment.specialty.id,
          name: appointment.specialty.name
        });
      }

      // Si hay un filtro de especialidad activo, solo agregar doctores de esa especialidad
      if (appointment.doctor && typeof appointment.doctor === 'object') {
        const doctorSpecialtyId = appointment.specialty && typeof appointment.specialty === 'object' 
          ? appointment.specialty.id 
          : null;
        
        // Solo agregar el doctor si no hay filtro de especialidad o si el doctor pertenece a la especialidad filtrada
        if (!filterSpecialty || doctorSpecialtyId === filterSpecialty) {
          doctors.set(appointment.doctor.id, {
            id: appointment.doctor.id,
            name: `${appointment.doctor.firstName} ${appointment.doctor.lastName}`,
            specialtyId: doctorSpecialtyId
          });
        }
      }
    });

    return {
      specialties: Array.from(specialties.values()),
      doctors: Array.from(doctors.values())
    };
  }, [appointments, filterSpecialty]);

  // Aplicar filtros
  const filteredAppointments = useMemo(() => {
    let filtered = [...appointments];

    if (filterSpecialty) {
      filtered = filtered.filter(app =>
        app.specialty && typeof app.specialty === 'object' && app.specialty.id === filterSpecialty
      );
    }

    if (filterDoctor) {
      filtered = filtered.filter(app =>
        app.doctor && typeof app.doctor === 'object' && app.doctor.id === filterDoctor
      );
    }

    if (filterStatus) {
      filtered = filtered.filter(app => app.status === filterStatus);
    }

    if (!showCancelled) {
      filtered = filtered.filter(app => app.status !== 'cancelled');
    }

    // Ordenar por fecha descendente
    filtered.sort((a, b) => new Date(b.start || b.startTime || '').getTime() - new Date(a.start || a.startTime || '').getTime());

    return filtered;
  }, [appointments, filterSpecialty, filterDoctor, filterStatus, showCancelled]);

  const clearFilters = useCallback(() => {
    setFilterSpecialty("");
    setFilterDoctor("");
    setFilterStatus("");
    setShowCancelled(true);
  }, []);

  return {
    // Estados de filtros
    filterSpecialty,
    filterDoctor,
    filterStatus,
    showCancelled,

    // Setters
    setFilterSpecialty,
    setFilterDoctor,
    setFilterStatus,
    setShowCancelled,

    // Datos calculados
    filteredAppointments,
    filterOptions,

    // Utilidades
    clearFilters
  };
};