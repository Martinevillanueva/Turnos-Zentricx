import { useState, useEffect, useRef } from 'react';
import { AppointmentStatus } from '@/types/fhir';

interface Doctor {
  id: string;
  specialtyId?: string;
  specialty?: any;
}

interface UseFiltersOptions {
  doctors: Doctor[];
  onFilterChange?: () => void;
}

/**
 * Hook para gestionar filtros de la vista de lista
 */
export const useListFilters = ({ doctors, onFilterChange }: UseFiltersOptions) => {
  const [specialty, setSpecialty] = useState<string>("");
  const [doctor, setDoctor] = useState<string>("");
  const [patientName, setPatientName] = useState<string>("");
  const [statusFilter, setStatusFilter] = useState<AppointmentStatus[]>([]);
  
  // Filtros FHIR
  const [fhirAppointmentType, setFhirAppointmentType] = useState<string>("");
  const [fhirPriority, setFhirPriority] = useState<string>("");

  const prevSpecialtyRef = useRef(specialty);

  // Wrapper para setSpecialty que también limpia el doctor cuando sea necesario
  const handleSetSpecialty = (newSpecialty: string) => {
    // Si se selecciona "Todas las especialidades", limpiar el médico inmediatamente
    if (newSpecialty === "" && doctor !== "") {
      setDoctor("");
    }
    setSpecialty(newSpecialty);
  };

  // Limpiar médico cuando cambia especialidad (para otros casos)
  useEffect(() => {
    const prevSpecialty = prevSpecialtyRef.current;
    prevSpecialtyRef.current = specialty;
    
    // Si cambia la especialidad y hay un médico seleccionado
    if (prevSpecialty !== undefined && specialty !== prevSpecialty && doctor) {
      // Si hay una especialidad seleccionada, verificar si el médico pertenece a ella
      if (specialty && specialty !== "") {
        const doctorBelongsToNewSpecialty = doctors.some(d => 
          String(d.id) === String(doctor) && 
          String(d.specialtyId || d.specialty?.id || d.specialty) === String(specialty)
        );
        if (!doctorBelongsToNewSpecialty) {
          setDoctor("");
        }
      }
    }
  }, [specialty, doctor, doctors]);

  // Notificar cambios de filtros
  useEffect(() => {
    if (onFilterChange) {
      onFilterChange();
    }
  }, [specialty, doctor, statusFilter, fhirAppointmentType, fhirPriority]);

  const clearFilters = () => {
    setSpecialty("");
    setDoctor("");
    setPatientName("");
    setStatusFilter([]);
    setFhirAppointmentType("");
    setFhirPriority("");
  };

  return {
    specialty,
    setSpecialty: handleSetSpecialty,
    doctor,
    setDoctor,
    patientName,
    setPatientName,
    statusFilter,
    setStatusFilter,
    fhirAppointmentType,
    setFhirAppointmentType,
    fhirPriority,
    setFhirPriority,
    clearFilters,
    hasFilters: !!(specialty || doctor || patientName || statusFilter.length > 0 || fhirAppointmentType || fhirPriority),
  };
};

/**
 * Hook para gestionar filtros de la vista de calendario
 */
export const useCalendarFilters = ({ doctors, onFilterChange }: UseFiltersOptions) => {
  const [specialty, setSpecialty] = useState<string>("");
  const [doctor, setDoctor] = useState<string>("");
  const [selectedDate, setSelectedDate] = useState<string>(
    new Date().toISOString().split("T")[0]
  );

  const prevSpecialtyRef = useRef(specialty);

  // Limpiar médico cuando cambia especialidad
  useEffect(() => {
    const prevSpecialty = prevSpecialtyRef.current;
    prevSpecialtyRef.current = specialty;
    
    // Si cambia la especialidad, limpiar el médico
    if (prevSpecialty !== undefined && specialty !== prevSpecialty && doctor) {
      // Si se selecciona "Todas las especialidades" (specialty === ""), limpiar médico
      if (specialty === "") {
        setDoctor("");
      } 
      // Si hay una especialidad seleccionada, verificar si el médico pertenece a ella
      else if (specialty) {
        const doctorBelongsToNewSpecialty = doctors.some(d => 
          String(d.id) === String(doctor) && 
          String(d.specialtyId || d.specialty?.id || d.specialty) === String(specialty)
        );
        if (!doctorBelongsToNewSpecialty) {
          setDoctor("");
        }
      }
    }
  }, [specialty, doctor, doctors]);

  // No notificar cambios automáticamente en calendar filters
  // La recarga se maneja manualmente desde los componentes

  return {
    specialty,
    setSpecialty,
    doctor,
    setDoctor,
    selectedDate,
    setSelectedDate,
  };
};
