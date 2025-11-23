import { Entity, PrimaryGeneratedColumn, Column, OneToMany, CreateDateColumn, UpdateDateColumn } from 'typeorm';
import { Appointment } from './appointment.entity';

@Entity('specialties')
export class Specialty {
  @PrimaryGeneratedColumn('uuid')
  id: string;

  @Column({ unique: true, length: 100 })
  name: string;

  @Column({ length: 500, nullable: true })
  description: string;

  @Column({ length: 7, default: '#3B82F6' }) // Color hex por defecto (azul)
  color: string;

  @Column({ type: 'integer', default: 30 }) // Duración por defecto en minutos
  defaultDuration: number;

  @Column({ type: 'boolean', default: true })
  isActive: boolean;

  @OneToMany(() => Appointment, appointment => appointment.specialty)
  appointments: Appointment[];

  @CreateDateColumn()
  createdAt: Date;

  @UpdateDateColumn()
  updatedAt: Date;
}