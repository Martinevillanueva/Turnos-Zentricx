import { SimpleAppointment } from './fhir';

// Nuevos tipos para la API SQLite
export interface SqliteDoctor {
  id: string;
  firstName: string;
  lastName: string;
  licenseNumber: string;
  phone?: string;
  email?: string;
  isActive: boolean;
  fullName: string; // Virtual field
}

export interface SqlitePatient {
  id: string;
  firstName: string;
  lastName: string;
  documentNumber: string;
  phone?: string;
  email?: string;
  birthDate?: string;
  gender?: string;
  address?: string;
  emergencyContact?: string;
  emergencyPhone?: string;
  medicalNotes?: string;
  isActive: boolean;
  fullName: string; // Virtual field
  age?: number; // Virtual field
}

export interface SqliteSpecialty {
  id: string;
  name: string;
  description?: string;
  color: string;
  defaultDuration: number;
  isActive: boolean;
}

export interface SqliteAppointmentStatus {
  id: string;
  name: string;
  slug: string;
  label: string;
  color: string;
  borderColor: string;
  bgColor?: string;
  isFinal: boolean;
  sortOrder: number;
}

export interface SqliteAppointment {
  id: string;
  patient: SqlitePatient;
  doctor: SqliteDoctor;
  specialty: SqliteSpecialty;
  status: SqliteAppointmentStatus;
  startTime: string;
  endTime: string;
  duration: number;
  reason?: string;
  notes?: string;
  symptoms?: string;
  diagnosis?: string;
  treatment?: string;
  arrivedAt?: string;
  consultationStartedAt?: string;
  consultationEndedAt?: string;
  contactPhone?: string;
  contactEmail?: string;
  reminderSent: boolean;
  reminderSentAt?: string;
  cancelledAt?: string;
  cancellationReason?: string;
  cancelledBy?: string;
  createdAt: string;
  updatedAt: string;
  createdBy?: string;
  updatedBy?: string;
  
  // FHIR R4 Compliance Fields
  identifier?: string;
  priority?: number;
  minutesDuration?: number;
  appointmentType?: string;
  reasonCode?: string;
  serviceCategory?: string;
  serviceType?: string;
  patientInstruction?: string;
  slotId?: string;
}

export interface CreateAppointmentSqliteDto {
  patientId?: string;
  doctorId: string;
  specialtyId: string;
  startTime: Date | string;
  duration?: number;
  reason?: string;
  contactPhone?: string;
  contactEmail?: string;
  patientData?: {
    firstName: string;
    lastName: string;
    documentNumber: string;
    phone?: string;
    email?: string;
    birthDate?: Date | string;
    gender?: string;
  };
  
  // FHIR R4 Compliance Fields
  identifier?: string;
  priority?: number;
  minutesDuration?: number;
  appointmentType?: string;
  reasonCode?: string;
  serviceCategory?: string;
  serviceType?: string;
  patientInstruction?: string;
  slotId?: string;
}

export interface UpdateAppointmentStatusSqliteDto {
  statusId: string;
  notes?: string;
  cancellationReason?: string;
  updatedBy?: string;
}

// Función para convertir de SQLite a formato FHIR compatible
export function sqliteAppointmentToFhir(sqliteAppointment: SqliteAppointment): SimpleAppointment {
  try {
    return {
      id: sqliteAppointment.id,
      start: sqliteAppointment.startTime,
      end: sqliteAppointment.endTime,
      duration: sqliteAppointment.duration,
      patientName: sqliteAppointment.patient?.fullName || 'Paciente sin nombre',
      doctorName: sqliteAppointment.doctor?.fullName || 'Doctor sin nombre',
      specialty: sqliteAppointment.specialty?.name || 'Sin especialidad',
      status: sqliteAppointment.status?.slug as any, // Mapear slug al enum FHIR
      reason: sqliteAppointment.reason,
      notes: sqliteAppointment.notes,
      phone: sqliteAppointment.contactPhone || sqliteAppointment.patient?.phone,
      email: sqliteAppointment.contactEmail || sqliteAppointment.patient?.email,
      // Campos adicionales de SQLite que no están en FHIR
      patient: sqliteAppointment.patient,
      doctor: sqliteAppointment.doctor,
      specialtyInfo: sqliteAppointment.specialty,
      statusInfo: sqliteAppointment.status,
      arrivedAt: sqliteAppointment.arrivedAt,
      consultationStartedAt: sqliteAppointment.consultationStartedAt,
      consultationEndedAt: sqliteAppointment.consultationEndedAt,
      
      // FHIR R4 Compliance Fields
      identifier: sqliteAppointment.identifier,
      priority: sqliteAppointment.priority,
      minutesDuration: sqliteAppointment.minutesDuration,
      appointmentType: sqliteAppointment.appointmentType,
      reasonCode: sqliteAppointment.reasonCode,
      serviceCategory: sqliteAppointment.serviceCategory,
      serviceType: sqliteAppointment.serviceType,
      patientInstruction: sqliteAppointment.patientInstruction,
      slotId: sqliteAppointment.slotId
    };
  } catch (error) {
    console.error('Error transforming sqliteAppointment:', error);
    console.error('sqliteAppointment data:', sqliteAppointment);
    throw new Error('Error al transformar los datos del turno');
  }
}