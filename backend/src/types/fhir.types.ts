/**
 * Tipos TypeScript basados en la estructura FHIR HL7 R4 para Appointments
 * Versión backend - Nest.js
 */

import { IsString, IsOptional, IsEnum, IsDateString } from 'class-validator';

// Estados del appointment según FHIR
export enum AppointmentStatus {
  PENDING = 'pending', 
  BOOKED = 'booked',
  ARRIVED = 'arrived',
  IN_CONSULTATION = 'in-consultation',
  FULFILLED = 'fulfilled',
  CANCELLED = 'cancelled',
  NOSHOW = 'noshow',
  ENTERED_IN_ERROR = 'entered-in-error',
  CHECKED_IN = 'checked-in',
  WAITLIST = 'waitlist'
}

// Estados de participación
export enum ParticipationStatus {
  ACCEPTED = 'accepted',
  DECLINED = 'declined', 
  TENTATIVE = 'tentative',
  NEEDS_ACTION = 'needs-action'
}

// DTOs para validación
export class CreateAppointmentDto {
  @IsString()
  patientName: string;

  @IsString()
  doctorName: string;

  @IsOptional()
  @IsString()
  specialty?: string;

  @IsOptional()
  @IsString()
  appointmentType?: string;

  @IsDateString()
  start: string;

  @IsDateString()
  end: string;

  @IsOptional()
  @IsString()
  description?: string;

  @IsOptional()
  @IsString()
  comment?: string;

  // FHIR R4 Compliance Fields
  @IsOptional()
  @IsString()
  identifier?: string;

  @IsOptional()
  priority?: number;

  @IsOptional()
  minutesDuration?: number;

  @IsOptional()
  @IsString()
  reasonCode?: string;

  @IsOptional()
  @IsString()
  serviceCategory?: string;

  @IsOptional()
  @IsString()
  serviceType?: string;

  @IsOptional()
  @IsString()
  patientInstruction?: string;

  @IsOptional()
  @IsString()
  slotId?: string;
}

export class UpdateAppointmentStatusDto {
  @IsEnum(AppointmentStatus)
  status: AppointmentStatus;
}

// Interfaces principales
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
  start?: string;
  end?: string;
}

export interface Identifier {
  use?: string;
  type?: CodeableConcept;
  system?: string;
  value?: string;
}

export interface AppointmentParticipant {
  type?: CodeableConcept[];
  actor?: Reference;
  required?: string;
  status: ParticipationStatus;
  period?: Period;
}

// Estructura completa del Appointment FHIR
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
  start?: string;
  end?: string;
  minutesDuration?: number;
  slot?: Reference[];
  created?: string;
  comment?: string;
  patientInstruction?: string;
  basedOn?: Reference[];
  participant: AppointmentParticipant[];
  requestedPeriod?: Period[];
}

// Versión simplificada para uso en la aplicación
export interface SimpleAppointment {
  id?: string;
  status: AppointmentStatus;
  patientName: string;
  doctorName: string;
  specialty?: string;
  appointmentType?: string;
  start: string;
  end: string;
  duration?: number; // en minutos
  description?: string;
  comment?: string;
  created?: string;
  consultationStartTime?: string; // Timestamp cuando inicia la consulta
  
  // FHIR R4 Compliance Fields
  identifier?: string; // External identifier
  priority?: number; // 0-9 priority scale
  minutesDuration?: number; // Duration in minutes
  reasonCode?: string; // ICD-10, SNOMED
  serviceCategory?: string; // Broad categorization
  serviceType?: string; // Specific service
  patientInstruction?: string; // Patient instructions
  slotId?: string; // Time slot reference
}

// Responses para la API
export class GetAppointmentsResponseDto {
  appointments: SimpleAppointment[];
  total: number;
}

export class CreateAppointmentResponseDto {
  appointment: SimpleAppointment;
  message: string;
}

export class SimpleAppointmentDto {
  id?: string;
  status: AppointmentStatus;
  patientName: string;
  doctorName: string;
  specialty?: string;
  appointmentType?: string;
  start: string;
  end: string;
  duration?: number;
  description?: string;
  comment?: string;
  created?: string;
  
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