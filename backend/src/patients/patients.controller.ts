import { 
  Controller, 
  Get, 
  Post, 
  Put,
  Body, 
  Patch, 
  Param, 
  Delete, 
  Query,
  ParseUUIDPipe,
  BadRequestException,
  InternalServerErrorException,
  UsePipes,
  ValidationPipe
} from '@nestjs/common';
import { PatientsService } from './patients.service';
import { CreatePatientDto } from '../dto/create-patient.dto';

@Controller('api/patients')
export class PatientsController {
  constructor(private readonly patientsService: PatientsService) {}

  @Get()
  async findAll(@Query() query: any) {
    const page = query.page ? Number.parseInt(query.page, 10) : 1;
    const limit = query.limit ? Number.parseInt(query.limit, 10) : 20;
    const search = query.search || '';

    return this.patientsService.findAllPaginated({
      page,
      limit,
      search
    });
  }

  @Post()
  @UsePipes(new ValidationPipe({ 
    transform: true, 
    whitelist: true,
    forbidNonWhitelisted: true,
    exceptionFactory: (errors) => {
      const errorMessages = errors.map(error => {
        const constraints = Object.values(error.constraints || {});
        return constraints.join(', ');
      }).join('; ');
      
      return new BadRequestException({
        message: 'Datos de validación inválidos',
        errors: errorMessages
      });
    }
  }))
  async create(@Body() createPatientDto: CreatePatientDto) {
    try {
      // Validaciones adicionales personalizadas
      await this.validatePatientData(createPatientDto);
      
      const patient = await this.patientsService.create(createPatientDto);
      return {
        success: true,
        message: 'Paciente creado exitosamente',
        data: patient
      };
    } catch (error) {
      console.error('Error in patients controller create:', error);
      
      // Si es un error de validación (duplicado), usar BadRequestException
      if (error.message?.includes('Ya existe')) {
        throw new BadRequestException(error.message);
      }
      
      // Para otros errores, usar InternalServerErrorException
      throw new InternalServerErrorException('Error interno del servidor al crear el paciente');
    }
  }
  
  private async validatePatientData(dto: CreatePatientDto): Promise<void> {
    // Validar fecha de nacimiento si se proporciona
    if (dto.birthDate) {
      const birthDate = new Date(dto.birthDate);
      const today = new Date();
      
      if (birthDate > today) {
        throw new BadRequestException('La fecha de nacimiento no puede ser futura');
      }
      
      const age = today.getFullYear() - birthDate.getFullYear();
      if (age > 120) {
        throw new BadRequestException('Edad no válida (máximo 120 años)');
      }
    }
  }

  @Get(':id')
  findOne(@Param('id', ParseUUIDPipe) id: string) {
    return this.patientsService.findOne(id);
  }

  @Put(':id')
  @UsePipes(new ValidationPipe({ 
    transform: true, 
    whitelist: true,
    forbidNonWhitelisted: true,
    skipMissingProperties: true
  }))
  async update(
    @Param('id', ParseUUIDPipe) id: string, 
    @Body() updatePatientDto: Partial<CreatePatientDto>
  ) {
    try {
      // Validaciones adicionales para actualización si hay fecha de nacimiento
      if (updatePatientDto.birthDate) {
        const birthDate = new Date(updatePatientDto.birthDate);
        const today = new Date();
        
        if (birthDate > today) {
          throw new BadRequestException('La fecha de nacimiento no puede ser futura');
        }
        
        const age = today.getFullYear() - birthDate.getFullYear();
        if (age > 120) {
          throw new BadRequestException('Edad no válida (máximo 120 años)');
        }
      }
      
      const patient = await this.patientsService.update(id, updatePatientDto);
      
      return {
        success: true,
        message: 'Paciente actualizado exitosamente',
        data: patient
      };
      
    } catch (error) {
      console.error('Error in patients controller update:', error);
      
      // Si es un error de validación (duplicado), usar BadRequestException
      if (error.message?.includes('Ya existe')) {
        throw new BadRequestException(error.message);
      }
      
      // Si es un NotFoundException, re-throw
      if (error.name === 'NotFoundException') {
        throw error;
      }
      
      // Para otros errores, usar InternalServerErrorException
      throw new InternalServerErrorException('Error interno del servidor al actualizar el paciente');
    }
  }

  @Delete(':id')
  remove(@Param('id', ParseUUIDPipe) id: string) {
    return this.patientsService.remove(id);
  }

  @Patch(':id/deactivate')
  async deactivate(@Param('id', ParseUUIDPipe) id: string) {
    try {
      const patient = await this.patientsService.deactivate(id);
      
      return {
        success: true,
        message: 'Paciente dado de baja exitosamente',
        data: patient
      };
      
    } catch (error) {
      console.error('Error in patients controller deactivate:', error);
      
      // Si es un NotFoundException, re-throw
      if (error.name === 'NotFoundException') {
        throw error;
      }
      
      // Para otros errores, usar InternalServerErrorException
      throw new InternalServerErrorException('Error interno del servidor al dar de baja el paciente');
    }
  }
}