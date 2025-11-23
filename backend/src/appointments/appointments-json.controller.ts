import { 
  Controller, 
  Get, 
  Post, 
  Body, 
  Patch, 
  Param, 
  Delete, 
  Query,
  ParseUUIDPipe,
  BadRequestException 
} from '@nestjs/common';
import { AppointmentsService, CreatePatientDto } from '../services/appointments.service';
import type { UpdateAppointmentStatusDto, AppointmentFilters } from '../services/appointments.service';
import { CreateAppointmentDto } from '../dto/create-appointment.dto';

@Controller('api/appointments')
export class AppointmentsController {
  constructor(private readonly appointmentsService: AppointmentsService) {}

  @Get()
  findAll(@Query() query: any) {
    const filters: AppointmentFilters = {};
    
    // Filtros originales
    if (query.doctorId) filters.doctorId = query.doctorId;
    if (query.patientId) filters.patientId = query.patientId;
    if (query.specialtyId) filters.specialtyId = query.specialtyId;
    if (query.statusId) filters.statusId = query.statusId;
    if (query.patientSearch) filters.patientSearch = query.patientSearch;
    if (query.date) filters.date = new Date(query.date);
    if (query.startDate) filters.startDate = new Date(query.startDate);
    if (query.endDate) filters.endDate = new Date(query.endDate);
    
    // FHIR R4 Search Parameters
    if (query.actor) filters.actor = query.actor;
    if (query['appointment-type']) filters.appointmentType = query['appointment-type'];
    if (query.appointmentType) filters.appointmentType = query.appointmentType;
    if (query.identifier) filters.identifier = query.identifier;
    if (query.location) filters.location = query.location;
    if (query['part-status']) filters.partStatus = query['part-status'];
    if (query.practitioner) filters.practitioner = query.practitioner;
    if (query['reason-code']) filters.reasonCode = query['reason-code'];
    if (query.reasonCode) filters.reasonCode = query.reasonCode;
    if (query['service-category']) filters.serviceCategory = query['service-category'];
    if (query.serviceCategory) filters.serviceCategory = query.serviceCategory;
    if (query['service-type']) filters.serviceType = query['service-type'];
    if (query.serviceType) filters.serviceType = query.serviceType;
    if (query.slot) filters.slot = query.slot;
    if (query.specialty) filters.specialty = query.specialty;
    if (query.status) filters.statusId = query.status;

    return this.appointmentsService.findAll(filters);
  }

  @Get('paginated')
  findAllPaginated(@Query() query: any) {
    const filters: AppointmentFilters = {};
    
    // Filtros originales
    if (query.doctorId) filters.doctorId = query.doctorId;
    if (query.patientId) filters.patientId = query.patientId;
    if (query.specialtyId) filters.specialtyId = query.specialtyId;
    if (query.statusId) filters.statusId = query.statusId;
    
    // Soporte para múltiples estados (statusIds puede venir como string separado por comas o array)
    if (query.statusIds) {
      filters.statusIds = Array.isArray(query.statusIds) 
        ? query.statusIds 
        : query.statusIds.split(',');
    }
    
    if (query.patientSearch) filters.patientSearch = query.patientSearch;
    if (query.date) filters.date = new Date(query.date);
    if (query.startDate) filters.startDate = new Date(query.startDate);
    if (query.endDate) filters.endDate = new Date(query.endDate);
    if (query.page) filters.page = Number.parseInt(query.page, 10);
    if (query.limit) filters.limit = Number.parseInt(query.limit, 10);
    
    // FHIR R4 Search Parameters
    if (query.actor) filters.actor = query.actor;
    if (query['appointment-type']) filters.appointmentType = query['appointment-type'];
    if (query.appointmentType) filters.appointmentType = query.appointmentType;
    if (query.identifier) filters.identifier = query.identifier;
    if (query.location) filters.location = query.location;
    if (query['part-status']) filters.partStatus = query['part-status'];
    if (query.practitioner) filters.practitioner = query.practitioner;
    if (query.priority) filters.priority = query.priority;
    if (query['reason-code']) filters.reasonCode = query['reason-code'];
    if (query.reasonCode) filters.reasonCode = query.reasonCode;
    if (query['service-category']) filters.serviceCategory = query['service-category'];
    if (query.serviceCategory) filters.serviceCategory = query.serviceCategory;
    if (query['service-type']) filters.serviceType = query['service-type'];
    if (query.serviceType) filters.serviceType = query.serviceType;
    if (query.slot) filters.slot = query.slot;
    if (query.specialty) filters.specialty = query.specialty;
    if (query.status) filters.statusId = query.status;

    return this.appointmentsService.findAllPaginated(filters);
  }

