import { Entity, PrimaryGeneratedColumn, Column, ManyToOne, JoinColumn, CreateDateColumn, UpdateDateColumn } from 'typeorm';
import { Appointment } from './appointment.entity';

/**
 * FHIR R4 Appointment.Participant
 * 
 * Representa los participantes de una cita según el estándar FHIR R4.
 * Un appointment puede tener múltiples participantes (paciente, doctor, etc.)
 */
@Entity('appointment_participants')
export class AppointmentParticipant {
  @PrimaryGeneratedColumn('uuid')
  id: string;

  @ManyToOne(() => Appointment, { onDelete: 'CASCADE' })
  @JoinColumn({ name: 'appointment_id' })
  appointment: Appointment;

  @Column({ name: 'appointment_id' })
  appointmentId: string;

  // FHIR: Type of participant
  // patient | practitioner | related-person | device | healthcare-service | location
  @Column({ length: 50, comment: 'FHIR: Type of participant' })
  actorType: string;

  // ID del actor (patientId, doctorId, etc.)
  @Column({ length: 36, comment: 'FHIR: Reference to actor resource' })
  actorId: string;

  // Nombre para mostrar del actor
  @Column({ length: 200, nullable: true, comment: 'FHIR: Display name for actor' })
  actorDisplay: string;

  // FHIR: required | optional | information-only
  @Column({ length: 20, default: 'required', comment: 'FHIR: Participation requirement' })
  required: string;

  // FHIR: accepted | declined | tentative | needs-action
  @Column({ length: 20, default: 'needs-action', comment: 'FHIR: Participation status' })
  status: string;

  // Período de participación (puede ser diferente al turno completo)
  @Column({ type: 'timestamp', nullable: true, comment: 'FHIR: Start of participation period' })
  periodStart: Date;

  @Column({ type: 'timestamp', nullable: true, comment: 'FHIR: End of participation period' })
  periodEnd: Date;

  @CreateDateColumn()
  createdAt: Date;

  @UpdateDateColumn()
  updatedAt: Date;
}
