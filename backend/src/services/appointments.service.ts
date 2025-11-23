import { Injectable, NotFoundException, BadRequestException } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository, Between, MoreThanOrEqual, LessThanOrEqual } from 'typeorm';
import { Appointment, Doctor, Patient, Specialty, AppointmentStatus } from '../entities';

export interface CreateAppointmentDto {
  patientId?: string;
  doctorId: string;
  specialtyId: string;
  startTime: Date;
  duration?: number;
  reason?: string;
  contactPhone?: string;
  contactEmail?: string;
  // Para crear paciente inline si no existe
  patientData?: {
    firstName: string;
    lastName: string;
    documentNumber: string;
    phone?: string;
    email?: string;
    birthDate?: Date;
    gender?: string;
  };
  
  // FHIR R4 Compliance Fields
  identifier?: string;
  priority?: number;
  appointmentType?: string;
  reasonCode?: string;
  serviceCategory?: string;
  serviceType?: string;
  patientInstruction?: string;
  slotId?: string;
}

export interface CreatePatientDto {
  firstName: string;
  lastName: string;
  documentNumber: string;
  phone?: string;
  email?: string;
  birthDate?: string;
  gender?: string;
  address?: string;
}

export interface UpdateAppointmentStatusDto {
  statusId: string;
  notes?: string;
  cancellationReason?: string;
  updatedBy?: string;
}

export interface AppointmentFilters {
  // Filtros originales
  doctorId?: string;
  patientId?: string;
  specialtyId?: string;
  statusId?: string;
  statusIds?: string[]; // Array de IDs de estados para filtro múltiple
  startDate?: Date;
  endDate?: Date;
  date?: Date; // Para filtrar por un día específico
  patientSearch?: string; // Búsqueda por DNI, nombre, apellido o email
  page?: number;
  limit?: number;
  
  // FHIR R4 Search Parameters
  actor?: string; // Any one of the individuals participating (Patient, Practitioner, etc.)
  appointmentType?: string; // The style of appointment or patient
  identifier?: string; // An Identifier of the Appointment
  location?: string; // Location listed in the participants
  partStatus?: string; // The Participation status of the subject
  practitioner?: string; // One of the individuals of the appointment is this practitioner
  priority?: string; // Used to make informed decisions about booking
  reasonCode?: string; // Coded reason this appointment is scheduled
  serviceCategory?: string; // A broad categorization of the service
  serviceType?: string; // The specific service that is to be performed
  slot?: string; // The slots that this appointment is filling
  specialty?: string; // The specialty of a practitioner (ya mapeado a specialtyId)
}

export interface PaginatedAppointments {
  appointments: Appointment[];
  total: number;
  page: number;
  limit: number;
  totalPages: number;
}

@Injectable()
export class AppointmentsService {
  constructor(
    @InjectRepository(Appointment)
    private appointmentRepository: Repository<Appointment>,
    
    @InjectRepository(Doctor)
    private doctorRepository: Repository<Doctor>,
    
    @InjectRepository(Patient)
    private patientRepository: Repository<Patient>,
    
    @InjectRepository(Specialty)
    private specialtyRepository: Repository<Specialty>,
    
    @InjectRepository(AppointmentStatus)
    private statusRepository: Repository<AppointmentStatus>,
  ) {}

