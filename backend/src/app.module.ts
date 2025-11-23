import { Module } from '@nestjs/common';
import { TypeOrmModule } from '@nestjs/typeorm';
import { AppController } from './app.controller';
import { AppointmentsModule } from './appointments/appointments.module';
import { PatientsModule } from './patients/patients.module';
import { Appointment, AppointmentParticipant, Doctor, Patient, Specialty, AppointmentStatus } from './entities';

@Module({
  imports: [
    TypeOrmModule.forRoot({
      type: 'postgres',
      host: process.env.DB_HOST || 'localhost',
      port: parseInt(process.env.DB_PORT || '5432'),
      username: process.env.DB_USERNAME || 'postgres',
      password: process.env.DB_PASSWORD || 'postgres123',
      database: process.env.DB_DATABASE || 'turnos-zentricx',
      entities: [Appointment, AppointmentParticipant, Doctor, Patient, Specialty, AppointmentStatus],
      synchronize: true, // Solo para desarrollo
      logging: true, // Para ver las queries SQL
    }),
    AppointmentsModule,
    PatientsModule
  ],
  controllers: [AppController],
  providers: [],
})
export class AppModule {}