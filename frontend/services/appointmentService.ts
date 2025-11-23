import axios from 'axios';
import { 
  SimpleAppointment, 
  CreateAppointmentRequest
} from '@/types/fhir';
import { SqliteAppointment, sqliteAppointmentToFhir } from '@/types/sqlite';

// Interfaces para autocomplete
export interface Doctor {
  id: string;
  firstName: string;
  lastName: string;
  licenseNumber: string;
  phone?: string;
  email?: string;
  isActive: boolean;
  fullName?: string;
  specialty?: {
    id: string;
    name: string;
  };
  specialtyId?: string;
}

export interface Patient {
  id: string;
  firstName: string;
  lastName: string;
  documentNumber: string;
  phone?: string;
  email?: string;
  birthDate?: Date;
  gender?: string;
  address?: string;
  emergencyContact?: string;
  emergencyPhone?: string;
  medicalNotes?: string;
  isActive: boolean;
  fullName?: string;
}

const BASE_URL = process.env.NEXT_PUBLIC_BACKEND_URL || 'http://localhost:4000';

const apiClient = axios.create({
  baseURL: `${BASE_URL}/api`,
  headers: {
    'Content-Type': 'application/json',
  },
});

export class AppointmentService {
  /**
   * Busca médicos por nombre para autocomplete
   */
  static async searchDoctors(query: string): Promise<Doctor[]> {
    try {
      if (!query.trim()) return [];
      
      const response = await apiClient.get<Doctor[]>(`/appointments/doctors?search=${encodeURIComponent(query)}`);
      return response.data;
    } catch (error: unknown) {
      console.error('Error searching doctors:', error);
      return [];
    }
  }

  /**
   * Busca pacientes por nombre para autocomplete
   */
  static async searchPatients(query: string): Promise<Patient[]> {
    try {
      if (!query.trim()) return [];
      
      const response = await apiClient.get<Patient[]>(`/appointments/patients?search=${encodeURIComponent(query)}`);
      return response.data;
    } catch (error: unknown) {
      console.error('Error searching patients:', error);
      return [];
    }
  }

  /**
   * Obtiene todos los médicos
   */
  static async getDoctors(): Promise<Doctor[]> {
    try {
      const response = await apiClient.get<Doctor[]>('/appointments/doctors');
      return response.data;
    } catch (error: unknown) {
      console.error('Error fetching doctors:', error);
      return [];
    }
  }

  /**
   * Obtiene todos los pacientes
   */
  static async getPatients(): Promise<Patient[]> {
    try {
      const response = await apiClient.get<Patient[]>('/appointments/patients');
      return response.data;
    } catch (error: unknown) {
      console.error('Error fetching patients:', error);
      return [];
    }
  }
  static async getAppointments(filters?: { doctorId?: string; specialtyId?: string; date?: string }): Promise<SimpleAppointment[]> {
    try {
      const params = new URLSearchParams();
      if (filters?.doctorId) params.append('doctorId', filters.doctorId);
      if (filters?.specialtyId) params.append('specialtyId', filters.specialtyId);
      if (filters?.date) params.append('date', filters.date);

      const queryString = params.toString();
      const url = queryString ? `/appointments?${queryString}` : '/appointments';
      
      const response = await apiClient.get<SqliteAppointment[]>(url);
      
      // Convertir de SQLite a formato FHIR compatible
      return response.data.map(sqliteAppointmentToFhir);
    } catch (error: unknown) {
      console.error('Error fetching appointments:', error);
      throw new Error('No se pudieron cargar los turnos');
    }
  }

  static async getAppointmentsPaginated(filters?: { 
    doctorId?: string; 
    specialtyId?: string; 
    statusIds?: string; // String separado por comas
    date?: string;
    page?: number;
    limit?: number;
    // FHIR R4 Parameters
    appointmentType?: string;
    priority?: string;
    reasonCode?: string;
    actor?: string;
    practitioner?: string;
    identifier?: string;
    serviceCategory?: string;
    serviceType?: string;
    slot?: string;
  }): Promise<{
    appointments: SimpleAppointment[];
    total: number;
    page: number;
    limit: number;
    totalPages: number;
  }> {
    try {
      const params = new URLSearchParams();
      if (filters?.doctorId) params.append('doctorId', filters.doctorId);
      if (filters?.specialtyId) params.append('specialtyId', filters.specialtyId);
      if (filters?.statusIds) params.append('statusIds', filters.statusIds);
      if (filters?.date) params.append('date', filters.date);
      if (filters?.page) params.append('page', filters.page.toString());
      if (filters?.limit) params.append('limit', filters.limit.toString());
      
      // FHIR R4 Parameters
      if (filters?.appointmentType) params.append('appointment-type', filters.appointmentType);
      if (filters?.priority) params.append('priority', filters.priority);
      if (filters?.reasonCode) params.append('reason-code', filters.reasonCode);
      if (filters?.actor) params.append('actor', filters.actor);
      if (filters?.practitioner) params.append('practitioner', filters.practitioner);
      if (filters?.identifier) params.append('identifier', filters.identifier);
      if (filters?.serviceCategory) params.append('service-category', filters.serviceCategory);
      if (filters?.serviceType) params.append('service-type', filters.serviceType);
      if (filters?.slot) params.append('slot', filters.slot);

      const queryString = params.toString();
      const url = queryString ? `/appointments/paginated?${queryString}` : '/appointments/paginated';
      
      const response = await apiClient.get<{
        appointments: SqliteAppointment[];
        total: number;
        page: number;
        limit: number;
        totalPages: number;
      }>(url);
      
      // Convertir de SQLite a formato FHIR compatible
      return {
        ...response.data,
        appointments: response.data.appointments.map(sqliteAppointmentToFhir)
      };
    } catch (error: unknown) {
      console.error('Error fetching paginated appointments:', error);
      throw new Error('No se pudieron cargar los turnos');
    }
  }

