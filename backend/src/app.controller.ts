import { Controller, Get } from '@nestjs/common';
import { ApiTags, ApiOperation, ApiResponse } from '@nestjs/swagger';

@ApiTags('info')
@Controller()
export class AppController {
  @Get()
  @ApiOperation({ summary: 'Información del servidor' })
  @ApiResponse({ 
    status: 200, 
    description: 'Información básica del servidor de turnos FHIR' 
  })
  getInfo() {
    return {
      message: '🏥 API de Gestión de Turnos Zentricx',
      version: '1.0.0',
      description: 'Sistema de gestión de turnos médicos Zentricx',
      endpoints: {
        appointments: '/api/appointments',
        documentation: '/api/docs',
        health: '/health'
      },
      timestamp: new Date().toISOString(),
      status: 'running'
    };
  }

  @Get('health')
  @ApiOperation({ summary: 'Estado de salud del servidor' })
  @ApiResponse({ 
    status: 200, 
    description: 'Estado de salud del servidor' 
  })
  getHealth() {
    return {
      status: 'healthy',
      uptime: process.uptime(),
      timestamp: new Date().toISOString(),
      services: {
        api: 'running',
        database: 'json-file-ready'
      }
    };
  }
}