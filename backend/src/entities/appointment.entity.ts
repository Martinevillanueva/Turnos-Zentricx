import { 
  Entity, 
  PrimaryGeneratedColumn, 
  Column, 
  ManyToOne, 
  JoinColumn, 
  CreateDateColumn, 
  UpdateDateColumn,
  Index
} from 'typeorm';
import { Doctor } from './doctor.entity';
import { Patient } from './patient.entity';
import { Specialty } from './specialty.entity';
import { AppointmentStatus } from './appointment-status.entity';

@Entity('appointments')
@Index(['startTime', 'doctorId']) // Índice compuesto para queries comunes
@Index(['patientId', 'startTime']) // Índice para historial de paciente
export class Appointment {
  @PrimaryGeneratedColumn('uuid')
  id: string;

  // Relaciones
  @ManyToOne(() => Patient, patient => patient.appointments, { eager: true })
  @JoinColumn({ name: 'patient_id' })
  patient: Patient;

  @Column({ name: 'patient_id' })
  patientId: string;

  @ManyToOne(() => Doctor, doctor => doctor.appointments, { eager: true })
  @JoinColumn({ name: 'doctor_id' })
  doctor: Doctor;

  @Column({ name: 'doctor_id' })
  doctorId: string;

  @ManyToOne(() => Specialty, specialty => specialty.appointments, { eager: true })
  @JoinColumn({ name: 'specialty_id' })
  specialty: Specialty;

  @Column({ name: 'specialty_id' })
  specialtyId: string;

  @ManyToOne(() => AppointmentStatus, status => status.appointments, { eager: true })
  @JoinColumn({ name: 'status_id' })
  status: AppointmentStatus;

  @Column({ name: 'status_id' })
  statusId: string;

  // Información del turno
  @Column({ type: 'timestamp' })
  startTime: Date;

  @Column({ type: 'timestamp' })
  endTime: Date;

  @Column({ type: 'integer', default: 30 }) // Duración en minutos
  duration: number;

  // Información adicional
  @Column({ length: 500, nullable: true })
  reason: string; // Motivo de la consulta

  @Column({ type: 'text', nullable: true })
  notes: string; // Notas del médico

  @Column({ type: 'text', nullable: true })
  symptoms: string; // Síntomas reportados

  @Column({ type: 'text', nullable: true })
  diagnosis: string; // Diagnóstico (si se completó)

  @Column({ type: 'text', nullable: true })
  treatment: string; // Tratamiento prescrito

  // Control de tiempo
  @Column({ type: 'timestamp', nullable: true })
  arrivedAt: Date; // Momento en que llegó el paciente

  @Column({ type: 'timestamp', nullable: true })
  consultationStartedAt: Date; // Momento en que inició la consulta

  @Column({ type: 'timestamp', nullable: true })
  consultationEndedAt: Date; // Momento en que terminó la consulta

  // Información de contacto (puede cambiar respecto al paciente)
  @Column({ length: 20, nullable: true })
  contactPhone: string;

  @Column({ length: 100, nullable: true })
  contactEmail: string;

  // Recordatorios
  @Column({ type: 'boolean', default: false })
  reminderSent: boolean;

  @Column({ type: 'timestamp', nullable: true })
  reminderSentAt: Date;

  // Cancelación
  @Column({ type: 'timestamp', nullable: true })
  cancelledAt: Date;

  @Column({ length: 500, nullable: true })
  cancellationReason: string;

  @Column({ length: 100, nullable: true })
  cancelledBy: string; // 'patient', 'doctor', 'admin'

  // Auditoría
  @CreateDateColumn()
  createdAt: Date;

  @UpdateDateColumn()
  updatedAt: Date;

  @Column({ length: 100, nullable: true })
  createdBy: string; // Usuario que creó el turno

  @Column({ length: 100, nullable: true })
  updatedBy: string; // Último usuario que modificó

  // ============ FHIR R4 Compliance Fields ============
  
  @Column({ length: 100, nullable: true, comment: 'FHIR: External identifier' })
  identifier: string;

  @Column({ type: 'integer', default: 5, comment: 'FHIR: Priority (0=lowest, 9=highest)' })
  priority: number;

  @Column({ type: 'integer', nullable: true, comment: 'FHIR: Duration in minutes' })
  minutesDuration: number;

  @Column({ length: 50, nullable: true, comment: 'FHIR: routine | emergency | follow-up' })
  appointmentType: string;

  @Column({ length: 50, nullable: true, comment: 'FHIR: Reason code (ICD-10, SNOMED)' })
  reasonCode: string;

  @Column({ length: 100, nullable: true, comment: 'FHIR: Service category (broad)' })
  serviceCategory: string;

  @Column({ length: 100, nullable: true, comment: 'FHIR: Service type (specific)' })
  serviceType: string;

  @Column({ type: 'text', nullable: true, comment: 'FHIR: Patient instructions' })
  patientInstruction: string;

  @Column({ length: 50, nullable: true, comment: 'FHIR: Slot identifier' })
  slotId: string;

  // Métodos calculados
  get isToday(): boolean {
    const today = new Date();
    const appointmentDate = new Date(this.startTime);
    return appointmentDate.toDateString() === today.toDateString();
  }

  get isPast(): boolean {
    return new Date(this.startTime) < new Date();
  }

  get isFuture(): boolean {
    return new Date(this.startTime) > new Date();
  }

  get timeSlot(): string {
    const start = new Date(this.startTime);
    const end = new Date(this.endTime);
    return `${start.toLocaleTimeString('es-ES', { hour: '2-digit', minute: '2-digit' })} - ${end.toLocaleTimeString('es-ES', { hour: '2-digit', minute: '2-digit' })}`;
  }

  get actualDuration(): number | null {
    if (!this.consultationStartedAt || !this.consultationEndedAt) {
      return null;
    }
    return Math.round((this.consultationEndedAt.getTime() - this.consultationStartedAt.getTime()) / (1000 * 60));
  }
}