  async findAll(filters?: AppointmentFilters): Promise<Appointment[]> {
    const query = this.appointmentRepository.createQueryBuilder('appointment')
      .leftJoinAndSelect('appointment.patient', 'patient')
      .leftJoinAndSelect('appointment.doctor', 'doctor')
      .leftJoinAndSelect('appointment.specialty', 'specialty')
      .leftJoinAndSelect('appointment.status', 'status');

    if (filters) {
      // Filtros originales
      if (filters.doctorId) {
        query.andWhere('appointment.doctorId = :doctorId', { doctorId: filters.doctorId });
      }
      
      if (filters.patientId) {
        query.andWhere('appointment.patientId = :patientId', { patientId: filters.patientId });
      }
      
      if (filters.specialtyId) {
        query.andWhere('appointment.specialtyId = :specialtyId', { specialtyId: filters.specialtyId });
      }
      
      if (filters.statusId) {
        query.andWhere('appointment.statusId = :statusId', { statusId: filters.statusId });
      }
      
      // Soporte para múltiples estados
      if (filters.statusIds && filters.statusIds.length > 0) {
        query.andWhere('appointment.statusId IN (:...statusIds)', { statusIds: filters.statusIds });
      }
      
      if (filters.date) {
        const startOfDay = new Date(filters.date);
        startOfDay.setHours(0, 0, 0, 0);
        const endOfDay = new Date(filters.date);
        endOfDay.setHours(23, 59, 59, 999);
        
        query.andWhere('appointment.startTime BETWEEN :startOfDay AND :endOfDay', {
          startOfDay,
          endOfDay
        });
      } else {
        if (filters.startDate) {
          query.andWhere('appointment.startTime >= :startDate', { startDate: filters.startDate });
        }
        
        if (filters.endDate) {
          query.andWhere('appointment.startTime <= :endDate', { endDate: filters.endDate });
        }
      }
      
      // FHIR R4 Search Parameters
      if (filters.actor) {
        query.andWhere(
          '(appointment.patientId = :actorId OR appointment.doctorId = :actorId)',
          { actorId: filters.actor }
        );
      }
      
      if (filters.appointmentType) {
        query.andWhere('appointment.appointmentType = :appointmentType', { appointmentType: filters.appointmentType });
      }
      
      if (filters.identifier) {
        query.andWhere('appointment.identifier = :identifier', { identifier: filters.identifier });
      }
      
      if (filters.practitioner) {
        query.andWhere('appointment.doctorId = :practitionerId', { practitionerId: filters.practitioner });
      }
      
      if (filters.reasonCode) {
        query.andWhere('LOWER(appointment.reasonCode) LIKE LOWER(:reasonCode)', { reasonCode: `%${filters.reasonCode}%` });
      }
      
      if (filters.serviceCategory) {
        query.andWhere('LOWER(appointment.serviceCategory) LIKE LOWER(:serviceCategory)', { serviceCategory: `%${filters.serviceCategory}%` });
      }
      
      if (filters.serviceType) {
        query.andWhere('LOWER(appointment.serviceType) LIKE LOWER(:serviceType)', { serviceType: `%${filters.serviceType}%` });
      }
      
      if (filters.slot) {
        query.andWhere('appointment.slotId = :slotId', { slotId: filters.slot });
      }
      
      if (filters.specialty) {
        query.andWhere('appointment.specialtyId = :specialtyId', { specialtyId: filters.specialty });
      }
      
      if (filters.priority) {
        query.andWhere('appointment.priority = :priority', { priority: Number.parseInt(filters.priority, 10) });
      }
    }

    return query
      .orderBy('appointment.startTime', 'ASC')
      .getMany();
  }

