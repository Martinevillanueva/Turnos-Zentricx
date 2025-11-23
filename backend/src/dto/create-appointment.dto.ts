import { IsNotEmpty, IsOptional, IsUUID, IsDateString, IsInt, Min, Max, IsString, MaxLength, IsIn } from 'class-validator';
import { Type } from 'class-transformer';

export class CreatePatientDataDto {
  @IsNotEmpty({ message: 'El nombre es requerido' })
  @IsString()
  @MaxLength(100)
  firstName: string;

  @IsNotEmpty({ message: 'El apellido es requerido' })
  @IsString()
  @MaxLength(100)
  lastName: string;

  @IsNotEmpty({ message: 'El documento es requerido' })
  @IsString()
  @MaxLength(20)
  documentNumber: string;

  @IsOptional()
  @IsString()
  @MaxLength(15)
  phone?: string;

  @IsOptional()
  @IsString()
  @MaxLength(100)
  email?: string;

  @IsOptional()
  @IsDateString()
  birthDate?: string;

  @IsOptional()
  @IsIn(['M', 'F', 'Other'])
  gender?: string;
}

export class CreateAppointmentDto {
  @IsOptional()
  @IsUUID('4', { message: 'El ID del paciente debe ser un UUID válido' })
  patientId?: string;

  @IsNotEmpty({ message: 'El ID del doctor es requerido' })
  @IsUUID('4', { message: 'El ID del doctor debe ser un UUID válido' })
  doctorId: string;

  @IsNotEmpty({ message: 'El ID de la especialidad es requerido' })
  @IsUUID('4', { message: 'El ID de la especialidad debe ser un UUID válido' })
  specialtyId: string;

  @IsNotEmpty({ message: 'La hora de inicio es requerida' })
  @Type(() => Date)
  startTime: Date;

  @IsOptional()
  @IsInt({ message: 'La duración debe ser un número entero' })
  @Min(5, { message: 'La duración mínima es 5 minutos' })
  @Max(480, { message: 'La duración máxima es 480 minutos (8 horas)' })
  duration?: number;

  @IsOptional()
  @IsString()
  @MaxLength(500)
  reason?: string;

  @IsOptional()
  @IsString()
  @MaxLength(15)
  contactPhone?: string;

  @IsOptional()
  @IsString()
  @MaxLength(100)
  contactEmail?: string;

  @IsOptional()
  @Type(() => CreatePatientDataDto)
  patientData?: CreatePatientDataDto;

  // ============ FHIR R4 Compliance Fields ============

  @IsOptional()
  @IsString()
  @MaxLength(100)
  identifier?: string;

  @IsOptional()
  @IsInt({ message: 'La prioridad debe ser un número entero' })
  @Min(0, { message: 'La prioridad mínima es 0' })
  @Max(9, { message: 'La prioridad máxima es 9' })
  priority?: number;

  @IsOptional()
  @IsIn(['routine', 'emergency', 'follow-up'], { 
    message: 'El tipo de turno debe ser: routine, emergency o follow-up' 
  })
  appointmentType?: string;

  @IsOptional()
  @IsString()
  @MaxLength(50)
  reasonCode?: string;

  @IsOptional()
  @IsString()
  @MaxLength(100)
  serviceCategory?: string;

  @IsOptional()
  @IsString()
  @MaxLength(100)
  serviceType?: string;

  @IsOptional()
  @IsString()
  @MaxLength(1000)
  patientInstruction?: string;

  @IsOptional()
  @IsString()
  @MaxLength(50)
  slotId?: string;
}
