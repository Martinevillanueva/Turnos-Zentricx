import { Injectable, OnModuleInit } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository } from 'typeorm';
import { AppointmentStatus, Doctor, Patient, Specialty, Appointment } from '../entities';

@Injectable()
export class SeedService implements OnModuleInit {
  constructor(
    @InjectRepository(AppointmentStatus)
    private statusRepository: Repository<AppointmentStatus>,
    
    @InjectRepository(Doctor)
    private doctorRepository: Repository<Doctor>,
    
    @InjectRepository(Patient)
    private patientRepository: Repository<Patient>,
    
    @InjectRepository(Specialty)
    private specialtyRepository: Repository<Specialty>,

    @InjectRepository(Appointment)
    private readonly appointmentRepository: Repository<Appointment>,
  ) {}

  async onModuleInit() {
    await this.seedStatuses();
    await this.seedSpecialties();
    await this.seedDoctors();
    await this.seedPatients();
    await this.seedAppointments();
  }

  private async seedStatuses() {
    const count = await this.statusRepository.count();
    if (count > 0) return; // Ya hay datos

    const statuses = [
      {
        name: 'pending',
        slug: 'pending',
        label: 'Pendiente',
        color: '#F59E0B',
        borderColor: '#F59E0B',
        bgColor: 'bg-yellow-100 text-yellow-800',
        sortOrder: 1
      },
      {
        name: 'booked',
        slug: 'booked',
        label: 'Confirmado',
        color: '#3B82F6',
        borderColor: '#3B82F6',
        bgColor: 'bg-blue-100 text-blue-800',
        sortOrder: 2
      },
      {
        name: 'arrived',
        slug: 'arrived',
        label: 'Llegó',
        color: '#10B981',
        borderColor: '#10B981',
        bgColor: 'bg-green-100 text-green-800',
        sortOrder: 3
      },
      {
        name: 'in-consultation',
        slug: 'in-consultation',
        label: 'En consulta',
        color: '#F97316',
        borderColor: '#F97316',
        bgColor: 'bg-orange-100 text-orange-800 animate-pulse',
        sortOrder: 4
      },
      {
        name: 'fulfilled',
        slug: 'fulfilled',
        label: 'Completado',
        color: '#059669',
        borderColor: '#059669',
        bgColor: 'bg-emerald-100 text-emerald-800',
        isFinal: true,
        sortOrder: 5
      },
      {
        name: 'cancelled',
        slug: 'cancelled',
        label: 'Cancelado',
        color: '#DC2626',
        borderColor: '#DC2626',
        bgColor: 'bg-red-100 text-red-800',
        isFinal: true,
        sortOrder: 6
      },
      {
        name: 'noshow',
        slug: 'noshow',
        label: 'No se presentó',
        color: '#F97316',
        borderColor: '#F97316',
        bgColor: 'bg-orange-100 text-orange-800',
        isFinal: true,
        sortOrder: 7
      },
      // Estados FHIR R4 adicionales
      {
        name: 'checked-in',
        slug: 'checked-in',
        label: 'Check-in realizado',
        color: '#8B5CF6',
        borderColor: '#8B5CF6',
        bgColor: 'bg-purple-100 text-purple-800',
        sortOrder: 8
      },
      {
        name: 'waitlist',
        slug: 'waitlist',
        label: 'Lista de espera',
        color: '#6B7280',
        borderColor: '#6B7280',
        bgColor: 'bg-gray-100 text-gray-800',
        sortOrder: 9
      },
      {
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

    for (const statusData of statuses) {
      await this.statusRepository.save(this.statusRepository.create(statusData));
    }
  }

  private async seedSpecialties() {
    const count = await this.specialtyRepository.count();
    if (count > 0) return;

    const specialties = [
      {
        name: 'Medicina General',
        description: 'Atención médica general y preventiva',
        color: '#3B82F6',
        defaultDuration: 30
      },
      {
        name: 'Cardiología',
        description: 'Especialista en enfermedades del corazón',
        color: '#DC2626',
        defaultDuration: 45
      },
      {
        name: 'Dermatología',
        description: 'Cuidado de la piel y enfermedades cutáneas',
        color: '#F59E0B',
        defaultDuration: 30
      },
      {
        name: 'Neurología',
        description: 'Especialista en sistema nervioso',
        color: '#8B5CF6',
        defaultDuration: 60
      },
      {
        name: 'Pediatría',
        description: 'Atención médica infantil',
        color: '#10B981',
        defaultDuration: 30
      },
      {
        name: 'Ginecología',
        description: 'Salud femenina y reproductiva',
        color: '#EC4899',
        defaultDuration: 45
      },
      {
        name: 'Traumatología',
        description: 'Lesiones y enfermedades del sistema musculoesquelético',
        color: '#6B7280',
        defaultDuration: 45
      }
    ];

    for (const specialtyData of specialties) {
      await this.specialtyRepository.save(this.specialtyRepository.create(specialtyData));
    }
  }

  private async seedDoctors() {
    const count = await this.doctorRepository.count();
    if (count > 0) return;

    const specialties = await this.specialtyRepository.find();
    if (specialties.length === 0) {
      console.warn('⚠️ No hay especialidades para asignar a los médicos');
      return;
    }

    const doctors = [
      // Medicina General (3 doctores)
      {
        firstName: 'Ana María',
        lastName: 'González',
        licenseNumber: 'MP001234',
        phone: '+54 9 11 1234-5678',
        email: 'ana.gonzalez@hospital.com',
        specialty: specialties.find(s => s.name === 'Medicina General') || specialties[0]
      },
      {
        firstName: 'Roberto',
        lastName: 'Silva',
        licenseNumber: 'MP001235',
        phone: '+54 9 11 1234-5679',
        email: 'roberto.silva@hospital.com',
        specialty: specialties.find(s => s.name === 'Medicina General') || specialties[0]
      },
      {
        firstName: 'Laura',
        lastName: 'Benítez',
        licenseNumber: 'MP001236',
        phone: '+54 9 11 1234-5680',
        email: 'laura.benitez@hospital.com',
        specialty: specialties.find(s => s.name === 'Medicina General') || specialties[0]
      },
      // Cardiología (3 doctores)
      {
        firstName: 'Carlos',
        lastName: 'Rodríguez',
        licenseNumber: 'MP005678',
        phone: '+54 9 11 2345-6789',
        email: 'carlos.rodriguez@hospital.com',
        specialty: specialties.find(s => s.name === 'Cardiología') || specialties[1]
      },
      {
        firstName: 'Patricia',
        lastName: 'Morales',
        licenseNumber: 'MP005679',
        phone: '+54 9 11 2345-6790',
        email: 'patricia.morales@hospital.com',
        specialty: specialties.find(s => s.name === 'Cardiología') || specialties[1]
      },
      {
        firstName: 'Eduardo',
        lastName: 'Campos',
        licenseNumber: 'MP005680',
        phone: '+54 9 11 2345-6791',
        email: 'eduardo.campos@hospital.com',
        specialty: specialties.find(s => s.name === 'Cardiología') || specialties[1]
      },
      // Dermatología (2 doctores)
      {
        firstName: 'María Elena',
        lastName: 'Fernández',
        licenseNumber: 'MP009876',
        phone: '+54 9 11 3456-7890',
        email: 'maria.fernandez@hospital.com',
        specialty: specialties.find(s => s.name === 'Dermatología') || specialties[2]
      },
      {
        firstName: 'Javier',
        lastName: 'Ruiz',
        licenseNumber: 'MP009877',
        phone: '+54 9 11 3456-7891',
        email: 'javier.ruiz@hospital.com',
        specialty: specialties.find(s => s.name === 'Dermatología') || specialties[2]
      },
      // Neurología (3 doctores)
      {
        firstName: 'Roberto',
        lastName: 'Martínez',
        licenseNumber: 'MP005432',
        phone: '+54 9 11 4567-8901',
        email: 'roberto.martinez@hospital.com',
        specialty: specialties.find(s => s.name === 'Neurología') || specialties[3]
      },
      {
        firstName: 'Sofía',
        lastName: 'Vargas',
        licenseNumber: 'MP005433',
        phone: '+54 9 11 4567-8902',
        email: 'sofia.vargas@hospital.com',
        specialty: specialties.find(s => s.name === 'Neurología') || specialties[3]
      },
      {
        firstName: 'Diego',
        lastName: 'Peralta',
        licenseNumber: 'MP005434',
        phone: '+54 9 11 4567-8903',
        email: 'diego.peralta@hospital.com',
        specialty: specialties.find(s => s.name === 'Neurología') || specialties[3]
      },
      // Pediatría (3 doctores)
      {
        firstName: 'Gabriela',
        lastName: 'Romero',
        licenseNumber: 'MP007890',
        phone: '+54 9 11 5678-9012',
        email: 'gabriela.romero@hospital.com',
        specialty: specialties.find(s => s.name === 'Pediatría') || specialties[4]
      },
      {
        firstName: 'Fernando',
        lastName: 'Castro',
        licenseNumber: 'MP007891',
        phone: '+54 9 11 5678-9013',
        email: 'fernando.castro@hospital.com',
        specialty: specialties.find(s => s.name === 'Pediatría') || specialties[4]
      },
      {
        firstName: 'Valeria',
        lastName: 'Sosa',
        licenseNumber: 'MP007892',
        phone: '+54 9 11 5678-9014',
        email: 'valeria.sosa@hospital.com',
        specialty: specialties.find(s => s.name === 'Pediatría') || specialties[4]
      },
      // Ginecología (3 doctores)
      {
        firstName: 'Claudia',
        lastName: 'Méndez',
        licenseNumber: 'MP008901',
        phone: '+54 9 11 6789-0123',
        email: 'claudia.mendez@hospital.com',
        specialty: specialties.find(s => s.name === 'Ginecología') || specialties[5]
      },
      {
        firstName: 'Marcela',
        lastName: 'Acosta',
        licenseNumber: 'MP008902',
        phone: '+54 9 11 6789-0124',
        email: 'marcela.acosta@hospital.com',
        specialty: specialties.find(s => s.name === 'Ginecología') || specialties[5]
      },
      {
        firstName: 'Raúl',
        lastName: 'Torres',
        licenseNumber: 'MP008903',
        phone: '+54 9 11 6789-0125',
        email: 'raul.torres@hospital.com',
        specialty: specialties.find(s => s.name === 'Ginecología') || specialties[5]
      },
      // Traumatología (3 doctores)
      {
        firstName: 'Martín',
        lastName: 'Herrera',
        licenseNumber: 'MP009012',
        phone: '+54 9 11 7890-1234',
        email: 'martin.herrera@hospital.com',
        specialty: specialties.find(s => s.name === 'Traumatología') || specialties[6]
      },
      {
        firstName: 'Andrea',
        lastName: 'Navarro',
        licenseNumber: 'MP009013',
        phone: '+54 9 11 7890-1235',
        email: 'andrea.navarro@hospital.com',
        specialty: specialties.find(s => s.name === 'Traumatología') || specialties[6]
      },
      {
        firstName: 'Pablo',
        lastName: 'Domínguez',
        licenseNumber: 'MP009014',
        phone: '+54 9 11 7890-1236',
        email: 'pablo.dominguez@hospital.com',
        specialty: specialties.find(s => s.name === 'Traumatología') || specialties[6]
      }
    ];

    for (const doctorData of doctors) {
      await this.doctorRepository.save(this.doctorRepository.create(doctorData));
    }
  }

  private async seedPatients() {
    const count = await this.patientRepository.count();
    if (count > 0) return;

    const patients = [
      { firstName: 'Juan', lastName: 'Pérez', documentNumber: '12345678', phone: '+54 9 11 1111-1111', email: 'juan.perez@email.com', birthDate: new Date('1985-03-15'), gender: 'M', address: 'Av. Corrientes 1234, CABA' },
      { firstName: 'María', lastName: 'López', documentNumber: '23456789', phone: '+54 9 11 2222-2222', email: 'maria.lopez@email.com', birthDate: new Date('1992-07-22'), gender: 'F', address: 'Av. Santa Fe 5678, CABA' },
      { firstName: 'Pedro', lastName: 'García', documentNumber: '34567890', phone: '+54 9 11 3333-3333', email: 'pedro.garcia@email.com', birthDate: new Date('1978-11-08'), gender: 'M', address: 'Av. Rivadavia 9876, CABA' },
      { firstName: 'Ana', lastName: 'Martín', documentNumber: '45678901', phone: '+54 9 11 4444-4444', email: 'ana.martin@email.com', birthDate: new Date('1988-12-03'), gender: 'F', address: 'Av. Cabildo 2468, CABA' },
      { firstName: 'Luis', lastName: 'Sánchez', documentNumber: '56789012', phone: '+54 9 11 5555-5555', email: 'luis.sanchez@email.com', birthDate: new Date('1995-05-17'), gender: 'M', address: 'Av. Callao 1357, CABA' },
      { firstName: 'Carmen', lastName: 'Díaz', documentNumber: '67890123', phone: '+54 9 11 6666-6666', email: 'carmen.diaz@email.com', birthDate: new Date('1990-09-12'), gender: 'F', address: 'Av. Libertador 3456, CABA' },
      { firstName: 'Jorge', lastName: 'Ramírez', documentNumber: '78901234', phone: '+54 9 11 7777-7777', email: 'jorge.ramirez@email.com', birthDate: new Date('1982-06-25'), gender: 'M', address: 'Av. Las Heras 7890, CABA' },
      { firstName: 'Silvia', lastName: 'Torres', documentNumber: '89012345', phone: '+54 9 11 8888-8888', email: 'silvia.torres@email.com', birthDate: new Date('1975-02-18'), gender: 'F', address: 'Av. Belgrano 4321, CABA' },
      { firstName: 'Ricardo', lastName: 'Flores', documentNumber: '90123456', phone: '+54 9 11 9999-9999', email: 'ricardo.flores@email.com', birthDate: new Date('1998-11-30'), gender: 'M', address: 'Av. Pueyrredón 6543, CABA' },
      { firstName: 'Patricia', lastName: 'Moreno', documentNumber: '01234567', phone: '+54 9 11 1010-1010', email: 'patricia.moreno@email.com', birthDate: new Date('1987-04-07'), gender: 'F', address: 'Av. Córdoba 8765, CABA' },
      { firstName: 'Martín', lastName: 'Herrera', documentNumber: '11234568', phone: '+54 9 11 1111-2222', email: 'martin.herrera@email.com', birthDate: new Date('1993-08-14'), gender: 'M', address: 'Av. Scalabrini Ortiz 2345, CABA' },
      { firstName: 'Laura', lastName: 'Castro', documentNumber: '22345679', phone: '+54 9 11 2222-3333', email: 'laura.castro@email.com', birthDate: new Date('1980-01-22'), gender: 'F', address: 'Av. Juan B. Justo 5432, CABA' },
      { firstName: 'Diego', lastName: 'Romero', documentNumber: '33456780', phone: '+54 9 11 3333-4444', email: 'diego.romero@email.com', birthDate: new Date('1991-10-05'), gender: 'M', address: 'Av. Medrano 1234, CABA' },
      { firstName: 'Claudia', lastName: 'Vargas', documentNumber: '44567891', phone: '+54 9 11 4444-5555', email: 'claudia.vargas@email.com', birthDate: new Date('1986-07-19'), gender: 'F', address: 'Av. Warnes 6789, CABA' },
      { firstName: 'Sebastián', lastName: 'Ruiz', documentNumber: '55678902', phone: '+54 9 11 5555-6666', email: 'sebastian.ruiz@email.com', birthDate: new Date('1994-03-28'), gender: 'M', address: 'Av. Corrientes 9876, CABA' },
      { firstName: 'Valeria', lastName: 'Navarro', documentNumber: '66789013', phone: '+54 9 11 6666-7777', email: 'valeria.navarro@email.com', birthDate: new Date('1989-12-11'), gender: 'F', address: 'Av. Triunvirato 2468, CABA' },
      { firstName: 'Fernando', lastName: 'Molina', documentNumber: '77890124', phone: '+54 9 11 7777-8888', email: 'fernando.molina@email.com', birthDate: new Date('1983-05-16'), gender: 'M', address: 'Av. Forest 1357, CABA' },
      { firstName: 'Gabriela', lastName: 'Sosa', documentNumber: '88901235', phone: '+54 9 11 8888-9999', email: 'gabriela.sosa@email.com', birthDate: new Date('1996-09-23'), gender: 'F', address: 'Av. Rivadavia 7531, CABA' },
      { firstName: 'Pablo', lastName: 'Méndez', documentNumber: '99012346', phone: '+54 9 11 9999-0000', email: 'pablo.mendez@email.com', birthDate: new Date('1981-02-08'), gender: 'M', address: 'Av. San Juan 3698, CABA' },
      { firstName: 'Andrea', lastName: 'Peralta', documentNumber: '10123457', phone: '+54 9 11 1010-1111', email: 'andrea.peralta@email.com', birthDate: new Date('1997-06-15'), gender: 'F', address: 'Av. Directorio 9514, CABA' },
      { firstName: 'Hernán', lastName: 'Acosta', documentNumber: '21234568', phone: '+54 9 11 2020-2222', email: 'hernan.acosta@email.com', birthDate: new Date('1984-11-27'), gender: 'M', address: 'Av. Acoyte 7412, CABA' },
      { firstName: 'Cecilia', lastName: 'Campos', documentNumber: '32345679', phone: '+54 9 11 3030-3333', email: 'cecilia.campos@email.com', birthDate: new Date('1999-04-03'), gender: 'F', address: 'Av. Carabobo 2587, CABA' },
      { firstName: 'Gustavo', lastName: 'Benítez', documentNumber: '43456780', phone: '+54 9 11 4040-4444', email: 'gustavo.benitez@email.com', birthDate: new Date('1976-08-20'), gender: 'M', address: 'Av. Gaona 4563, CABA' },
      { firstName: 'Mónica', lastName: 'Silva', documentNumber: '54567891', phone: '+54 9 11 5050-5555', email: 'monica.silva@email.com', birthDate: new Date('1988-01-09'), gender: 'F', address: 'Av. Nazca 8765, CABA' },
      { firstName: 'Facundo', lastName: 'Ortiz', documentNumber: '65678902', phone: '+54 9 11 6060-6666', email: 'facundo.ortiz@email.com', birthDate: new Date('2000-10-14'), gender: 'M', address: 'Av. Álvarez Jonte 3214, CABA' },
      { firstName: 'Natalia', lastName: 'Domínguez', documentNumber: '76789013', phone: '+54 9 11 7070-7777', email: 'natalia.dominguez@email.com', birthDate: new Date('1992-05-31'), gender: 'F', address: 'Av. Congreso 6547, CABA' },
      { firstName: 'Maximiliano', lastName: 'Ríos', documentNumber: '87890124', phone: '+54 9 11 8080-8888', email: 'maximiliano.rios@email.com', birthDate: new Date('1979-12-25'), gender: 'M', address: 'Av. Monroe 1596, CABA' },
      { firstName: 'Florencia', lastName: 'Vega', documentNumber: '98901235', phone: '+54 9 11 9090-9999', email: 'florencia.vega@email.com', birthDate: new Date('1995-07-04'), gender: 'F', address: 'Av. Cabildo 9876, CABA' },
      { firstName: 'Nicolás', lastName: 'Paz', documentNumber: '09012346', phone: '+54 9 11 0101-0000', email: 'nicolas.paz@email.com', birthDate: new Date('1986-03-18'), gender: 'M', address: 'Av. Elcano 2134, CABA' },
      { firstName: 'Romina', lastName: 'Luna', documentNumber: '19123457', phone: '+54 9 11 1212-1111', email: 'romina.luna@email.com', birthDate: new Date('1993-11-06'), gender: 'F', address: 'Av. Federico Lacroze 5789, CABA' }
    ];

    for (const patientData of patients) {
      await this.patientRepository.save(this.patientRepository.create(patientData));
    }
  }

  private async seedAppointments() {
    const count = await this.appointmentRepository.count();
    if (count > 0) return;

    // Obtener entidades necesarias
    const doctors = await this.doctorRepository.find();
    const patients = await this.patientRepository.find();
    const specialties = await this.specialtyRepository.find();
    const statuses = await this.statusRepository.find();

    const pendingStatus = statuses.find(s => s.slug === 'pending');
    const bookedStatus = statuses.find(s => s.slug === 'booked');
    const arrivedStatus = statuses.find(s => s.slug === 'arrived');
    const inConsultationStatus = statuses.find(s => s.slug === 'in-consultation');
    const fulfilledStatus = statuses.find(s => s.slug === 'fulfilled');
    const cancelledStatus = statuses.find(s => s.slug === 'cancelled');
    const noshowStatus = statuses.find(s => s.slug === 'noshow');
    const checkedInStatus = statuses.find(s => s.slug === 'checked-in');
    const waitlistStatus = statuses.find(s => s.slug === 'waitlist');

    if (!pendingStatus || !bookedStatus) {
      console.warn('⚠️  No se pudieron encontrar todos los estados necesarios para crear turnos');
      return;
    }

    // Helper para crear fechas variadas (horarios entre 8 AM y 7 PM)
    const today = new Date();
    const getRandomDate = (daysOffset: number, hour: number, minute: number) => {
      const date = new Date(today);
      date.setDate(date.getDate() + daysOffset);
      // Validar que la hora esté entre 8 AM (inclusive) y 7 PM (19:00, última hora de inicio)
      let validHour = Math.max(8, Math.min(19, hour));
      let validMinute = minute;
      
      // Si la hora es 19, forzar minutos a 0 (último turno empieza a las 19:00)
      if (validHour === 19) {
        validMinute = 0;
      }
      
      date.setHours(validHour, validMinute, 0, 0);
      return date;
    };

    const sampleAppointments = [
      // PASADO (-7 a -1 días) - 20 turnos fulfilled/noshow (duplicamos)
      { patient: patients[0], doctor: doctors[0], specialty: specialties[0], status: fulfilledStatus, startTime: getRandomDate(-7, 9, 0), duration: 30, reason: 'Gripe y fiebre', symptoms: 'Fiebre 38.5°C, tos, dolor garganta', notes: 'Recetado Paracetamol. Reposo 3 días', identifier: 'OSDE-2024-100001', appointmentType: 'routine', priority: 5, reasonCode: 'J06.9', serviceCategory: 'Medicina General', serviceType: 'Consulta clínica', patientInstruction: 'Venir en ayunas', slotId: 'SLOT-20240101-0900-MGR' },
      { patient: patients[1], doctor: doctors[3], specialty: specialties[1], status: fulfilledStatus, startTime: getRandomDate(-7, 14, 30), duration: 45, reason: 'Control post-infarto', symptoms: 'Ninguno, evolución favorable', notes: 'ECG normal. Continuar medicación', identifier: 'OSDE-2024-100002', appointmentType: 'follow-up', priority: 6, reasonCode: 'I10', serviceCategory: 'Cardiología', serviceType: 'Ecocardiograma', patientInstruction: 'Traer estudios previos', slotId: 'SLOT-20240102-1030-CAR' },
      { patient: patients[5], doctor: doctors[6], specialty: specialties[2], status: fulfilledStatus, startTime: getRandomDate(-6, 10, 0), duration: 30, reason: 'Dermatitis', symptoms: 'Erupción cutánea en brazos', notes: 'Recetada crema corticoide', appointmentType: 'routine', priority: 5, reasonCode: 'L30.9', serviceCategory: 'Dermatología', serviceType: 'Consulta dermatológica' },
      { patient: patients[8], doctor: doctors[8], specialty: specialties[3], status: fulfilledStatus, startTime: getRandomDate(-6, 15, 0), duration: 60, reason: 'Migrañas', symptoms: 'Dolor cabeza intenso con náuseas', notes: 'Recetado Sumatriptan 50mg', identifier: 'OSDE-2024-100003', appointmentType: 'routine', priority: 5, reasonCode: 'R51', serviceCategory: 'Neurología', serviceType: 'Consulta neurológica', patientInstruction: 'No suspender medicación habitual', slotId: 'SLOT-20240104-1100-NEU' },
      { patient: patients[12], doctor: doctors[11], specialty: specialties[4], status: fulfilledStatus, startTime: getRandomDate(-5, 16, 30), duration: 30, reason: 'Vacunación infantil', symptoms: 'Ninguno', notes: 'Aplicada vacuna triple viral', appointmentType: 'routine', priority: 4, reasonCode: 'Z00.00', serviceCategory: 'Pediatría', serviceType: 'Vacunación', patientInstruction: 'Traer carnet de vacunación' },
      { patient: patients[2], doctor: doctors[14], specialty: specialties[5], status: fulfilledStatus, startTime: getRandomDate(-5, 9, 30), duration: 45, reason: 'PAP anual', symptoms: 'Ninguno', notes: 'PAP realizado. Resultados en 15 días', identifier: 'SWISS-2024-500001', appointmentType: 'checkup', priority: 4, reasonCode: 'Z01.4', serviceCategory: 'Ginecología', serviceType: 'Papanicolau', patientInstruction: 'No relaciones 48hs antes', slotId: 'SLOT-20240105-0930-GIN' },
      { patient: patients[18], doctor: doctors[17], specialty: specialties[6], status: fulfilledStatus, startTime: getRandomDate(-4, 11, 0), duration: 30, reason: 'Dolor lumbar', symptoms: 'Dolor intenso zona lumbar', notes: 'Rx normal. Indicado reposo y AINEs', appointmentType: 'routine', priority: 5, reasonCode: 'M54.5', serviceCategory: 'Traumatología', serviceType: 'Consulta traumatológica' },
      { patient: patients[10], doctor: doctors[1], specialty: specialties[0], status: fulfilledStatus, startTime: getRandomDate(-4, 14, 0), duration: 30, reason: 'Control diabético', symptoms: 'Ninguno en particular', notes: 'HbA1c 6.8%. Buen control', identifier: 'OSDE-2024-100004', appointmentType: 'follow-up', priority: 6, reasonCode: 'E11', serviceCategory: 'Medicina General', serviceType: 'Control de crónicos', patientInstruction: 'Venir en ayunas 12 horas', slotId: 'SLOT-20240106-1000-MGR' },
      { patient: patients[7], doctor: doctors[7], specialty: specialties[2], status: noshowStatus, startTime: getRandomDate(-3, 13, 30), duration: 30, reason: 'Control lunares', symptoms: 'Lunar con cambios', notes: 'Paciente no se presentó', appointmentType: 'routine', priority: 5, reasonCode: 'D22.9', serviceCategory: 'Dermatología', serviceType: 'Control de lunares', patientInstruction: 'Traer fotos anteriores si tiene' },
      { patient: patients[15], doctor: doctors[12], specialty: specialties[4], status: fulfilledStatus, startTime: getRandomDate(-3, 17, 0), duration: 30, reason: 'Control niño sano 6 meses', symptoms: 'Ninguno', notes: 'Desarrollo acorde edad. Peso y talla normales', appointmentType: 'checkup', priority: 4, reasonCode: 'Z00.12', serviceCategory: 'Pediatría', serviceType: 'Control de niño sano' },
      // Nuevos 10 turnos pasado
      { patient: patients[3], doctor: doctors[2], specialty: specialties[0], status: fulfilledStatus, startTime: getRandomDate(-7, 11, 0), duration: 30, reason: 'Dolor de garganta', symptoms: 'Faringitis', notes: 'Recetado antibiótico', appointmentType: 'routine', priority: 5, reasonCode: 'J02.9', serviceCategory: 'Medicina General', serviceType: 'Consulta clínica' },
      { patient: patients[4], doctor: doctors[4], specialty: specialties[1], status: fulfilledStatus, startTime: getRandomDate(-6, 16, 0), duration: 45, reason: 'Arritmia', symptoms: 'Palpitaciones', notes: 'Holter indicado', appointmentType: 'routine', priority: 6, reasonCode: 'I49.9', serviceCategory: 'Cardiología', serviceType: 'Consulta cardiológica' },
      { patient: patients[6], doctor: doctors[6], specialty: specialties[2], status: fulfilledStatus, startTime: getRandomDate(-5, 12, 0), duration: 30, reason: 'Acné', symptoms: 'Brote acné facial', notes: 'Tratamiento tópico', appointmentType: 'routine', priority: 5, reasonCode: 'L70.0', serviceCategory: 'Dermatología', serviceType: 'Tratamiento acné' },
      { patient: patients[9], doctor: doctors[9], specialty: specialties[3], status: fulfilledStatus, startTime: getRandomDate(-5, 8, 30), duration: 60, reason: 'Cefalea tensional', symptoms: 'Dolor cabeza persistente', notes: 'Relajantes musculares', appointmentType: 'routine', priority: 5, reasonCode: 'R51', serviceCategory: 'Neurología', serviceType: 'Consulta neurológica' },
      { patient: patients[11], doctor: doctors[10], specialty: specialties[3], status: fulfilledStatus, startTime: getRandomDate(-4, 9, 0), duration: 60, reason: 'Evaluación epilepsia', symptoms: 'Crisis controladas', notes: 'Continuar tratamiento', appointmentType: 'follow-up', priority: 6, reasonCode: 'G40.9', serviceCategory: 'Neurología', serviceType: 'Consulta neurológica' },
      { patient: patients[13], doctor: doctors[12], specialty: specialties[4], status: fulfilledStatus, startTime: getRandomDate(-3, 10, 30), duration: 30, reason: 'Otitis', symptoms: 'Dolor oído', notes: 'Antibiótico prescrito', appointmentType: 'routine', priority: 5, reasonCode: 'H66.9', serviceCategory: 'Pediatría', serviceType: 'Consulta pediátrica' },
      { patient: patients[14], doctor: doctors[13], specialty: specialties[4], status: fulfilledStatus, startTime: getRandomDate(-2, 8, 0), duration: 30, reason: 'Control peso', symptoms: 'Sobrepeso leve', notes: 'Plan nutricional', appointmentType: 'checkup', priority: 4, reasonCode: 'E66.9', serviceCategory: 'Pediatría', serviceType: 'Control de desarrollo' },
      { patient: patients[16], doctor: doctors[15], specialty: specialties[5], status: fulfilledStatus, startTime: getRandomDate(-2, 16, 30), duration: 45, reason: 'Consulta anticonceptivos', symptoms: 'Ninguno', notes: 'Receta anticonceptivos', appointmentType: 'routine', priority: 5, reasonCode: 'Z30.0', serviceCategory: 'Ginecología', serviceType: 'Control ginecológico' },
      { patient: patients[17], doctor: doctors[16], specialty: specialties[5], status: fulfilledStatus, startTime: getRandomDate(-1, 11, 30), duration: 45, reason: 'Ecografía pélvica', symptoms: 'Control rutina', notes: 'Ecografía normal', appointmentType: 'checkup', priority: 4, reasonCode: 'Z01.4', serviceCategory: 'Ginecología', serviceType: 'Control ginecológico' },
      { patient: patients[19], doctor: doctors[18], specialty: specialties[6], status: fulfilledStatus, startTime: getRandomDate(-1, 9, 30), duration: 30, reason: 'Esguince tobillo', symptoms: 'Tobillo hinchado', notes: 'Vendaje y reposo', appointmentType: 'routine', priority: 5, reasonCode: 'S93.4', serviceCategory: 'Traumatología', serviceType: 'Consulta traumatológica' },
      
      // HOY - 36 turnos (varios estados) - duplicamos
      { patient: patients[20], doctor: doctors[0], specialty: specialties[0], status: fulfilledStatus, startTime: new Date(today.getFullYear(), today.getMonth(), today.getDate(), 8, 0), duration: 30, reason: 'Certificado médico', symptoms: 'Ninguno', notes: 'Certificado emitido apto físico', appointmentType: 'routine', priority: 5, reasonCode: 'Z02.9', serviceCategory: 'Medicina General', serviceType: 'Certificado médico', slotId: 'SLOT-20240108-0800-MGR' },
      { patient: patients[21], doctor: doctors[4], specialty: specialties[1], status: fulfilledStatus, startTime: new Date(today.getFullYear(), today.getMonth(), today.getDate(), 8, 30), duration: 45, reason: 'Consulta cardiológica', symptoms: 'Palpitaciones ocasionales', notes: 'ECG sin alteraciones. Solicitar Holter', identifier: 'GALENO-2024-200001', appointmentType: 'routine', priority: 5, reasonCode: 'R00.2', serviceCategory: 'Cardiología', serviceType: 'Consulta cardiológica', patientInstruction: 'No tomar café antes del turno', slotId: 'SLOT-20240108-0830-CAR' },
      { patient: patients[22], doctor: doctors[9], specialty: specialties[3], status: arrivedStatus, startTime: new Date(today.getFullYear(), today.getMonth(), today.getDate(), 9, 0), duration: 60, reason: 'Evaluación neurológica', symptoms: 'Mareos frecuentes', notes: 'En espera', appointmentType: 'routine', priority: 5, reasonCode: 'R42', serviceCategory: 'Neurología', serviceType: 'Consulta neurológica', patientInstruction: 'Traer lista medicación actual', slotId: 'SLOT-20240108-0900-NEU', arrivedAt: new Date(today.getFullYear(), today.getMonth(), today.getDate(), 8, 50) },
      { patient: patients[23], doctor: doctors[2], specialty: specialties[0], status: inConsultationStatus, startTime: new Date(today.getFullYear(), today.getMonth(), today.getDate(), 9, 30), duration: 30, reason: 'Hipertensión', symptoms: 'Presión arterial elevada', notes: 'Ajustar medicación', identifier: 'OSDE-2024-100005', appointmentType: 'follow-up', priority: 6, reasonCode: 'I10', serviceCategory: 'Medicina General', serviceType: 'Control de crónicos', patientInstruction: 'Traer registro presiones', slotId: 'SLOT-20240108-0930-MGR', arrivedAt: new Date(today.getFullYear(), today.getMonth(), today.getDate(), 9, 25), consultationStartedAt: new Date(Date.now() - 5 * 60 * 1000) },
      { patient: patients[25], doctor: doctors[5], specialty: specialties[1], status: checkedInStatus, startTime: new Date(today.getFullYear(), today.getMonth(), today.getDate(), 10, 0), duration: 45, reason: 'Ergometría', symptoms: 'Ninguno, estudio preventivo', notes: 'Paciente registrado, esperando', appointmentType: 'checkup', priority: 4, reasonCode: 'Z00.00', serviceCategory: 'Cardiología', serviceType: 'Ergometría', patientInstruction: 'Venir con ropa deportiva. Ayuno 3 horas', slotId: 'SLOT-20240108-1000-CAR' },
      { patient: patients[24], doctor: doctors[13], specialty: specialties[4], status: arrivedStatus, startTime: new Date(today.getFullYear(), today.getMonth(), today.getDate(), 10, 30), duration: 30, reason: 'Consulta pediátrica', symptoms: 'Tos y mocos', notes: 'En sala de espera', appointmentType: 'routine', priority: 5, reasonCode: 'J06.9', serviceCategory: 'Pediatría', serviceType: 'Consulta pediátrica', arrivedAt: new Date(today.getFullYear(), today.getMonth(), today.getDate(), 10, 20) },
      { patient: patients[26], doctor: doctors[15], specialty: specialties[5], status: inConsultationStatus, startTime: new Date(today.getFullYear(), today.getMonth(), today.getDate(), 11, 0), duration: 45, reason: 'Control prenatal', symptoms: 'Embarazo 20 semanas', notes: 'Evolución normal embarazo', identifier: 'OSDE-2024-100006', appointmentType: 'follow-up', priority: 6, reasonCode: 'Z34.0', serviceCategory: 'Ginecología', serviceType: 'Control prenatal', patientInstruction: 'Traer análisis laboratorio', slotId: 'SLOT-20240108-1100-GIN', arrivedAt: new Date(today.getFullYear(), today.getMonth(), today.getDate(), 10, 55), consultationStartedAt: new Date(Date.now() - 8 * 60 * 1000) },
      { patient: patients[28], doctor: doctors[19], specialty: specialties[6], status: arrivedStatus, startTime: new Date(today.getFullYear(), today.getMonth(), today.getDate(), 11, 30), duration: 30, reason: 'Control post-quirúrgico', symptoms: 'Operado rodilla hace 15 días', notes: 'Evaluar evolución', appointmentType: 'follow-up', priority: 6, reasonCode: 'Z48.8', serviceCategory: 'Traumatología', serviceType: 'Control post-quirúrgico', patientInstruction: 'Traer informe quirúrgico', slotId: 'SLOT-20240108-1130-TRA', arrivedAt: new Date(today.getFullYear(), today.getMonth(), today.getDate(), 11, 25) },
      { patient: patients[29], doctor: doctors[6], specialty: specialties[2], status: bookedStatus, startTime: new Date(today.getFullYear(), today.getMonth(), today.getDate(), 14, 0), duration: 30, reason: 'Tratamiento acné', symptoms: 'Acné moderado en rostro', appointmentType: 'routine', priority: 5, reasonCode: 'L70.0', serviceCategory: 'Dermatología', serviceType: 'Tratamiento acné', patientInstruction: 'No aplicar maquillaje día del turno' },
      { patient: patients[27], doctor: doctors[10], specialty: specialties[3], status: bookedStatus, startTime: new Date(today.getFullYear(), today.getMonth(), today.getDate(), 14, 30), duration: 60, reason: 'Electroencefalograma', symptoms: 'Antecedentes convulsiones', identifier: 'SWISS-2024-500002', appointmentType: 'routine', priority: 5, reasonCode: 'R56.9', serviceCategory: 'Neurología', serviceType: 'Electroencefalograma', patientInstruction: 'Venir con cabello limpio y seco', slotId: 'SLOT-20240108-1430-NEU' },
      { patient: patients[3], doctor: doctors[1], specialty: specialties[0], status: bookedStatus, startTime: new Date(today.getFullYear(), today.getMonth(), today.getDate(), 15, 0), duration: 30, reason: 'Chequeo general', symptoms: 'Ninguno, control preventivo', appointmentType: 'checkup', priority: 4, reasonCode: 'Z00.00', serviceCategory: 'Medicina General', serviceType: 'Chequeo general', patientInstruction: 'Venir en ayunas para análisis', slotId: 'SLOT-20240108-1500-MGR' },
      { patient: patients[6], doctor: doctors[11], specialty: specialties[4], status: bookedStatus, startTime: new Date(today.getFullYear(), today.getMonth(), today.getDate(), 15, 30), duration: 30, reason: 'Control desarrollo', symptoms: 'Niño 2 años', appointmentType: 'checkup', priority: 4, reasonCode: 'Z00.12', serviceCategory: 'Pediatría', serviceType: 'Control de desarrollo', patientInstruction: 'Traer carnet de salud' },
      { patient: patients[7], doctor: doctors[16], specialty: specialties[5], status: bookedStatus, startTime: new Date(today.getFullYear(), today.getMonth(), today.getDate(), 16, 0), duration: 45, reason: 'Ecografía mamaria', symptoms: 'Control preventivo', identifier: 'OSDE-2024-100007', appointmentType: 'checkup', priority: 4, reasonCode: 'Z12.3', serviceCategory: 'Ginecología', serviceType: 'Ecografía mamaria', patientInstruction: 'No desodorante ni cremas', slotId: 'SLOT-20240108-1600-GIN' },
      { patient: patients[9], doctor: doctors[18], specialty: specialties[6], status: bookedStatus, startTime: new Date(today.getFullYear(), today.getMonth(), today.getDate(), 16, 30), duration: 30, reason: 'Infiltración', symptoms: 'Dolor hombro derecho', appointmentType: 'routine', priority: 5, reasonCode: 'M25.5', serviceCategory: 'Traumatología', serviceType: 'Infiltración', patientInstruction: 'Venir acompañado', slotId: 'SLOT-20240108-1630-TRA' },
      { patient: patients[11], doctor: doctors[3], specialty: specialties[1], status: bookedStatus, startTime: new Date(today.getFullYear(), today.getMonth(), today.getDate(), 17, 0), duration: 45, reason: 'Holter 24hs', symptoms: 'Arritmias intermitentes', identifier: 'GALENO-2024-200002', appointmentType: 'routine', priority: 5, reasonCode: 'I49.9', serviceCategory: 'Cardiología', serviceType: 'Holter', patientInstruction: 'Ducharse antes colocar equipo', slotId: 'SLOT-20240108-1700-CAR' },
      { patient: patients[13], doctor: doctors[7], specialty: specialties[2], status: cancelledStatus, startTime: new Date(today.getFullYear(), today.getMonth(), today.getDate(), 17, 30), duration: 30, reason: 'Consulta dermatológica', symptoms: 'Dermatitis', notes: 'Cancelado por el paciente', appointmentType: 'routine', priority: 5, reasonCode: 'L30.9', serviceCategory: 'Dermatología', serviceType: 'Consulta dermatológica' },
      { patient: patients[14], doctor: doctors[0], specialty: specialties[0], status: bookedStatus, startTime: new Date(today.getFullYear(), today.getMonth(), today.getDate(), 18, 0), duration: 30, reason: 'Consulta clínica', symptoms: 'Dolor abdominal', appointmentType: 'routine', priority: 5, reasonCode: 'R10.9', serviceCategory: 'Medicina General', serviceType: 'Consulta clínica', slotId: 'SLOT-20240108-1800-MGR' },
      { patient: patients[16], doctor: doctors[8], specialty: specialties[3], status: bookedStatus, startTime: new Date(today.getFullYear(), today.getMonth(), today.getDate(), 18, 0), duration: 60, reason: 'Control migrañas', symptoms: 'Migrañas recurrentes', appointmentType: 'follow-up', priority: 6, reasonCode: 'G43.9', serviceCategory: 'Neurología', serviceType: 'Control de migrañas', patientInstruction: 'Llevar registro crisis' },
      // 18 turnos adicionales HOY
      { patient: patients[0], doctor: doctors[2], specialty: specialties[0], status: fulfilledStatus, startTime: new Date(today.getFullYear(), today.getMonth(), today.getDate(), 8, 30), duration: 30, reason: 'Resultado laboratorio', symptoms: 'Control rutinario', notes: 'Análisis normales', appointmentType: 'follow-up', priority: 5, reasonCode: 'Z00.00', serviceCategory: 'Medicina General', serviceType: 'Consulta clínica' },
      { patient: patients[1], doctor: doctors[5], specialty: specialties[1], status: fulfilledStatus, startTime: new Date(today.getFullYear(), today.getMonth(), today.getDate(), 9, 30), duration: 45, reason: 'Control presión', symptoms: 'HTA controlada', notes: 'Mantener tratamiento', identifier: 'OSDE-2024-100020', appointmentType: 'follow-up', priority: 6, reasonCode: 'I10', serviceCategory: 'Cardiología', serviceType: 'Consulta cardiológica' },
      { patient: patients[2], doctor: doctors[7], specialty: specialties[2], status: arrivedStatus, startTime: new Date(today.getFullYear(), today.getMonth(), today.getDate(), 10, 0), duration: 30, reason: 'Consulta dermatológica', symptoms: 'Erupción cutánea', notes: 'Esperando', appointmentType: 'routine', priority: 5, reasonCode: 'L30.9', serviceCategory: 'Dermatología', serviceType: 'Consulta dermatológica', arrivedAt: new Date(today.getFullYear(), today.getMonth(), today.getDate(), 9, 55) },
      { patient: patients[4], doctor: doctors[8], specialty: specialties[3], status: inConsultationStatus, startTime: new Date(today.getFullYear(), today.getMonth(), today.getDate(), 11, 0), duration: 60, reason: 'Evaluación neurológica', symptoms: 'Temblor manos', notes: 'En consulta', identifier: 'SWISS-2024-500010', appointmentType: 'routine', priority: 5, reasonCode: 'R25.1', serviceCategory: 'Neurología', serviceType: 'Consulta neurológica', arrivedAt: new Date(today.getFullYear(), today.getMonth(), today.getDate(), 10, 50), consultationStartedAt: new Date(Date.now() - 10 * 60 * 1000) },
      { patient: patients[5], doctor: doctors[12], specialty: specialties[4], status: arrivedStatus, startTime: new Date(today.getFullYear(), today.getMonth(), today.getDate(), 12, 0), duration: 30, reason: 'Vacunación', symptoms: 'Calendario vacunas', notes: 'Esperando', appointmentType: 'routine', priority: 4, reasonCode: 'Z23', serviceCategory: 'Pediatría', serviceType: 'Vacunación', arrivedAt: new Date(today.getFullYear(), today.getMonth(), today.getDate(), 11, 55) },
      { patient: patients[8], doctor: doctors[14], specialty: specialties[5], status: bookedStatus, startTime: new Date(today.getFullYear(), today.getMonth(), today.getDate(), 14, 30), duration: 45, reason: 'Control ginecológico anual', symptoms: 'Ninguno', appointmentType: 'checkup', priority: 4, reasonCode: 'Z01.4', serviceCategory: 'Ginecología', serviceType: 'Control ginecológico', patientInstruction: 'No relaciones 48hs antes' },
      { patient: patients[10], doctor: doctors[17], specialty: specialties[6], status: bookedStatus, startTime: new Date(today.getFullYear(), today.getMonth(), today.getDate(), 15, 0), duration: 30, reason: 'Dolor cervical', symptoms: 'Cervicalgia crónica', appointmentType: 'routine', priority: 5, reasonCode: 'M54.2', serviceCategory: 'Traumatología', serviceType: 'Consulta traumatológica' },
      { patient: patients[12], doctor: doctors[4], specialty: specialties[1], status: bookedStatus, startTime: new Date(today.getFullYear(), today.getMonth(), today.getDate(), 15, 30), duration: 45, reason: 'Ecocardiograma Doppler', symptoms: 'Control valvular', identifier: 'GALENO-2024-200010', appointmentType: 'checkup', priority: 5, reasonCode: 'I34.9', serviceCategory: 'Cardiología', serviceType: 'Ecocardiograma', patientInstruction: 'No requiere ayuno' },
      { patient: patients[15], doctor: doctors[9], specialty: specialties[3], status: bookedStatus, startTime: new Date(today.getFullYear(), today.getMonth(), today.getDate(), 16, 30), duration: 60, reason: 'Estudio sueño', symptoms: 'Insomnio crónico', appointmentType: 'routine', priority: 5, reasonCode: 'G47.0', serviceCategory: 'Neurología', serviceType: 'Consulta neurológica', patientInstruction: 'Llevar registro sueño' },
      { patient: patients[17], doctor: doctors[6], specialty: specialties[2], status: bookedStatus, startTime: new Date(today.getFullYear(), today.getMonth(), today.getDate(), 17, 0), duration: 30, reason: 'Crioterapia verrugas', symptoms: 'Verrugas plantares', appointmentType: 'routine', priority: 5, reasonCode: 'B07', serviceCategory: 'Dermatología', serviceType: 'Crioterapia' },
      { patient: patients[18], doctor: doctors[1], specialty: specialties[0], status: bookedStatus, startTime: new Date(today.getFullYear(), today.getMonth(), today.getDate(), 17, 30), duration: 30, reason: 'Dolor abdominal', symptoms: 'Gastritis', identifier: 'OSDE-2024-100021', appointmentType: 'routine', priority: 5, reasonCode: 'K29.7', serviceCategory: 'Medicina General', serviceType: 'Consulta clínica' },
      { patient: patients[19], doctor: doctors[11], specialty: specialties[4], status: bookedStatus, startTime: new Date(today.getFullYear(), today.getMonth(), today.getDate(), 18, 0), duration: 30, reason: 'Control crecimiento', symptoms: 'Niño 4 años', appointmentType: 'checkup', priority: 4, reasonCode: 'Z00.12', serviceCategory: 'Pediatría', serviceType: 'Control de desarrollo', patientInstruction: 'Traer carnet salud' },
      { patient: patients[1], doctor: doctors[0], specialty: specialties[0], status: arrivedStatus, startTime: new Date(today.getFullYear(), today.getMonth(), today.getDate(), 12, 30), duration: 30, reason: 'Renovación receta', symptoms: 'Tratamiento crónico', notes: 'En espera', appointmentType: 'routine', priority: 5, reasonCode: 'Z76.0', serviceCategory: 'Medicina General', serviceType: 'Consulta clínica', arrivedAt: new Date(today.getFullYear(), today.getMonth(), today.getDate(), 12, 25) },
      { patient: patients[4], doctor: doctors[13], specialty: specialties[4], status: checkedInStatus, startTime: new Date(today.getFullYear(), today.getMonth(), today.getDate(), 13, 0), duration: 30, reason: 'Consulta bronquitis', symptoms: 'Tos seca persistente', notes: 'Check-in realizado', appointmentType: 'routine', priority: 5, reasonCode: 'J40', serviceCategory: 'Pediatría', serviceType: 'Consulta pediátrica' },
      { patient: patients[5], doctor: doctors[16], specialty: specialties[5], status: bookedStatus, startTime: new Date(today.getFullYear(), today.getMonth(), today.getDate(), 13, 30), duration: 45, reason: 'Consulta menopausia', symptoms: 'Sofocos', identifier: 'SWISS-2024-500011', appointmentType: 'consultation', priority: 5, reasonCode: 'N95.1', serviceCategory: 'Ginecología', serviceType: 'Control ginecológico' },
      { patient: patients[7], doctor: doctors[19], specialty: specialties[6], status: bookedStatus, startTime: new Date(today.getFullYear(), today.getMonth(), today.getDate(), 14, 0), duration: 30, reason: 'Dolor muñeca', symptoms: 'Dolor muñeca derecha', appointmentType: 'routine', priority: 5, reasonCode: 'M25.5', serviceCategory: 'Traumatología', serviceType: 'Consulta traumatológica' },
      { patient: patients[9], doctor: doctors[3], specialty: specialties[1], status: bookedStatus, startTime: new Date(today.getFullYear(), today.getMonth(), today.getDate(), 16, 0), duration: 45, reason: 'Resultado Holter', symptoms: 'Control arritmia', notes: 'Revisar estudio', identifier: 'GALENO-2024-200011', appointmentType: 'follow-up', priority: 6, reasonCode: 'I49.9', serviceCategory: 'Cardiología', serviceType: 'Consulta cardiológica', patientInstruction: 'Traer Holter' },
      { patient: patients[11], doctor: doctors[10], specialty: specialties[3], status: bookedStatus, startTime: new Date(today.getFullYear(), today.getMonth(), today.getDate(), 18, 0), duration: 60, reason: 'Seguimiento epilepsia', symptoms: 'Sin crisis', appointmentType: 'follow-up', priority: 6, reasonCode: 'G40.9', serviceCategory: 'Neurología', serviceType: 'Consulta neurológica', patientInstruction: 'Llevar registro crisis' },

      // MAÑANA - 14 turnos (duplicamos)
      { patient: patients[0], doctor: doctors[2], specialty: specialties[0], status: bookedStatus, startTime: getRandomDate(1, 9, 0), duration: 30, reason: 'Resultado análisis', symptoms: 'Control laboratorio', identifier: 'OSDE-2024-100008', appointmentType: 'follow-up', priority: 6, reasonCode: 'Z00.00', serviceCategory: 'Medicina General', serviceType: 'Consulta clínica', patientInstruction: 'Traer análisis', slotId: 'SLOT-20240109-0900-MGR' },
      { patient: patients[23], doctor: doctors[5], specialty: specialties[1], status: pendingStatus, startTime: getRandomDate(1, 10, 0), duration: 45, reason: 'Dolor precordial', symptoms: 'Dolor pecho al caminar', identifier: 'URGENTE-2024-999001', appointmentType: 'emergency', priority: 9, reasonCode: 'R07.2', serviceCategory: 'Cardiología', serviceType: 'Consulta cardiológica', patientInstruction: 'URGENTE - Venir acompañado', slotId: 'SLOT-20240109-1000-CAR' },
      { patient: patients[17], doctor: doctors[12], specialty: specialties[4], status: bookedStatus, startTime: getRandomDate(1, 11, 0), duration: 30, reason: 'Vacunación', symptoms: 'Vacuna HPV', appointmentType: 'routine', priority: 4, reasonCode: 'Z23', serviceCategory: 'Pediatría', serviceType: 'Vacunación', patientInstruction: 'Traer carnet vacunación' },
      { patient: patients[2], doctor: doctors[14], specialty: specialties[5], status: bookedStatus, startTime: getRandomDate(1, 14, 30), duration: 45, reason: 'Control ginecológico', symptoms: 'Ninguno', appointmentType: 'checkup', priority: 4, reasonCode: 'Z01.4', serviceCategory: 'Ginecología', serviceType: 'Control ginecológico', patientInstruction: 'No relaciones 48hs antes', slotId: 'SLOT-20240109-1430-GIN' },
      { patient: patients[3], doctor: doctors[17], specialty: specialties[6], status: bookedStatus, startTime: getRandomDate(1, 16, 0), duration: 30, reason: 'Dolor rodilla', symptoms: 'Dolor e inflamación rodilla izq', appointmentType: 'routine', priority: 5, reasonCode: 'M25.5', serviceCategory: 'Traumatología', serviceType: 'Consulta traumatológica', slotId: 'SLOT-20240109-1600-TRA' },
      { patient: patients[4], doctor: doctors[9], specialty: specialties[3], status: bookedStatus, startTime: getRandomDate(1, 17, 0), duration: 60, reason: 'Evaluación cognitiva', symptoms: 'Problemas memoria', identifier: 'SWISS-2024-500003', appointmentType: 'routine', priority: 5, reasonCode: 'R41.3', serviceCategory: 'Neurología', serviceType: 'Evaluación cognitiva', patientInstruction: 'Venir acompañado familiar', slotId: 'SLOT-20240109-1700-NEU' },
      { patient: patients[18], doctor: doctors[6], specialty: specialties[2], status: waitlistStatus, startTime: getRandomDate(1, 18, 0), duration: 30, reason: 'Crioterapia', symptoms: 'Verrugas', notes: 'En lista espera por disponibilidad', appointmentType: 'routine', priority: 3, reasonCode: 'B07', serviceCategory: 'Dermatología', serviceType: 'Crioterapia' },
      // 7 turnos adicionales MAÑANA
      { patient: patients[5], doctor: doctors[0], specialty: specialties[0], status: bookedStatus, startTime: getRandomDate(1, 8, 0), duration: 30, reason: 'Certificado escolar', symptoms: 'Ninguno', appointmentType: 'routine', priority: 5, reasonCode: 'Z02.0', serviceCategory: 'Medicina General', serviceType: 'Certificado médico' },
      { patient: patients[6], doctor: doctors[3], specialty: specialties[1], status: bookedStatus, startTime: getRandomDate(1, 11, 30), duration: 45, reason: 'Control post-ecocardiograma', symptoms: 'Evaluar resultado', identifier: 'OSDE-2024-100030', appointmentType: 'follow-up', priority: 6, reasonCode: 'I51.9', serviceCategory: 'Cardiología', serviceType: 'Consulta cardiológica' },
      { patient: patients[7], doctor: doctors[7], specialty: specialties[2], status: bookedStatus, startTime: getRandomDate(1, 13, 0), duration: 30, reason: 'Psoriasis', symptoms: 'Brote psoriásico', appointmentType: 'routine', priority: 5, reasonCode: 'L40.9', serviceCategory: 'Dermatología', serviceType: 'Consulta dermatológica' },
      { patient: patients[8], doctor: doctors[10], specialty: specialties[3], status: bookedStatus, startTime: getRandomDate(1, 15, 0), duration: 60, reason: 'Parkinson', symptoms: 'Control enfermedad', identifier: 'GALENO-2024-200030', appointmentType: 'follow-up', priority: 6, reasonCode: 'G20', serviceCategory: 'Neurología', serviceType: 'Consulta neurológica' },
      { patient: patients[9], doctor: doctors[11], specialty: specialties[4], status: bookedStatus, startTime: getRandomDate(1, 16, 30), duration: 30, reason: 'Conjuntivitis', symptoms: 'Ojo rojo', appointmentType: 'routine', priority: 5, reasonCode: 'H10.9', serviceCategory: 'Pediatría', serviceType: 'Consulta pediátrica' },
      { patient: patients[10], doctor: doctors[15], specialty: specialties[5], status: bookedStatus, startTime: getRandomDate(1, 18, 0), duration: 45, reason: 'Infección urinaria', symptoms: 'Disuria', appointmentType: 'routine', priority: 5, reasonCode: 'N39.0', serviceCategory: 'Ginecología', serviceType: 'Control ginecológico' },
      { patient: patients[11], doctor: doctors[18], specialty: specialties[6], status: bookedStatus, startTime: getRandomDate(1, 12, 0), duration: 30, reason: 'Tendinitis', symptoms: 'Dolor tendón Aquiles', appointmentType: 'routine', priority: 5, reasonCode: 'M76.6', serviceCategory: 'Traumatología', serviceType: 'Consulta traumatológica' },

      // PRÓXIMA SEMANA - 24 turnos (duplicamos)
      { patient: patients[12], doctor: doctors[1], specialty: specialties[0], status: pendingStatus, startTime: getRandomDate(3, 10, 0), duration: 30, reason: 'Control diabético mensual', symptoms: 'Ninguno', identifier: 'OSDE-2024-100009', appointmentType: 'follow-up', priority: 6, reasonCode: 'E11', serviceCategory: 'Medicina General', serviceType: 'Control de crónicos', patientInstruction: 'Venir en ayunas 12 horas', slotId: 'SLOT-20240111-1000-MGR' },
      { patient: patients[13], doctor: doctors[4], specialty: specialties[1], status: pendingStatus, startTime: getRandomDate(4, 11, 0), duration: 45, reason: 'Consulta cardiológica', symptoms: 'Control post-ecocardiograma', appointmentType: 'follow-up', priority: 6, reasonCode: 'I51.9', serviceCategory: 'Cardiología', serviceType: 'Consulta cardiológica', patientInstruction: 'Traer ecocardiograma', slotId: 'SLOT-20240112-1100-CAR' },
      { patient: patients[14], doctor: doctors[13], specialty: specialties[4], status: pendingStatus, startTime: getRandomDate(5, 9, 30), duration: 30, reason: 'Control niño sano 9 meses', symptoms: 'Ninguno', appointmentType: 'checkup', priority: 4, reasonCode: 'Z00.12', serviceCategory: 'Pediatría', serviceType: 'Control de niño sano', patientInstruction: 'Traer carnet salud' },
      { patient: patients[15], doctor: doctors[15], specialty: specialties[5], status: pendingStatus, startTime: getRandomDate(6, 14, 0), duration: 45, reason: 'Control prenatal 2do trimestre', symptoms: 'Embarazo 24 semanas', identifier: 'OSDE-2024-100010', appointmentType: 'follow-up', priority: 6, reasonCode: 'Z34.0', serviceCategory: 'Ginecología', serviceType: 'Control prenatal', patientInstruction: 'Traer ecografía morfológica', slotId: 'SLOT-20240114-1400-GIN' },
      { patient: patients[20], doctor: doctors[18], specialty: specialties[6], status: pendingStatus, startTime: getRandomDate(7, 15, 30), duration: 30, reason: 'Evaluación fractura', symptoms: 'Tobillo hinchado tras caída', appointmentType: 'routine', priority: 5, reasonCode: 'S93.4', serviceCategory: 'Traumatología', serviceType: 'Evaluación de fractura', patientInstruction: 'Traer radiografía', slotId: 'SLOT-20240115-1530-TRA' },
      { patient: patients[21], doctor: doctors[7], specialty: specialties[2], status: pendingStatus, startTime: getRandomDate(7, 16, 0), duration: 30, reason: 'Control lunares anual', symptoms: 'Control preventivo', appointmentType: 'checkup', priority: 4, reasonCode: 'D22.9', serviceCategory: 'Dermatología', serviceType: 'Control de lunares', patientInstruction: 'Traer fotos anteriores si tiene' },
      { patient: patients[22], doctor: doctors[10], specialty: specialties[3], status: pendingStatus, startTime: getRandomDate(8, 10, 30), duration: 60, reason: 'Consulta neurológica', symptoms: 'Temblor en manos', identifier: 'GALENO-2024-200003', appointmentType: 'routine', priority: 5, reasonCode: 'R25.1', serviceCategory: 'Neurología', serviceType: 'Consulta neurológica', patientInstruction: 'Traer lista medicación actual', slotId: 'SLOT-20240116-1030-NEU' },
      { patient: patients[23], doctor: doctors[0], specialty: specialties[0], status: pendingStatus, startTime: getRandomDate(9, 9, 0), duration: 30, reason: 'Control hipertensión', symptoms: 'Presión controlada', appointmentType: 'follow-up', priority: 6, reasonCode: 'I10', serviceCategory: 'Medicina General', serviceType: 'Control de crónicos', patientInstruction: 'Traer registro presiones', slotId: 'SLOT-20240117-0900-MGR' },
      { patient: patients[25], doctor: doctors[3], specialty: specialties[1], status: pendingStatus, startTime: getRandomDate(10, 11, 30), duration: 45, reason: 'Ecocardiograma', symptoms: 'Control anual', identifier: 'OSDE-2024-100011', appointmentType: 'checkup', priority: 4, reasonCode: 'Z00.00', serviceCategory: 'Cardiología', serviceType: 'Ecocardiograma', patientInstruction: 'No requiere preparación especial', slotId: 'SLOT-20240118-1130-CAR' },
      { patient: patients[0], doctor: doctors[11], specialty: specialties[4], status: pendingStatus, startTime: getRandomDate(10, 16, 0), duration: 30, reason: 'Consulta pediátrica', symptoms: 'Dolor de oído', appointmentType: 'routine', priority: 5, reasonCode: 'H92.0', serviceCategory: 'Pediatría', serviceType: 'Consulta pediátrica' },
      { patient: patients[1], doctor: doctors[16], specialty: specialties[5], status: pendingStatus, startTime: getRandomDate(11, 10, 0), duration: 45, reason: 'Control ginecológico', symptoms: 'Ninguno', appointmentType: 'checkup', priority: 4, reasonCode: 'Z01.4', serviceCategory: 'Ginecología', serviceType: 'Control ginecológico', patientInstruction: 'No relaciones 48hs antes', slotId: 'SLOT-20240119-1000-GIN' },
      { patient: patients[24], doctor: doctors[19], specialty: specialties[6], status: pendingStatus, startTime: getRandomDate(12, 14, 30), duration: 30, reason: 'Control post-infiltración', symptoms: 'Evolución favorable', appointmentType: 'follow-up', priority: 6, reasonCode: 'M25.5', serviceCategory: 'Traumatología', serviceType: 'Control post-quirúrgico', slotId: 'SLOT-20240120-1430-TRA' },
      // 12 turnos adicionales PRÓXIMA SEMANA
      { patient: patients[2], doctor: doctors[2], specialty: specialties[0], status: pendingStatus, startTime: getRandomDate(3, 14, 0), duration: 30, reason: 'Dolor de espalda', symptoms: 'Lumbalgia', appointmentType: 'routine', priority: 5, reasonCode: 'M54.5', serviceCategory: 'Medicina General', serviceType: 'Consulta clínica' },
      { patient: patients[3], doctor: doctors[5], specialty: specialties[1], status: pendingStatus, startTime: getRandomDate(4, 16, 30), duration: 45, reason: 'Control marcapasos', symptoms: 'Revisión dispositivo', identifier: 'SWISS-2024-500040', appointmentType: 'follow-up', priority: 6, reasonCode: 'Z45.0', serviceCategory: 'Cardiología', serviceType: 'Consulta cardiológica' },
      { patient: patients[4], doctor: doctors[6], specialty: specialties[2], status: pendingStatus, startTime: getRandomDate(5, 11, 0), duration: 30, reason: 'Melanoma', symptoms: 'Control lunar sospechoso', appointmentType: 'routine', priority: 7, reasonCode: 'D22.9', serviceCategory: 'Dermatología', serviceType: 'Control de lunares' },
      { patient: patients[5], doctor: doctors[8], specialty: specialties[3], status: pendingStatus, startTime: getRandomDate(6, 9, 0), duration: 60, reason: 'Esclerosis múltiple', symptoms: 'Control enfermedad', identifier: 'GALENO-2024-200040', appointmentType: 'follow-up', priority: 6, reasonCode: 'G35', serviceCategory: 'Neurología', serviceType: 'Consulta neurológica' },
      { patient: patients[6], doctor: doctors[12], specialty: specialties[4], status: pendingStatus, startTime: getRandomDate(7, 10, 0), duration: 30, reason: 'Asma infantil', symptoms: 'Control asma', appointmentType: 'follow-up', priority: 6, reasonCode: 'J45.9', serviceCategory: 'Pediatría', serviceType: 'Consulta pediátrica' },
      { patient: patients[7], doctor: doctors[14], specialty: specialties[5], status: pendingStatus, startTime: getRandomDate(8, 15, 30), duration: 45, reason: 'Endometriosis', symptoms: 'Dolor pélvico', appointmentType: 'follow-up', priority: 6, reasonCode: 'N80.9', serviceCategory: 'Ginecología', serviceType: 'Control ginecológico' },
      { patient: patients[8], doctor: doctors[17], specialty: specialties[6], status: pendingStatus, startTime: getRandomDate(9, 17, 0), duration: 30, reason: 'Fractura consolidada', symptoms: 'Control Rx', appointmentType: 'follow-up', priority: 6, reasonCode: 'S82.9', serviceCategory: 'Traumatología', serviceType: 'Control post-quirúrgico' },
      { patient: patients[9], doctor: doctors[1], specialty: specialties[0], status: pendingStatus, startTime: getRandomDate(10, 8, 30), duration: 30, reason: 'Colesterol alto', symptoms: 'Dislipemia', identifier: 'OSDE-2024-100040', appointmentType: 'follow-up', priority: 6, reasonCode: 'E78.5', serviceCategory: 'Medicina General', serviceType: 'Control de crónicos' },
      { patient: patients[10], doctor: doctors[4], specialty: specialties[1], status: pendingStatus, startTime: getRandomDate(11, 13, 0), duration: 45, reason: 'Insuficiencia cardíaca', symptoms: 'Control ICC', appointmentType: 'follow-up', priority: 7, reasonCode: 'I50.9', serviceCategory: 'Cardiología', serviceType: 'Consulta cardiológica' },
      { patient: patients[11], doctor: doctors[7], specialty: specialties[2], status: pendingStatus, startTime: getRandomDate(12, 9, 30), duration: 30, reason: 'Alopecia', symptoms: 'Caída cabello', appointmentType: 'routine', priority: 5, reasonCode: 'L65.9', serviceCategory: 'Dermatología', serviceType: 'Consulta dermatológica' },
      { patient: patients[16], doctor: doctors[9], specialty: specialties[3], status: pendingStatus, startTime: getRandomDate(3, 17, 30), duration: 60, reason: 'Neuropatía', symptoms: 'Hormigueo extremidades', appointmentType: 'routine', priority: 5, reasonCode: 'G62.9', serviceCategory: 'Neurología', serviceType: 'Consulta neurológica' },
      { patient: patients[18], doctor: doctors[13], specialty: specialties[4], status: pendingStatus, startTime: getRandomDate(5, 18, 0), duration: 30, reason: 'Alergia alimentaria', symptoms: 'Pruebas alérgicas', appointmentType: 'routine', priority: 5, reasonCode: 'T78.1', serviceCategory: 'Pediatría', serviceType: 'Consulta pediátrica' },

      // FUTURO (15+ días) - 14 turnos (duplicamos)
      { patient: patients[19], doctor: doctors[12], specialty: specialties[4], status: pendingStatus, startTime: getRandomDate(15, 10, 0), duration: 30, reason: 'Control desarrollo 3 años', symptoms: 'Ninguno', appointmentType: 'checkup', priority: 4, reasonCode: 'Z00.12', serviceCategory: 'Pediatría', serviceType: 'Control de desarrollo', patientInstruction: 'Traer carnet salud' },
      { patient: patients[26], doctor: doctors[6], specialty: specialties[2], status: pendingStatus, startTime: getRandomDate(18, 15, 0), duration: 30, reason: 'Control acné', symptoms: 'Evolución tratamiento', appointmentType: 'follow-up', priority: 6, reasonCode: 'L70.0', serviceCategory: 'Dermatología', serviceType: 'Tratamiento acné', patientInstruction: 'No suspender tratamiento' },
      { patient: patients[27], doctor: doctors[8], specialty: specialties[3], status: pendingStatus, startTime: getRandomDate(21, 11, 0), duration: 60, reason: 'Control convulsiones', symptoms: 'Sin crisis en último mes', identifier: 'SWISS-2024-500004', appointmentType: 'follow-up', priority: 6, reasonCode: 'R56.9', serviceCategory: 'Neurología', serviceType: 'Consulta neurológica', patientInstruction: 'Llevar registro crisis', slotId: 'SLOT-20240129-1100-NEU' },
      { patient: patients[28], doctor: doctors[17], specialty: specialties[6], status: pendingStatus, startTime: getRandomDate(25, 16, 30), duration: 30, reason: 'Alta médica', symptoms: 'Recuperación completa', appointmentType: 'follow-up', priority: 6, reasonCode: 'Z48.8', serviceCategory: 'Traumatología', serviceType: 'Control post-quirúrgico', slotId: 'SLOT-20240202-1630-TRA' },
      { patient: patients[29], doctor: doctors[2], specialty: specialties[0], status: pendingStatus, startTime: getRandomDate(28, 9, 30), duration: 30, reason: 'Resultado chequeo', symptoms: 'Revisión análisis completos', identifier: 'OSDE-2024-100012', appointmentType: 'follow-up', priority: 6, reasonCode: 'Z00.00', serviceCategory: 'Medicina General', serviceType: 'Consulta clínica', slotId: 'SLOT-20240205-0930-MGR' },
      { patient: patients[17], doctor: doctors[5], specialty: specialties[1], status: pendingStatus, startTime: getRandomDate(30, 14, 0), duration: 45, reason: 'Control cardiológico anual', symptoms: 'Ninguno', appointmentType: 'checkup', priority: 4, reasonCode: 'Z00.00', serviceCategory: 'Cardiología', serviceType: 'Consulta cardiológica', patientInstruction: 'Traer electrocardiogramas anteriores' },
      { patient: patients[18], doctor: doctors[14], specialty: specialties[5], status: pendingStatus, startTime: getRandomDate(32, 10, 30), duration: 45, reason: 'Consulta ginecológica', symptoms: 'Irregularidades menstruales', identifier: 'GALENO-2024-200004', appointmentType: 'consultation', priority: 5, reasonCode: 'N92.6', serviceCategory: 'Ginecología', serviceType: 'Control ginecológico', patientInstruction: 'Anotar fecha última menstruación', slotId: 'SLOT-20240209-1030-GIN' },
      // 7 turnos adicionales FUTURO
      { patient: patients[20], doctor: doctors[0], specialty: specialties[0], status: pendingStatus, startTime: getRandomDate(16, 11, 30), duration: 30, reason: 'Revisión anual', symptoms: 'Chequeo preventivo', appointmentType: 'checkup', priority: 4, reasonCode: 'Z00.00', serviceCategory: 'Medicina General', serviceType: 'Chequeo general' },
      { patient: patients[21], doctor: doctors[3], specialty: specialties[1], status: pendingStatus, startTime: getRandomDate(19, 16, 0), duration: 45, reason: 'Cateterismo', symptoms: 'Evaluación arterias', identifier: 'OSDE-2024-100050', appointmentType: 'routine', priority: 7, reasonCode: 'I25.1', serviceCategory: 'Cardiología', serviceType: 'Consulta cardiológica' },
      { patient: patients[22], doctor: doctors[7], specialty: specialties[2], status: pendingStatus, startTime: getRandomDate(22, 13, 30), duration: 30, reason: 'Eccema', symptoms: 'Dermatitis atópica', appointmentType: 'routine', priority: 5, reasonCode: 'L20.9', serviceCategory: 'Dermatología', serviceType: 'Consulta dermatológica' },
      { patient: patients[23], doctor: doctors[10], specialty: specialties[3], status: pendingStatus, startTime: getRandomDate(26, 8, 0), duration: 60, reason: 'Alzheimer', symptoms: 'Deterioro cognitivo', identifier: 'GALENO-2024-200050', appointmentType: 'follow-up', priority: 6, reasonCode: 'G30.9', serviceCategory: 'Neurología', serviceType: 'Evaluación cognitiva' },
      { patient: patients[24], doctor: doctors[11], specialty: specialties[4], status: pendingStatus, startTime: getRandomDate(29, 17, 30), duration: 30, reason: 'Control peso infantil', symptoms: 'Obesidad', appointmentType: 'follow-up', priority: 6, reasonCode: 'E66.9', serviceCategory: 'Pediatría', serviceType: 'Control de desarrollo' },
      { patient: patients[25], doctor: doctors[15], specialty: specialties[5], status: pendingStatus, startTime: getRandomDate(31, 12, 0), duration: 45, reason: 'Menopausia', symptoms: 'Terapia reemplazo', appointmentType: 'follow-up', priority: 6, reasonCode: 'N95.1', serviceCategory: 'Ginecología', serviceType: 'Control ginecológico' },
      { patient: patients[26], doctor: doctors[19], specialty: specialties[6], status: pendingStatus, startTime: getRandomDate(33, 18, 30), duration: 30, reason: 'Artritis', symptoms: 'Dolor articular', appointmentType: 'follow-up', priority: 6, reasonCode: 'M19.9', serviceCategory: 'Traumatología', serviceType: 'Consulta traumatológica' }
    ];

    for (const appointmentData of sampleAppointments) {
      const endTime = new Date(appointmentData.startTime.getTime() + appointmentData.duration * 60000);
      
      // Validar que el turno empiece entre 8:00 AM y 7:00 PM y termine antes de 7:00 PM
      const startHour = appointmentData.startTime.getHours();
      const endHour = endTime.getHours();
      const endMinute = endTime.getMinutes();
      
      if (startHour < 8 || startHour > 19) {
        console.warn(`⚠️  Turno fuera de horario (inicio): ${appointmentData.patient.firstName} - Hora: ${startHour}:${appointmentData.startTime.getMinutes()}`);
        continue; // Saltar este turno
      }
      
      if (endHour > 19 || (endHour === 19 && endMinute > 0)) {
        console.warn(`⚠️  Turno termina fuera de horario: ${appointmentData.patient.firstName} - Termina: ${endHour}:${endMinute}`);
        continue; // Saltar este turno
      }
      
      const appointment = this.appointmentRepository.create({
        patientId: appointmentData.patient.id,
        doctorId: appointmentData.doctor.id,
        specialtyId: appointmentData.specialty.id,
        statusId: appointmentData.status.id,
        startTime: appointmentData.startTime,
        endTime,
        duration: appointmentData.duration,
        reason: appointmentData.reason,
        symptoms: appointmentData.symptoms || null,
        notes: appointmentData.notes || null,
        contactPhone: appointmentData.patient.phone,
        contactEmail: appointmentData.patient.email,
        arrivedAt: (appointmentData as any).arrivedAt || null,
        consultationStartedAt: (appointmentData as any).consultationStartedAt || null,
        consultationEndedAt: (appointmentData as any).consultationEndedAt || null,
        // FHIR R4 Fields
        identifier: appointmentData.identifier || null,
        priority: appointmentData.priority || 5,
        minutesDuration: appointmentData.duration,
        appointmentType: appointmentData.appointmentType || null,
        reasonCode: appointmentData.reasonCode || null,
        serviceCategory: appointmentData.serviceCategory || null,
        serviceType: appointmentData.serviceType || null,
        patientInstruction: appointmentData.patientInstruction || null,
        slotId: appointmentData.slotId || null,
        createdBy: 'seed-service'
      });

      await this.appointmentRepository.save(appointment);
    }

    console.log(`✅ ${sampleAppointments.length} turnos de ejemplo creados exitosamente (horarios de 8 AM a 7 PM)`);
    console.log(`📊 Distribución: Pasado=20, Hoy=36, Mañana=14, Próxima Semana=24, Futuro=14`);
  }
}