  @Get('doctors')
  getDoctors(@Query('search') search?: string) {
    return this.appointmentsService.getDoctors(search);
  }

  @Get('patients')
  getPatients(@Query('search') search?: string) {
    return this.appointmentsService.getPatients(search);
  }

  @Post('patients')
  createPatient(@Body() createPatientDto: CreatePatientDto) {
    return this.appointmentsService.createPatient(createPatientDto);
  }

  @Get('specialties')
  getSpecialties() {
    return this.appointmentsService.getSpecialties();
  }

  @Get('statuses')
  getStatuses() {
    return this.appointmentsService.getStatuses();
  }

  @Get('status-map')
  async getStatusMap() {
    const statuses = await this.appointmentsService.getStatuses();
    const statusMap = {};
    
    for (const status of statuses) {
      statusMap[status.slug] = status.id;
    }
    
    return statusMap;
  }

  @Get('stats')
  getStats() {
    return this.appointmentsService.getStats();
  }

  @Post()
  create(@Body() createAppointmentDto: CreateAppointmentDto) {
    
    // Validaciones básicas
    if (!createAppointmentDto.startTime) {
      throw new BadRequestException('startTime es requerido');
    }

    if (!createAppointmentDto.doctorId) {
      throw new BadRequestException('doctorId es requerido');
    }

    if (!createAppointmentDto.specialtyId) {
      throw new BadRequestException('specialtyId es requerido');
    }

    // Convertir string a Date si es necesario
    if (typeof createAppointmentDto.startTime === 'string') {
      createAppointmentDto.startTime = new Date(createAppointmentDto.startTime);
    }

    // Convertir birthDate si viene en patientData
    const serviceDto = {
      ...createAppointmentDto,
      patientData: createAppointmentDto.patientData ? {
        ...createAppointmentDto.patientData,
        birthDate: createAppointmentDto.patientData.birthDate 
          ? new Date(createAppointmentDto.patientData.birthDate)
          : undefined
      } : undefined
    };

    return this.appointmentsService.create(serviceDto as any, 'api-user');
  }

  @Get(':id')
  findOne(@Param('id', ParseUUIDPipe) id: string) {
    return this.appointmentsService.findOne(id);
  }

  @Patch(':id/status')
  updateStatus(
    @Param('id', ParseUUIDPipe) id: string,
    @Body() updateStatusDto: UpdateAppointmentStatusDto
  ) {
    if (!updateStatusDto.statusId) {
      throw new BadRequestException('statusId es requerido');
    }

    return this.appointmentsService.updateStatus(id, updateStatusDto);
  }

  @Delete(':id')
  remove(@Param('id', ParseUUIDPipe) id: string) {
    return this.appointmentsService.remove(id);
  }

  // Endpoint de respaldo para mantener compatibilidad
  @Get('backup')
  getBackup() {
    return this.appointmentsService.findAll();
  }

  // Endpoint temporal para actualizar estados FHIR
  @Post('fix-fhir-statuses')
  async fixFhirStatuses() {
    return this.appointmentsService.fixFhirStatuses();
  }
}