  /**
   * Busca un doctor por nombre y devuelve su ID
   */
  static async findDoctorIdByName(doctorName: string): Promise<string | null> {
    try {
      const doctors = await this.searchDoctors(doctorName);
      const exactMatch = doctors.find(doctor => 
        (doctor.fullName || `Dr. ${doctor.firstName} ${doctor.lastName}`) === doctorName
      );
      return exactMatch?.id || null;
    } catch (error) {
      console.error('Error finding doctor by name:', error);
      return null;
    }
  }

  /**
   * Busca una especialidad por nombre y devuelve su ID
   */
  static async findSpecialtyIdByName(specialtyName: string): Promise<string | null> {
    try {
      const specialties = await this.getSpecialties();
      const exactMatch = specialties.find((specialty: any) => 
        specialty.name === specialtyName
      );
      return exactMatch?.id || null;
    } catch (error) {
      console.error('Error finding specialty by name:', error);
      return null;
    }
  }

  /**
   * Crea un nuevo turno (versión simplificada usando IDs directos)
   */
  static async createAppointmentWithIds(
    appointmentData: CreateAppointmentRequest,
    doctorId: string,
    specialtyId?: string
  ): Promise<SimpleAppointment> {
    try {
      const startDate = new Date(appointmentData.start);
      
      // Verificar que la fecha sea válida
      if (Number.isNaN(startDate.getTime())) {
        throw new TypeError('Formato de fecha de inicio inválido');
      }

      const backendData = {
        startTime: startDate.toISOString(), // Enviar como ISO string
        doctorId: doctorId,
        specialtyId: specialtyId || '1', // ID por defecto si no hay especialidad
        reason: appointmentData.description || '',
        contactPhone: '',
        contactEmail: '',
        // FHIR R4 Compliance Fields
        priority: appointmentData.priority || 5,
        appointmentType: appointmentData.appointmentType || 'routine',
        serviceType: appointmentData.serviceType || undefined,
        patientInstruction: appointmentData.patientInstruction || undefined,
        // Si no tenemos patientId, crear paciente inline
        patientData: {
          firstName: appointmentData.patientName.split(' ')[0] || '',
          lastName: appointmentData.patientName.split(' ').slice(1).join(' ') || '',
          documentNumber: 'TEMP-' + Date.now(),
          phone: '',
          email: ''
        }
      };
      
      const response = await apiClient.post<SqliteAppointment>(
        '/appointments', 
        backendData
      );
      
      const transformedAppointment = sqliteAppointmentToFhir(response.data);
      
      return transformedAppointment;
    } catch (error: unknown) {
      console.error('Error creating appointment:', error);
      if (axios.isAxiosError(error) && error.response) {
        console.error('Backend response:', error.response.data);
        // Lanzar el error completo del backend para que se maneje en el frontend
        throw error.response.data || new Error('Error al crear el turno');
      }
      throw new Error('No se pudo crear el turno');
    }
  }

  /**
   * Crea un nuevo turno
   */
  static async createAppointment(
    appointmentData: CreateAppointmentRequest
  ): Promise<SimpleAppointment> {
    try {
      const startDate = new Date(appointmentData.start);
      
      // Verificar que la fecha sea válida
      if (Number.isNaN(startDate.getTime())) {
        throw new TypeError('Formato de fecha de inicio inválido');
      }

      const backendData = {
        startTime: startDate.toISOString(), // Enviar como ISO string
        doctorId: '1', // ID por defecto para debuggear
        specialtyId: '1', // ID por defecto para debuggear
        reason: appointmentData.description || '',
        contactPhone: '',
        contactEmail: '',
        // Si no tenemos patientId, crear paciente inline
        patientData: {
          firstName: appointmentData.patientName.split(' ')[0] || '',
          lastName: appointmentData.patientName.split(' ').slice(1).join(' ') || '',
          documentNumber: 'TEMP-' + Date.now(),
          phone: '',
          email: ''
        }
      };
      
      const response = await apiClient.post<SqliteAppointment>(
        '/appointments', 
        backendData
      );
      
      const transformedData = sqliteAppointmentToFhir(response.data);
      
      return transformedData;
    } catch (error: unknown) {
      console.error('Error creating appointment:', error);
      
      if (axios.isAxiosError(error)) {
        if (error.response?.status === 200 || error.response?.status === 201) {
          throw new Error('El turno se creó pero hubo un error procesando la respuesta');
        }
        
        throw new Error(error.response?.data?.message || 'Error al crear el turno en el servidor');
      }
      
      throw new Error('No se pudo crear el turno');
    }
  }

