import { Entity, PrimaryGeneratedColumn, Column, OneToMany, CreateDateColumn, UpdateDateColumn } from 'typeorm';
import { Appointment } from './appointment.entity';

@Entity('appointment_statuses')
export class AppointmentStatus {
  @PrimaryGeneratedColumn('uuid')
  id: string;

  @Column({ unique: true, length: 50 })
  name: string;

  @Column({ unique: true, length: 50 })
  slug: string; // Para mantener compatibilidad con frontend

  @Column({ length: 100 })
  label: string; // Etiqueta en español

  @Column({ length: 7 }) // Color hex
  color: string;

  @Column({ length: 7 }) // Color de borde
  borderColor: string;

  @Column({ length: 100, nullable: true })
  bgColor: string; // Clase CSS de fondo

  @Column({ type: 'boolean', default: false })
  isFinal: boolean; // Si es un estado final (no se puede cambiar)

  @Column({ type: 'integer', default: 0 })
  sortOrder: number; // Para ordenar en UI

  @OneToMany(() => Appointment, appointment => appointment.status)
  appointments: Appointment[];

  @CreateDateColumn()
  createdAt: Date;

  @UpdateDateColumn()
  updatedAt: Date;
}