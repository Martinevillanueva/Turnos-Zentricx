import { Injectable, NotFoundException } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository, Like } from 'typeorm';
import { Patient } from '../entities';
import { CreatePatientDto } from '../dto/create-patient.dto';

export interface PatientFilters {
  page?: number;
  limit?: number;
  search?: string;
}

export interface PaginatedPatients {
  patients: Patient[];
  total: number;
  page: number;
  limit: number;
  totalPages: number;
}

@Injectable()
export class PatientsService {
  constructor(
    @InjectRepository(Patient)
    private readonly patientRepository: Repository<Patient>,
  ) {}

  async findAllPaginated(filters: PatientFilters = {}): Promise<PaginatedPatients> {
    const page = filters.page || 1;
    const limit = filters.limit || 20;
    const offset = (page - 1) * limit;

    const query = this.patientRepository.createQueryBuilder('patient');

    // Solo mostrar pacientes activos por defecto
    query.where('patient.isActive = :isActive', { isActive: true });

    if (filters.search && filters.search.trim()) {
      const searchTerm = `%${filters.search.toLowerCase()}%`;
      query.andWhere(
        '(LOWER(patient.firstName) LIKE :searchTerm OR ' +
        'LOWER(patient.lastName) LIKE :searchTerm OR ' +
        'LOWER(patient.documentNumber) LIKE :searchTerm OR ' +
        'LOWER(patient.email) LIKE :searchTerm OR ' +
        "LOWER(CONCAT(patient.firstName, ' ', patient.lastName)) LIKE :searchTerm)",
        { searchTerm }
      );
    }

    query
      .orderBy('patient.lastName', 'ASC')
      .addOrderBy('patient.firstName', 'ASC')
      .offset(offset)
      .limit(limit);

    const [patients, total] = await query.getManyAndCount();
    const totalPages = Math.ceil(total / limit);

    return {
      patients,
      total,
      page,
      limit,
      totalPages,
    };
  }

  async create(createPatientDto: CreatePatientDto): Promise<Patient> {
    // Verificar si ya existe un paciente con el mismo número de documento
    const existingPatient = await this.patientRepository.findOne({
      where: { documentNumber: createPatientDto.documentNumber }
    });
    
    if (existingPatient) {
      throw new Error(`Ya existe un paciente con el DNI ${createPatientDto.documentNumber}`);
    }
    
    // Verificar si ya existe un paciente con el mismo email (si se proporciona)
    if (createPatientDto.email?.trim()) {
      const existingEmail = await this.patientRepository.findOne({
        where: { email: createPatientDto.email }
      });
      
      if (existingEmail) {
        throw new Error(`Ya existe un paciente con el email ${createPatientDto.email}`);
      }
    }
    
    try {
      const patient = this.patientRepository.create(createPatientDto);
      return await this.patientRepository.save(patient);
    } catch (error) {
      console.error('Error saving patient:', error);
      throw new Error('Error al guardar el paciente en la base de datos');
    }
  }

  async findOne(id: string): Promise<Patient> {
    const patient = await this.patientRepository.findOne({ where: { id } });
    if (!patient) {
      throw new NotFoundException(`Patient with ID ${id} not found`);
    }
    return patient;
  }

  private async validateUniqueDocument(documentNumber: string, excludeId: string): Promise<void> {
    const existingPatient = await this.patientRepository.findOne({
      where: { documentNumber }
    });
    
    if (existingPatient && existingPatient.id !== excludeId) {
      throw new Error(`Ya existe un paciente con el DNI ${documentNumber}`);
    }
  }

  private async validateUniqueEmail(email: string, excludeId: string): Promise<void> {
    if (!email?.trim()) return;
    
    const existingEmail = await this.patientRepository.findOne({
      where: { email }
    });
    
    if (existingEmail && existingEmail.id !== excludeId) {
      throw new Error(`Ya existe un paciente con el email ${email}`);
    }
  }

  private updatePatientFields(patient: Patient, updateData: Partial<CreatePatientDto>): void {
    const allowedFields = new Set([
      'firstName', 'lastName', 'documentNumber', 'phone', 
      'email', 'birthDate', 'gender', 'address', 
      'emergencyContact', 'emergencyPhone', 'medicalNotes', 'isActive'
    ]);
    
    for (const key of Object.keys(updateData)) {
      if (allowedFields.has(key) && updateData[key] !== undefined) {
        patient[key] = updateData[key];
      }
    }
  }

  async update(id: string, updatePatientDto: Partial<CreatePatientDto>): Promise<Patient> {
    try {
      // Buscar el paciente existente
      const patient = await this.findOne(id);
      
      // Validar duplicados si se están actualizando
      if (updatePatientDto.documentNumber && updatePatientDto.documentNumber !== patient.documentNumber) {
        await this.validateUniqueDocument(updatePatientDto.documentNumber, id);
      }
      
      // Validar email solo si cambió (normalizar comparación)
      if (updatePatientDto.email) {
        const newEmail = updatePatientDto.email.trim().toLowerCase();
        const currentEmail = (patient.email || '').trim().toLowerCase();
        
        if (newEmail && newEmail !== currentEmail) {
          await this.validateUniqueEmail(updatePatientDto.email, id);
        }
      }
      
      // Actualizar campos
      this.updatePatientFields(patient, updatePatientDto);
      
      // Guardar cambios
      return await this.patientRepository.save(patient);
      
    } catch (error) {
      console.error('Error updating patient:', error);
      
      // Re-throw errors de validación
      if (error.message?.includes('Ya existe')) {
        throw error;
      }
      
      // Re-throw NotFoundException
      if (error instanceof NotFoundException) {
        throw error;
      }
      
      // Para otros errores de base de datos
      throw new Error('Error al actualizar el paciente en la base de datos');
    }
  }

  async remove(id: string): Promise<void> {
    const patient = await this.findOne(id);
    await this.patientRepository.remove(patient);
  }

  async deactivate(id: string): Promise<Patient> {
    try {
      // Buscar el paciente existente
      const patient = await this.findOne(id);
      
      // Dar de baja al paciente
      patient.isActive = false;
      
      // Guardar cambios
      return await this.patientRepository.save(patient);
      
    } catch (error) {
      console.error('Error deactivating patient:', error);
      
      // Re-throw NotFoundException
      if (error instanceof NotFoundException) {
        throw error;
      }
      
      // Para otros errores de base de datos
      throw new Error('Error al dar de baja el paciente');
    }
  }

  async findByDocumentNumber(documentNumber: string): Promise<Patient | null> {
    return this.patientRepository.findOne({ 
      where: { 
        documentNumber,
        isActive: true 
      } 
    });
  }

  async findByEmail(email: string): Promise<Patient | null> {
    if (!email) return null;
    return this.patientRepository.findOne({ 
      where: { 
        email,
        isActive: true 
      } 
    });
  }
}