  /**
   * Obtiene un turno por ID
   */
  static async getAppointmentById(id: string): Promise<SimpleAppointment | null> {
    try {
      const response = await apiClient.get<SqliteAppointment>(`/appointments/${id}`);
      return sqliteAppointmentToFhir(response.data);
    } catch (error: unknown) {
      console.error('Error fetching appointment:', error);
      return null;
    }
  }

  /**
   * Actualiza el estado de un turno
   */
  static async updateAppointmentStatus(
    id: string, 
    status: string
  ): Promise<SimpleAppointment> {
    try {
      // Primero obtener el ID real del estado basado en el slug
      const statuses = await this.getStatuses();
      const statusObject = statuses.find((s: any) => s.slug === status);
      
      if (!statusObject) {
        throw new Error(`Estado '${status}' no encontrado`);
      }

      const response = await apiClient.patch<SqliteAppointment>(
        `/appointments/${id}/status`, 
        { statusId: statusObject.id } // Usar el ID real del estado
      );
      return sqliteAppointmentToFhir(response.data);
    } catch (error: unknown) {
      console.error('Error updating appointment status:', error);
      if (axios.isAxiosError(error) && error.response) {
        console.error('Backend response:', error.response.data);
        throw new Error(error.response.data?.message || 'Error al actualizar el estado del turno');
      }
      throw new Error('No se pudo actualizar el estado del turno');
    }
  }

  /**
   * Crea un nuevo paciente
   */
  static async createPatient(
    patientData: {
      firstName: string;
      lastName: string;
      documentNumber: string;
      phone?: string;
      email?: string;
      birthDate?: string;
      gender?: string;
      address?: string;
    }
  ): Promise<Patient> {
    try {
      const response = await apiClient.post<Patient>(
        '/appointments/patients',
        patientData
      );
      return response.data;
    } catch (error: unknown) {
      console.error('Error creating patient:', error);
      if (axios.isAxiosError(error) && error.response) {
        throw new Error(error.response.data?.message || 'Error al crear el paciente');
      }
      throw new Error('No se pudo crear el paciente');
    }
  }

  /**
   * Obtiene lista de especialidades
   */
  static async getSpecialties() {
    try {
      const response = await apiClient.get('/appointments/specialties');
      return response.data;
    } catch (error: unknown) {
      console.error('Error fetching specialties:', error);
      return [];
    }
  }

  /**
   * Obtiene lista de estados
   */
  static async getStatuses() {
    try {
      const response = await apiClient.get('/appointments/statuses');
      return response.data;
    } catch (error: unknown) {
      console.error('Error fetching statuses:', error);
      return [];
    }
  }

  /**
   * Obtiene el mapa de estados (slug -> id)
   */
  static async getStatusMap(): Promise<Record<string, string>> {
    try {
      const response = await apiClient.get('/appointments/status-map');
      return response.data;
    } catch (error: unknown) {
      console.error('Error fetching status map:', error);
      return {};
    }
  }

  /**
   * Verifica si hay conflictos de horario para un turno
   */
  static async checkAppointmentConflicts(
    doctorId: string,
    specialtyId: string,
    startDate: Date,
    endDate: Date,
    excludeAppointmentId?: string
  ): Promise<{ hasConflict: boolean; conflictingAppointment?: SimpleAppointment }> {
    try {
      // Obtener turnos para la fecha específica del doctor y especialidad
      const dateStr = startDate.toISOString().split('T')[0]; // YYYY-MM-DD
      const appointments = await this.getAppointments({
        doctorId,
        specialtyId,
        date: dateStr
      });

      // Filtrar turnos que no estén cancelados y que no sean el turno que estamos editando
      const activeAppointments = appointments.filter(apt => {
        if (excludeAppointmentId && apt.id === excludeAppointmentId) return false;
        return apt.status?.slug !== 'cancelled' && apt.status !== 'cancelled';
      });

      // Verificar si hay solapamiento de horarios
      for (const appointment of activeAppointments) {
        const aptStart = new Date(appointment.start);
        const aptEnd = new Date(appointment.end);

        // Verificar si los intervalos se solapan
        const hasOverlap = (
          (startDate >= aptStart && startDate < aptEnd) || // Nuevo turno comienza durante un turno existente
          (endDate > aptStart && endDate <= aptEnd) ||     // Nuevo turno termina durante un turno existente
          (startDate <= aptStart && endDate >= aptEnd)      // Nuevo turno engloba completamente un turno existente
        );

        if (hasOverlap) {
          return {
            hasConflict: true,
            conflictingAppointment: appointment
          };
        }
      }

      return { hasConflict: false };
    } catch (error: unknown) {
      console.error('Error checking appointment conflicts:', error);
      // En caso de error, asumir que no hay conflicto para no bloquear la creación
      return { hasConflict: false };
    }
  }
}

export default AppointmentService;