  async findAllPaginated(filters?: AppointmentFilters): Promise<PaginatedAppointments> {
    
    const page = filters?.page || 1;
    const limit = filters?.limit || 20;
    const offset = (page - 1) * limit;

    const query = this.appointmentRepository.createQueryBuilder('appointment')
      .leftJoinAndSelect('appointment.patient', 'patient')
      .leftJoinAndSelect('appointment.doctor', 'doctor')
      .leftJoinAndSelect('appointment.specialty', 'specialty')
      .leftJoinAndSelect('appointment.status', 'status');

    if (filters) {
      // Filtros originales
      if (filters.doctorId) {
        query.andWhere('appointment.doctorId = :doctorId', { doctorId: filters.doctorId });
      }
      
      if (filters.patientId) {
        query.andWhere('appointment.patientId = :patientId', { patientId: filters.patientId });
      }
      
      if (filters.specialtyId) {
        query.andWhere('appointment.specialtyId = :specialtyId', { specialtyId: filters.specialtyId });
      }
      
      if (filters.statusId) {
        query.andWhere('appointment.statusId = :statusId', { statusId: filters.statusId });
      }
      
      // Soporte para múltiples estados
      if (filters.statusIds && filters.statusIds.length > 0) {
        query.andWhere('appointment.statusId IN (:...statusIds)', { statusIds: filters.statusIds });
      }
      
      if (filters.patientSearch) {
        const searchTerm = `%${filters.patientSearch.toLowerCase()}%`;
        query.andWhere(
          '(LOWER(patient.documentNumber) LIKE :searchTerm OR ' +
          'LOWER(patient.firstName) LIKE :searchTerm OR ' +
          'LOWER(patient.lastName) LIKE :searchTerm OR ' +
          'LOWER(patient.email) LIKE :searchTerm OR ' +
          'LOWER(CONCAT(patient.firstName, " ", patient.lastName)) LIKE :searchTerm)',
          { searchTerm }
        );
      }
      
      if (filters.date) {
        // Crear fechas usando la fecha exacta sin problemas de zona horaria
        const dateStr = filters.date instanceof Date 
          ? filters.date.toISOString().split('T')[0] 
          : String(filters.date);
                
        // Extraer año, mes y día de la fecha
        const [year, month, day] = dateStr.split('-').map(Number);
        
        // Crear fechas usando el constructor de Date con valores locales
        const startOfDay = new Date(year, month - 1, day, 0, 0, 0, 0);
        const endOfDay = new Date(year, month - 1, day, 23, 59, 59, 999);
                
        query.andWhere('appointment.startTime BETWEEN :startOfDay AND :endOfDay', {
          startOfDay,
          endOfDay
        });
      } else {
        if (filters.startDate) {
          query.andWhere('appointment.startTime >= :startDate', { startDate: filters.startDate });
        }
        
        if (filters.endDate) {
          query.andWhere('appointment.startTime <= :endDate', { endDate: filters.endDate });
        }
      }
      
      // FHIR R4 Search Parameters
      if (filters.actor) {
        query.andWhere(
          '(appointment.patientId = :actorId OR appointment.doctorId = :actorId)',
          { actorId: filters.actor }
        );
      }
      
      if (filters.appointmentType) {
        query.andWhere('appointment.appointmentType = :appointmentType', { appointmentType: filters.appointmentType });
      }
      
      if (filters.identifier) {
        query.andWhere('appointment.identifier = :identifier', { identifier: filters.identifier });
      }
      
      if (filters.practitioner) {
        query.andWhere('appointment.doctorId = :practitionerId', { practitionerId: filters.practitioner });
      }
      
      if (filters.reasonCode) {
        query.andWhere('LOWER(appointment.reasonCode) LIKE LOWER(:reasonCode)', { reasonCode: `%${filters.reasonCode}%` });
      }
      
      if (filters.serviceCategory) {
        query.andWhere('LOWER(appointment.serviceCategory) LIKE LOWER(:serviceCategory)', { serviceCategory: `%${filters.serviceCategory}%` });
      }
      
      if (filters.serviceType) {
        query.andWhere('LOWER(appointment.serviceType) LIKE LOWER(:serviceType)', { serviceType: `%${filters.serviceType}%` });
      }
      
      if (filters.slot) {
        query.andWhere('appointment.slotId = :slotId', { slotId: filters.slot });
      }
      
      if (filters.specialty) {
        query.andWhere('appointment.specialtyId = :specialtyId', { specialtyId: filters.specialty });
      }
      
      if (filters.priority) {
        query.andWhere('appointment.priority = :priority', { priority: Number.parseInt(filters.priority, 10) });
      }
    }

    // Obtener total de registros
    const total = await query.getCount();

    // Aplicar paginación y ordenamiento
    const appointments = await query
      .orderBy('appointment.startTime', 'ASC')
      .skip(offset)
      .take(limit)
      .getMany();

    const totalPages = Math.ceil(total / limit);

    return {
      appointments,
      total,
      page,
      limit,
      totalPages
    };
  }

  async findOne(id: string): Promise<Appointment> {
    const appointment = await this.appointmentRepository.findOne({
      where: { id },
      relations: ['patient', 'doctor', 'specialty', 'status']
    });

    if (!appointment) {
      throw new NotFoundException(`Turno con ID ${id} no encontrado`);
    }

    return appointment;
  }

