import { Module } from '@nestjs/common';
import { TypeOrmModule } from '@nestjs/typeorm';
import { AppointmentsController } from './appointments-json.controller';
import { AppointmentsService } from '../services/appointments.service';
import { Appointment, Doctor, Patient, Specialty, AppointmentStatus } from '../entities';
import { SeedService } from '../services/seed.service';

@Module({
  imports: [
    TypeOrmModule.forFeature([
      Appointment, 
      Doctor, 
      Patient, 
      Specialty, 
      AppointmentStatus
    ])
  ],
  controllers: [AppointmentsController],
  providers: [AppointmentsService, SeedService],
  exports: [AppointmentsService]
})
export class AppointmentsModule {}