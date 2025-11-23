import { Injectable } from '@nestjs/common';
import { v4 as uuidv4 } from 'uuid';
import { 
  SimpleAppointment, 
  CreateAppointmentDto, 
  AppointmentStatus 
} from '../types/fhir.types';
import { JsonDatabaseService } from '../services/json-database.service';

@Injectable()
export class AppointmentsService {
  constructor(private readonly jsonDb: JsonDatabaseService) {}

  /**
   * Obtiene todos los appointments
   */
  async findAll(): Promise<SimpleAppointment[]> {
    const appointments = await this.jsonDb.getAllAppointments();
    return appointments.sort((a, b) => 
      new Date(b.created || '').getTime() - new Date(a.created || '').getTime()
    );
  }

  /**
   * Obtiene un appointment por ID
   */
  async findById(id: string): Promise<SimpleAppointment | undefined> {
    const appointment = await this.jsonDb.findAppointmentById(id);
    return appointment || undefined;
  }

  /**
   * Crea un nuevo appointment
   */
  async create(createAppointmentDto: CreateAppointmentDto): Promise<SimpleAppointment> {
    const startDate = new Date(createAppointmentDto.start);
    const endDate = new Date(createAppointmentDto.end);
    
    // Validaciones básicas
    if (endDate <= startDate) {
      throw new Error('La fecha de fin debe ser posterior a la fecha de inicio');
    }

    if (startDate < new Date()) {
      throw new Error('No se puede crear un turno en el pasado');
    }

    // Verificar disponibilidad (simplificado)
    const allAppointments = await this.jsonDb.getAllAppointments();
    const conflictingAppointment = allAppointments.find(appointment => {
      if (appointment.status === AppointmentStatus.CANCELLED) return false;
      
      const existingStart = new Date(appointment.start);
      const existingEnd = new Date(appointment.end);
      
      return (
        appointment.doctorName === createAppointmentDto.doctorName &&
        ((startDate >= existingStart && startDate < existingEnd) ||
         (endDate > existingStart && endDate <= existingEnd) ||
         (startDate <= existingStart && endDate >= existingEnd))
      );
    });

    if (conflictingAppointment) {
      throw new Error(`El médico ${createAppointmentDto.doctorName} ya tiene un turno programado en ese horario`);
    }

    const duration = Math.floor((endDate.getTime() - startDate.getTime()) / (1000 * 60));

    const newAppointment: SimpleAppointment = {
      id: uuidv4(),
      status: AppointmentStatus.BOOKED,
      patientName: createAppointmentDto.patientName,
      doctorName: createAppointmentDto.doctorName,
      specialty: createAppointmentDto.specialty,
      appointmentType: createAppointmentDto.appointmentType,
      start: createAppointmentDto.start,
      end: createAppointmentDto.end,
      duration,
      description: createAppointmentDto.description,
      comment: createAppointmentDto.comment,
      created: new Date().toISOString()
    };

    await this.jsonDb.addAppointment(newAppointment);
    return newAppointment;
  }

  /**
   * Actualiza el estado de un appointment
   */
  async updateStatus(id: string, status: AppointmentStatus): Promise<SimpleAppointment> {
    const appointment = await this.jsonDb.findAppointmentById(id);
    
    if (!appointment) {
      throw new Error('Appointment no encontrado');
    }

    // Validaciones de transición de estados (simplificadas)
    const validTransitions: { [key in AppointmentStatus]: AppointmentStatus[] } = {
      [AppointmentStatus.PENDING]: [AppointmentStatus.BOOKED, AppointmentStatus.CANCELLED],
      [AppointmentStatus.BOOKED]: [AppointmentStatus.ARRIVED, AppointmentStatus.CANCELLED, AppointmentStatus.NOSHOW, AppointmentStatus.CHECKED_IN],
      [AppointmentStatus.ARRIVED]: [AppointmentStatus.IN_CONSULTATION, AppointmentStatus.FULFILLED, AppointmentStatus.CANCELLED],
      [AppointmentStatus.IN_CONSULTATION]: [AppointmentStatus.FULFILLED, AppointmentStatus.CANCELLED],
      [AppointmentStatus.CHECKED_IN]: [AppointmentStatus.ARRIVED, AppointmentStatus.CANCELLED],
      [AppointmentStatus.FULFILLED]: [], // Estado final
      [AppointmentStatus.CANCELLED]: [], // Estado final
      [AppointmentStatus.NOSHOW]: [AppointmentStatus.CANCELLED],
      [AppointmentStatus.ENTERED_IN_ERROR]: [],
      [AppointmentStatus.WAITLIST]: [AppointmentStatus.BOOKED, AppointmentStatus.CANCELLED]
    };

    if (!validTransitions[appointment.status].includes(status) && status !== appointment.status) {
      throw new Error(`No es posible cambiar el estado de ${appointment.status} a ${status}`);
    }

    const updatedAppointment: SimpleAppointment = {
      ...appointment,
      status
    };

    // Si cambia a 'in-consultation', guardar el timestamp
    if (status === AppointmentStatus.IN_CONSULTATION) {
      updatedAppointment.consultationStartTime = new Date().toISOString();
    }

    await this.jsonDb.updateAppointment(id, updatedAppointment);
    return updatedAppointment;
  }

  /**
   * Elimina un appointment (soft delete - cambia estado a cancelled)
   */
  async remove(id: string): Promise<void> {
    const appointment = await this.jsonDb.findAppointmentById(id);
    
    if (!appointment) {
      throw new Error('Appointment no encontrado');
    }

    const updatedAppointment: SimpleAppointment = {
      ...appointment,
      status: AppointmentStatus.CANCELLED
    };

    await this.jsonDb.updateAppointment(id, updatedAppointment);
  }

  /**
   * Obtiene estadísticas básicas
   */
  async getStats() {
    const appointments = await this.jsonDb.getAllAppointments();
    const total = appointments.length;
    
    const byStatus = appointments.reduce((acc, appointment) => {
      acc[appointment.status] = (acc[appointment.status] || 0) + 1;
      return acc;
    }, {} as Record<string, number>);

    const today = new Date();
    const todayAppointments = appointments.filter(appointment => {
      const appointmentDate = new Date(appointment.start);
      return appointmentDate.toDateString() === today.toDateString();
    });

    return {
      total,
      byStatus,
      todayCount: todayAppointments.length,
      todayAppointments: todayAppointments
    };
  }

  /**
   * Crear backup de los datos
   */
  async createBackup(): Promise<string> {
    return await this.jsonDb.createBackup();
  }
}