  async create(createDto: CreateAppointmentDto, createdBy?: string): Promise<Appointment> {
    // Validar que el doctor existe
    const doctor = await this.doctorRepository.findOne({
      where: { id: createDto.doctorId, isActive: true }
    });
    
    if (!doctor) {
      throw new BadRequestException('Doctor no encontrado o inactivo');
    }

    // Validar que la especialidad existe
    const specialty = await this.specialtyRepository.findOne({
      where: { id: createDto.specialtyId, isActive: true }
    });
    
    if (!specialty) {
      throw new BadRequestException('Especialidad no encontrada o inactiva');
    }

    // Obtener o crear paciente
    let patient: Patient;
    
    if (createDto.patientId) {
      patient = await this.patientRepository.findOne({
        where: { id: createDto.patientId, isActive: true }
      });
      
      if (!patient) {
        throw new BadRequestException('Paciente no encontrado o inactivo');
      }
    } else if (createDto.patientData) {
      // Crear nuevo paciente
      const existingPatient = await this.patientRepository.findOne({
        where: { documentNumber: createDto.patientData.documentNumber }
      });
      
      if (existingPatient) {
        throw new BadRequestException('Ya existe un paciente con ese número de documento');
      }
      
      patient = this.patientRepository.create(createDto.patientData);
      patient = await this.patientRepository.save(patient);
    } else {
      throw new BadRequestException('Debe proporcionar patientId o patientData');
    }

    // Obtener estado "pending" por defecto
    const pendingStatus = await this.statusRepository.findOne({
      where: { slug: 'pending' }
    });

    if (!pendingStatus) {
      throw new BadRequestException('Estado "pending" no encontrado');
    }

    // Validar que no haya conflicto de horarios
    // Si no se especifica duración, usar la de la especialidad por defecto (30 minutos)
    const duration = createDto.duration || 30; // Usar 30 minutos por defecto
    const endTime = new Date(createDto.startTime.getTime() + duration * 60000);
    
    // Calcular minutesDuration automáticamente para FHIR compliance
    const minutesDuration = Math.round((endTime.getTime() - createDto.startTime.getTime()) / 60000);
    
    const conflictingAppointment = await this.appointmentRepository
      .createQueryBuilder('appointment')
      .where('appointment.doctorId = :doctorId', { doctorId: doctor.id })
      .andWhere('appointment.statusId NOT IN (:...cancelledStatuses)', { 
        cancelledStatuses: await this.getCancelledStatusIds() 
      })
      .andWhere(
        '(appointment.startTime < :endTime AND appointment.endTime > :startTime)',
        { startTime: createDto.startTime, endTime }
      )
      .getOne();

    if (conflictingAppointment) {
      throw new BadRequestException('El doctor ya tiene un turno programado en ese horario');
    }

    // Crear el turno
    const appointment = this.appointmentRepository.create({
      patientId: patient.id,
      doctorId: doctor.id,
      specialtyId: specialty.id,
      statusId: pendingStatus.id,
      startTime: createDto.startTime,
      endTime,
      duration,
      reason: createDto.reason,
      contactPhone: createDto.contactPhone || patient.phone,
      contactEmail: createDto.contactEmail || patient.email,
      createdBy,
      
      // FHIR R4 Compliance Fields
      identifier: createDto.identifier,
      priority: createDto.priority ?? 5, // Default priority: 5 (medium)
      minutesDuration,
      appointmentType: createDto.appointmentType || 'routine',
      reasonCode: createDto.reasonCode,
      serviceCategory: createDto.serviceCategory || specialty.name,
      serviceType: createDto.serviceType,
      patientInstruction: createDto.patientInstruction,
      slotId: createDto.slotId
    });

    const savedAppointment = await this.appointmentRepository.save(appointment);
    
    // Devolver la cita con todas las relaciones cargadas
    return this.findOne(savedAppointment.id);
  }

  async updateStatus(id: string, updateDto: UpdateAppointmentStatusDto): Promise<Appointment> {
    const appointment = await this.findOne(id);
    
    const status = await this.statusRepository.findOne({
      where: { id: updateDto.statusId }
    });
    
    if (!status) {
      throw new BadRequestException('Estado no encontrado');
    }

    // Actualizar campos según el nuevo estado
    const updateData: Partial<Appointment> = {
      statusId: status.id,
      updatedBy: updateDto.updatedBy
    };

    if (updateDto.notes) {
      updateData.notes = updateDto.notes;
    }

    // Lógica específica por estado
    switch (status.slug) {
      case 'arrived':
        updateData.arrivedAt = new Date();
        break;
      
      case 'in-consultation':
        updateData.consultationStartedAt = new Date();
        break;
      
      case 'fulfilled':
        updateData.consultationEndedAt = new Date();
        break;
      
      case 'cancelled':
        updateData.cancelledAt = new Date();
        updateData.cancellationReason = updateDto.cancellationReason;
        updateData.cancelledBy = updateDto.updatedBy || 'admin';
        break;
    }

    await this.appointmentRepository.update(id, updateData);
    
    return this.findOne(id);
  }

  async remove(id: string): Promise<void> {
    const appointment = await this.findOne(id);
    await this.appointmentRepository.remove(appointment);
  }

  // Métodos auxiliares
  async getDoctors(search?: string): Promise<Doctor[]> {
    const queryBuilder = this.doctorRepository.createQueryBuilder('doctor')
      .leftJoinAndSelect('doctor.specialty', 'specialty')
      .where('doctor.isActive = :isActive', { isActive: true });

    if (search?.trim()) {
      queryBuilder.andWhere(
        '(LOWER(doctor.firstName) LIKE LOWER(:search) OR LOWER(doctor.lastName) LIKE LOWER(:search) OR LOWER(doctor.firstName || " " || doctor.lastName) LIKE LOWER(:search))',
        { search: `%${search.trim()}%` }
      );
    }

    return queryBuilder
      .orderBy('doctor.firstName', 'ASC')
      .addOrderBy('doctor.lastName', 'ASC')
      .getMany();
  }

