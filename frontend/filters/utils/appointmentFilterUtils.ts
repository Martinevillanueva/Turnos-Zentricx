import type { SimpleAppointment, AppointmentStatus } from '@/types/fhir';

/**
 * Extrae el ID de especialidad de un turno, manejando diferentes formatos
 */
export const extractSpecialtyId = (appointment: SimpleAppointment): string => {
  if (appointment.specialtyInfo?.id) {
    return String(appointment.specialtyInfo.id);
  }
  if (appointment.specialty && typeof appointment.specialty === "object" && 'id' in appointment.specialty) {
    return String(appointment.specialty.id);
  }
  if (typeof appointment.specialty === "string" || typeof appointment.specialty === "number") {
    return String(appointment.specialty);
  }
  return "";
};

/**
 * Extrae el ID de doctor de un turno, manejando diferentes formatos
 */
export const extractDoctorId = (appointment: SimpleAppointment): string => {
  if (appointment.doctor && typeof appointment.doctor === "object" && 'id' in appointment.doctor) {
    return String(appointment.doctor.id);
  }
  if (typeof appointment.doctor === "string" || typeof appointment.doctor === "number") {
    return String(appointment.doctor);
  }
  return "";
};

/**
 * Extrae el nombre del paciente de un turno
 */
export const extractPatientName = (appointment: SimpleAppointment): string => {
  if (appointment.patient?.fullName) {
    return appointment.patient.fullName;
  }
  return appointment.patientName || "";
};

/**
 * Compara dos fechas ignorando la hora (solo año, mes, día)
 */
export const isSameDay = (date1: Date, date2: Date): boolean => {
  const d1 = new Date(date1.getFullYear(), date1.getMonth(), date1.getDate());
  const d2 = new Date(date2.getFullYear(), date2.getMonth(), date2.getDate());
  return d1.getTime() === d2.getTime();
};

/**
 * Verifica si un turno está cancelado
 */
export const isAppointmentCancelled = (appointment: SimpleAppointment): boolean => {
  return appointment.status === "cancelled" || appointment.status?.slug === "cancelled";
};

/**
 * Filtra turnos por especialidad
 */
export const filterBySpecialty = (appointments: SimpleAppointment[], specialtyId: string): SimpleAppointment[] => {
  if (!specialtyId) return appointments;
  
  return appointments.filter(appointment => {
    const appointmentSpecialtyId = extractSpecialtyId(appointment);
    return appointmentSpecialtyId === String(specialtyId);
  });
};

/**
 * Filtra turnos por doctor
 */
export const filterByDoctor = (appointments: SimpleAppointment[], doctorId: string): SimpleAppointment[] => {
  if (!doctorId) return appointments;
  
  return appointments.filter(appointment => {
    const appointmentDoctorId = extractDoctorId(appointment);
    return appointmentDoctorId === String(doctorId);
  });
};

/**
 * Filtra turnos por nombre de paciente
 */
export const filterByPatientName = (appointments: SimpleAppointment[], patientName: string): SimpleAppointment[] => {
  if (!patientName.trim()) return appointments;
  
  return appointments.filter(appointment => {
    const name = extractPatientName(appointment).toLowerCase();
    return name.includes(patientName.toLowerCase());
  });
};

/**
 * Filtra turnos por fecha
 */
export const filterByDate = (appointments: SimpleAppointment[], targetDate: Date): SimpleAppointment[] => {
  return appointments.filter(appointment => {
    const appointmentDate = new Date(appointment.start || appointment.startTime || "");
    if (Number.isNaN(appointmentDate.getTime())) return false;
    return isSameDay(appointmentDate, targetDate);
  });
};

/**
 * Filtra turnos por estados
 */
export const filterByStatus = (appointments: SimpleAppointment[], statuses: AppointmentStatus[]): SimpleAppointment[] => {
  if (!statuses || statuses.length === 0) return appointments;
  
  return appointments.filter(appointment => {
    const appointmentStatus = typeof appointment.status === 'object' && 'slug' in appointment.status
      ? appointment.status.slug
      : appointment.status;
    return statuses.includes(appointmentStatus as AppointmentStatus);
  });
};

/**
 * Filtra turnos cancelados
 */
export const filterCancelled = (appointments: SimpleAppointment[], includeCancelled: boolean = false): SimpleAppointment[] => {
  if (includeCancelled) return appointments;
  return appointments.filter(appointment => !isAppointmentCancelled(appointment));
};

/**
 * Filtra turnos cancelados duplicados en el mismo horario.
 * Si hay turnos activos y cancelados en el mismo slot, solo mantiene los activos.
 * Si solo hay turnos cancelados, los mantiene todos.
 */
export const filterCancelledDuplicates = (appointmentsList: SimpleAppointment[]): SimpleAppointment[] => {
  const timeSlotMap = new Map<string, SimpleAppointment[]>();

  // Agrupar turnos por fecha y hora
  for (const appointment of appointmentsList) {
    const startTime = new Date(appointment.start || appointment.startTime || "");
    if (Number.isNaN(startTime.getTime())) continue;

    const timeKey = `${startTime.toDateString()}-${startTime.getHours()}:${startTime.getMinutes()}`;

    if (!timeSlotMap.has(timeKey)) {
      timeSlotMap.set(timeKey, []);
    }
    timeSlotMap.get(timeKey)!.push(appointment);
  }

  const filteredAppointments: SimpleAppointment[] = [];

  for (const [, appointmentsInSlot] of Array.from(timeSlotMap.entries())) {
    const cancelledAppointments = appointmentsInSlot.filter(apt => isAppointmentCancelled(apt));
    const activeAppointments = appointmentsInSlot.filter(apt => !isAppointmentCancelled(apt));

    if (activeAppointments.length > 0) {
      filteredAppointments.push(...activeAppointments);
    } else {
      filteredAppointments.push(...cancelledAppointments);
    }
  }

  return filteredAppointments;
};

/**
 * Ordena turnos por fecha de inicio
 */
export const sortAppointmentsByDate = (appointments: SimpleAppointment[]): SimpleAppointment[] => {
  return [...appointments].sort((a, b) => {
    return new Date(a.start).getTime() - new Date(b.start).getTime();
  });
};
