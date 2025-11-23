import { useMemo } from 'react';
import { SimpleAppointment } from '@/types/fhir';

interface UseAppointmentFilteringProps {
  appointments: SimpleAppointment[];
  selectedDate: string;
  filterSpecialty: string;
  filterDoctor: string;
  specialties: Array<{id: string, name: string}>;
  doctors: Array<{id: string, name: string, firstName: string, lastName: string, specialtyId?: string}>;
}

export const useAppointmentFiltering = ({
  appointments,
  selectedDate,
  filterSpecialty,
  filterDoctor,
  specialties,
  doctors
}: UseAppointmentFilteringProps) => {
  // Funciones auxiliares para reducir complejidad
  const matchesDate = (appointment: SimpleAppointment): boolean => {
    const appointmentDate = new Date(appointment.start);
    const [year, month, day] = selectedDate.split('-').map(Number);

    return appointmentDate.getFullYear() === year &&
           appointmentDate.getMonth() === month - 1 &&
           appointmentDate.getDate() === day;
  };

  const matchesSpecialty = (appointment: SimpleAppointment): boolean => {
    if (!filterSpecialty || filterSpecialty === 'all') return true;

    // Si ya estamos filtrando por médico y este turno corresponde a ese médico,
    // permitimos que pase el filtro de especialidad aunque no tenga la info explícita.
    // Esto previene que se oculten turnos válidos del médico seleccionado si falta data de especialidad.
    if (filterDoctor && matchesDoctor(appointment)) {
      return true;
    }

    let appointmentSpecialtyId = '';

    // 1. Intentar obtener ID de specialtyInfo (fuente principal SQLite)
    if (appointment.specialtyInfo?.id) {
      appointmentSpecialtyId = String(appointment.specialtyInfo.id);
    }
    // 2. Intentar obtener ID del objeto specialty si existe
    else if (appointment.specialty && typeof appointment.specialty === 'object' && 'id' in appointment.specialty) {
      appointmentSpecialtyId = String(appointment.specialty.id);
    }
    // 3. Si tenemos un nombre (string), buscar el ID en la lista de especialidades
    else if (typeof appointment.specialty === 'string') {
      const foundSpecialty = specialties.find(s => s.name === appointment.specialty);
      if (foundSpecialty) {
        appointmentSpecialtyId = String(foundSpecialty.id);
      }
    }

    return appointmentSpecialtyId === filterSpecialty;
  };

  const matchesDoctor = (appointment: SimpleAppointment): boolean => {
    if (!filterDoctor || filterDoctor === 'all') return true;

    let appointmentDoctorId = '';

    // 1. Intentar obtener ID del objeto doctor (fuente principal)
    if (appointment.doctor && typeof appointment.doctor === 'object' && 'id' in appointment.doctor) {
      appointmentDoctorId = String(appointment.doctor.id);
    }
    // 2. Si tenemos un nombre, buscar el ID en la lista de doctores
    else if (appointment.doctorName) {
       const foundDoctor = doctors.find(d => {
         const dName = d.firstName && d.lastName ? `${d.firstName} ${d.lastName}` : d.name;
         return dName === appointment.doctorName || d.name === appointment.doctorName;
       });

       if (foundDoctor) {
         appointmentDoctorId = String(foundDoctor.id);
       }
    }
    // 3. Fallback: verificar si la propiedad doctor es el ID mismo
    else if (typeof appointment.doctor === 'string' || typeof appointment.doctor === 'number') {
      appointmentDoctorId = String(appointment.doctor);
    }

    return appointmentDoctorId === filterDoctor;
  };

  // Función para filtrar turnos cancelados duplicados
  const filterCancelledDuplicates = (appointmentsList: SimpleAppointment[]) => {
    const timeSlotMap = new Map<string, SimpleAppointment[]>();

    // Agrupar turnos por fecha y hora
    for (const appointment of appointmentsList) {
      const startTime = new Date(appointment.start || appointment.startTime || '');
      if (Number.isNaN(startTime.getTime())) continue; // Skip invalid dates

      const timeKey = `${startTime.toDateString()}-${startTime.getHours()}:${startTime.getMinutes()}`;

      if (!timeSlotMap.has(timeKey)) {
        timeSlotMap.set(timeKey, []);
      }
      timeSlotMap.get(timeKey)!.push(appointment);
    }

    // Filtrar: si hay turnos cancelados y no cancelados en el mismo horario, remover los cancelados
    const filteredAppointments: SimpleAppointment[] = [];

    for (const [, appointmentsInSlot] of Array.from(timeSlotMap.entries())) {
      const cancelledAppointments = appointmentsInSlot.filter((apt: SimpleAppointment) =>
        apt.status === 'cancelled' || apt.status?.slug === 'cancelled'
      );
      const activeAppointments = appointmentsInSlot.filter((apt: SimpleAppointment) =>
        apt.status !== 'cancelled' && apt.status?.slug !== 'cancelled'
      );

      if (activeAppointments.length > 0) {
        // Si hay turnos activos, solo incluir los activos
        filteredAppointments.push(...activeAppointments);
      } else {
        // Si solo hay turnos cancelados, incluir todos
        filteredAppointments.push(...cancelledAppointments);
      }
    }

    return filteredAppointments;
  };

  // Filtrar citas por fecha, especialidad y médico
  const filteredAppointments = useMemo(() => {
    const basicFiltered = appointments.filter(appointment =>
      matchesDate(appointment) &&
      matchesSpecialty(appointment) &&
      matchesDoctor(appointment)
    );

    // Aplicar filtro de cancelados duplicados
    return filterCancelledDuplicates(basicFiltered);
  }, [appointments, selectedDate, filterSpecialty, filterDoctor, specialties, doctors]);

  return filteredAppointments;
};