  async getPatients(search?: string): Promise<Patient[]> {
    const queryBuilder = this.patientRepository.createQueryBuilder('patient')
      .where('patient.isActive = :isActive', { isActive: true });

    if (search?.trim()) {
      queryBuilder.andWhere(
        '(LOWER(patient.firstName) LIKE LOWER(:search) OR LOWER(patient.lastName) LIKE LOWER(:search) OR LOWER(patient.firstName || " " || patient.lastName) LIKE LOWER(:search) OR LOWER(patient.email) LIKE LOWER(:search))',
        { search: `%${search.trim()}%` }
      );
    }

    const result = await queryBuilder
      .orderBy('patient.firstName', 'ASC')
      .addOrderBy('patient.lastName', 'ASC')
      .getMany();
    
    return result;
  }

  async createPatient(createPatientDto: CreatePatientDto): Promise<Patient> {
    // Verificar que no exista un paciente con el mismo documento
    const existingPatient = await this.patientRepository.findOne({
      where: { documentNumber: createPatientDto.documentNumber }
    });

    if (existingPatient) {
      throw new BadRequestException('Ya existe un paciente con este número de documento');
    }

    const patient = this.patientRepository.create({
      firstName: createPatientDto.firstName,
      lastName: createPatientDto.lastName,
      documentNumber: createPatientDto.documentNumber,
      phone: createPatientDto.phone,
      email: createPatientDto.email,
      birthDate: createPatientDto.birthDate ? new Date(createPatientDto.birthDate) : undefined,
      gender: createPatientDto.gender,
      address: createPatientDto.address,
      isActive: true
    });

    return await this.patientRepository.save(patient);
  }

  async getSpecialties(): Promise<Specialty[]> {
    return this.specialtyRepository.find({
      where: { isActive: true },
      order: { name: 'ASC' }
    });
  }

  async getStatuses(): Promise<AppointmentStatus[]> {
    return this.statusRepository.find({
      order: { sortOrder: 'ASC' }
    });
  }

  async fixFhirStatuses() {
    // Agregar estados FHIR faltantes
    const newStatuses = [
      {
        id: '8b9c1d2e-3f4a-5b6c-7d8e-9f0a1b2c3d4e',
        name: 'checked-in',
        slug: 'checked-in',
        label: 'Check-in realizado',
        color: '#8B5CF6',
        borderColor: '#8B5CF6',
        bgColor: 'bg-purple-100 text-purple-800',
        isFinal: false,
        sortOrder: 8
      },
      {
        id: '9c0d1e2f-3a4b-5c6d-7e8f-9a0b1c2d3e4f',
        name: 'waitlist',
        slug: 'waitlist',
        label: 'Lista de espera',
        color: '#6B7280',
        borderColor: '#6B7280',
        bgColor: 'bg-gray-100 text-gray-800',
        isFinal: false,
        sortOrder: 9
      },
      {
        id: '0d1e2f3a-4b5c-6d7e-8f9a-0b1c2d3e4f5a',
        name: 'entered-in-error',
        slug: 'entered-in-error',
        label: 'Ingresado por error',
        color: '#991B1B',
        borderColor: '#991B1B',
        bgColor: 'bg-red-200 text-red-900',
        isFinal: true,
        sortOrder: 10
      }
    ];

    for (const statusData of newStatuses) {
      const existing = await this.statusRepository.findOne({ where: { slug: statusData.slug } });
      if (!existing) {
        await this.statusRepository.save(this.statusRepository.create(statusData));
      }
    }

    return { message: '✅ Estados FHIR actualizados correctamente', statuses: await this.getStatuses() };
  }

  private async getCancelledStatusIds(): Promise<string[]> {
    const cancelledStatuses = await this.statusRepository.find({
      where: { slug: 'cancelled' }
    });
    return cancelledStatuses.map(status => status.id);
  }

  // Estadísticas
  async getStats() {
    const totalAppointments = await this.appointmentRepository.count();
    const todayStart = new Date();
    todayStart.setHours(0, 0, 0, 0);
    const todayEnd = new Date();
    todayEnd.setHours(23, 59, 59, 999);
    
    const todayAppointments = await this.appointmentRepository.count({
      where: {
        startTime: Between(todayStart, todayEnd)
      }
    });

    const statusStats = await this.appointmentRepository
      .createQueryBuilder('appointment')
      .leftJoin('appointment.status', 'status')
      .select('status.label', 'status')
      .addSelect('COUNT(*)', 'count')
      .groupBy('status.id')
      .getRawMany();

    return {
      totalAppointments,
      todayAppointments,
      statusStats: statusStats.reduce((acc, stat) => {
        acc[stat.status] = parseInt(stat.count);
        return acc;
      }, {})
    };
  }
}