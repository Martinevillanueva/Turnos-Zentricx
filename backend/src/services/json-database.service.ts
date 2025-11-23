import { Injectable, OnModuleInit } from '@nestjs/common';
import { promises as fs } from 'fs';
import { join } from 'path';
import { SimpleAppointment } from '../types/fhir.types';

export interface AppointmentsData {
  appointments: SimpleAppointment[];
  metadata: {
    version: string;
    lastUpdated: string;
    totalRecords: number;
  };
}

@Injectable()
export class JsonDatabaseService implements OnModuleInit {
  private readonly dbPath = join(process.cwd(), 'db');
  private readonly appointmentsFile = join(this.dbPath, 'appointments.json');

  async onModuleInit() {
    await this.ensureDbDirectory();
    await this.ensureAppointmentsFile();
  }

  /**
   * Asegurar que el directorio db existe
   */
  private async ensureDbDirectory(): Promise<void> {
    try {
      await fs.access(this.dbPath);
    } catch {
      await fs.mkdir(this.dbPath, { recursive: true });
    }
  }

  /**
   * Asegurar que el archivo appointments.json existe
   */
  private async ensureAppointmentsFile(): Promise<void> {
    try {
      await fs.access(this.appointmentsFile);
    } catch {
      const initialData: AppointmentsData = {
        appointments: [],
        metadata: {
          version: '1.0',
          lastUpdated: new Date().toISOString(),
          totalRecords: 0
        }
      };
      await this.writeAppointments(initialData);
    }
  }

  /**
   * Leer todos los appointments del archivo JSON
   */
  async readAppointments(): Promise<AppointmentsData> {
    try {
      const data = await fs.readFile(this.appointmentsFile, 'utf-8');
      return JSON.parse(data);
    } catch (error) {
      console.error('Error reading appointments file:', error);
      // Retornar estructura vacía en caso de error
      return {
        appointments: [],
        metadata: {
          version: '1.0',
          lastUpdated: new Date().toISOString(),
          totalRecords: 0
        }
      };
    }
  }

  /**
   * Escribir appointments al archivo JSON
   */
  async writeAppointments(data: AppointmentsData): Promise<void> {
    try {
      // Actualizar metadata
      data.metadata.lastUpdated = new Date().toISOString();
      data.metadata.totalRecords = data.appointments.length;

      const jsonData = JSON.stringify(data, null, 2);
      await fs.writeFile(this.appointmentsFile, jsonData, 'utf-8');
    } catch (error) {
      console.error('Error writing appointments file:', error);
      throw new Error('No se pudo guardar el archivo de turnos');
    }
  }

  /**
   * Agregar un appointment
   */
  async addAppointment(appointment: SimpleAppointment): Promise<SimpleAppointment> {
    const data = await this.readAppointments();
    data.appointments.push(appointment);
    await this.writeAppointments(data);
    return appointment;
  }

  /**
   * Actualizar un appointment
   */
  async updateAppointment(id: string, updatedAppointment: SimpleAppointment): Promise<SimpleAppointment | null> {
    const data = await this.readAppointments();
    const index = data.appointments.findIndex(app => app.id === id);
    
    if (index === -1) {
      return null;
    }

    data.appointments[index] = updatedAppointment;
    await this.writeAppointments(data);
    return updatedAppointment;
  }

  /**
   * Eliminar un appointment
   */
  async deleteAppointment(id: string): Promise<boolean> {
    const data = await this.readAppointments();
    const initialLength = data.appointments.length;
    data.appointments = data.appointments.filter(app => app.id !== id);
    
    if (data.appointments.length < initialLength) {
      await this.writeAppointments(data);
      return true;
    }
    
    return false;
  }

  /**
   * Buscar appointment por ID
   */
  async findAppointmentById(id: string): Promise<SimpleAppointment | null> {
    const data = await this.readAppointments();
    return data.appointments.find(app => app.id === id) || null;
  }

  /**
   * Obtener todos los appointments
   */
  async getAllAppointments(): Promise<SimpleAppointment[]> {
    const data = await this.readAppointments();
    return data.appointments;
  }

  /**
   * Crear backup del archivo
   */
  async createBackup(): Promise<string> {
    const timestamp = new Date().toISOString().replace(/[:.]/g, '-');
    const backupFile = join(this.dbPath, `appointments-backup-${timestamp}.json`);
    
    try {
      await fs.copyFile(this.appointmentsFile, backupFile);
      return backupFile;
    } catch (error) {
      console.error('Error creating backup:', error);
      throw new Error('No se pudo crear el backup');
    }
  }
}