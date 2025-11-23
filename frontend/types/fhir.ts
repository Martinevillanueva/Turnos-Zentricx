/**
 * Tipos TypeScript basados en la estructura FHIR HL7 R4 para Appointments
 * Simplificados para el proyecto de gestión de turnos
 */

// Tipos base de FHIR
export interface Reference {
  reference?: string;
  display?: string;
}

export interface CodeableConcept {
  coding?: Coding[];
  text?: string;
}

export interface Coding {
  system?: string;
  code?: string;
  display?: string;
}

export interface Period {
  start?: string; // DateTime
  end?: string;   // DateTime
}

export interface Identifier {
  use?: string;
  type?: CodeableConcept;
  system?: string;
  value?: string;
}

// Estados del appointment según FHIR
export type AppointmentStatus = 
  | 'pending' 
  | 'booked' 
  | 'arrived' 
  | 'in-consultation' 
  | 'fulfilled' 
  | 'cancelled' 
  | 'entered-in-error' 
  | 'checked-in' 
  | 'waitlist';

// Tipos de participación
export type ParticipationStatus = 
  | 'accepted' 
  | 'declined' 
  | 'tentative' 
  | 'needs-action';

// Participante del appointment
export interface AppointmentParticipant {
  type?: CodeableConcept[];
  actor?: Reference;
  required?: string;
  status: ParticipationStatus;
  period?: Period;
}

// Estructura principal del Appointment
export interface Appointment {
  resourceType: 'Appointment';
  id?: string;
  identifier?: Identifier[];
  status: AppointmentStatus;
  cancelationReason?: CodeableConcept;
  serviceCategory?: CodeableConcept[];
  serviceType?: CodeableConcept[];
  specialty?: CodeableConcept[];
  appointmentType?: CodeableConcept;
  reasonCode?: CodeableConcept[];
  reasonReference?: Reference[];
  priority?: number;
  description?: string;
  supportingInformation?: Reference[];
  start?: string; // DateTime
  end?: string;   // DateTime
  minutesDuration?: number;
  slot?: Reference[];
  created?: string; // DateTime
  comment?: string;
  patientInstruction?: string;
  basedOn?: Reference[];
  participant: AppointmentParticipant[];
  requestedPeriod?: Period[];
}

// Tipos para el frontend - versión simplificada
export interface SimpleAppointment {
  id?: string;
  status: any; // Compatible con string status y objetos SQLite
  patientName: string;
  doctorName: string;
  specialty?: string | { id: string; name: string; };
  appointmentType?: string;
  start: string; // DateTime
  end: string;   // DateTime
  duration?: number; // en minutos
  description?: string;
  comment?: string;
  created?: string;
  consultationStartTime?: string; // Timestamp cuando inicia la consulta
  
  // Campos adicionales para compatibilidad con SQLite
  reason?: string;
  notes?: string;
  phone?: string;
  email?: string;
  symptoms?: string;
  createdAt?: string;
  
  // Nuevos campos de la estructura SQLite
  startTime?: string;
  endTime?: string;
  
  // Objetos relacionados de SQLite (opcionales para mantener compatibilidad)
  patient?: {
    id: string;
    firstName: string;
    lastName: string;
    fullName?: string;
    documentNumber?: string;
  };
  doctor?: {
    id: string;
    firstName: string;
    lastName: string;
    fullName?: string;
    licenseNumber?: string;
  };
  specialtyInfo?: any;
  statusInfo?: any;
  arrivedAt?: string;
  consultationStartedAt?: string;
  consultationEndedAt?: string;

  // ============ FHIR R4 Compliance Fields ============
  identifier?: string; // External identifier
  priority?: number; // 0-9 priority scale
  minutesDuration?: number; // Duration in minutes
  reasonCode?: string; // ICD-10, SNOMED
  serviceCategory?: string; // Broad categorization
  serviceType?: string; // Specific service
  patientInstruction?: string; // Patient instructions
  slotId?: string; // Time slot reference
}

// Request/Response types para la API
export interface CreateAppointmentRequest {
  patientName: string;
  doctorName: string;
  specialty?: string;
  appointmentType?: string;
  start: string;
  end: string;
  description?: string;
  comment?: string;
  
  // FHIR R4 Compliance Fields
  identifier?: string;
  priority?: number;
  minutesDuration?: number;
  reasonCode?: string;
  serviceCategory?: string;
  serviceType?: string;
  patientInstruction?: string;
  slotId?: string;
}

export interface GetAppointmentsResponse {
  appointments: SimpleAppointment[];
  total: number;
}

export interface CreateAppointmentResponse {
  appointment: SimpleAppointment;
  message: string;
}