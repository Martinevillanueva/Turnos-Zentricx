import { Entity, PrimaryGeneratedColumn, Column, OneToMany, CreateDateColumn, UpdateDateColumn } from 'typeorm';
import { Expose } from 'class-transformer';
import { Appointment } from './appointment.entity';

@Entity('patients')
export class Patient {
  @PrimaryGeneratedColumn('uuid')
  id: string;

  @Column({ length: 100 })
  firstName: string;

  @Column({ length: 100 })
  lastName: string;

  @Column({ unique: true, length: 20 })
  documentNumber: string; // DNI o documento de identidad

  @Column({ length: 20, nullable: true })
  phone: string;

  @Column({ length: 100, nullable: true })
  email: string;

  @Column({ type: 'date', nullable: true })
  birthDate: Date;

  @Column({ length: 10, nullable: true })
  gender: string; // M, F, Other

  @Column({ length: 200, nullable: true })
  address: string;

  @Column({ length: 100, nullable: true })
  emergencyContact: string;

  @Column({ length: 20, nullable: true })
  emergencyPhone: string;

  @Column({ type: 'text', nullable: true })
  medicalNotes: string;

  @Column({ type: 'boolean', default: true })
  isActive: boolean;

  @OneToMany(() => Appointment, appointment => appointment.patient)
  appointments: Appointment[];

  @CreateDateColumn()
  createdAt: Date;

  @UpdateDateColumn()
  updatedAt: Date;

  // Virtual field para nombre completo
  @Expose()
  get fullName(): string {
    return `${this.firstName} ${this.lastName}`;
  }

  // Virtual field para edad
  get age(): number | null {
    if (!this.birthDate) return null;
    const today = new Date();
    const birth = new Date(this.birthDate);
    let age = today.getFullYear() - birth.getFullYear();
    const monthDiff = today.getMonth() - birth.getMonth();
    
    if (monthDiff < 0 || (monthDiff === 0 && today.getDate() < birth.getDate())) {
      age--;
    }
    
    return age;
  }
}