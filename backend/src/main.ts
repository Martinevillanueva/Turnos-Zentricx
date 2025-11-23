import 'dotenv/config';
import { NestFactory, Reflector } from '@nestjs/core';
import { DocumentBuilder, SwaggerModule } from '@nestjs/swagger';
import { ValidationPipe, ClassSerializerInterceptor } from '@nestjs/common';
import * as cors from 'cors';
import { AppModule } from './app.module';

async function bootstrap() {
  const app = await NestFactory.create(AppModule);

  // Configuración de CORS
  app.use(cors({
    origin: ['http://localhost:3000', 'http://127.0.0.1:3000'],
    methods: ['GET', 'POST', 'PUT', 'DELETE', 'PATCH'],
    allowedHeaders: ['Content-Type', 'Authorization'],
    credentials: true
  }));

  // Configuración global de validación y serialización
  app.useGlobalPipes(new ValidationPipe({
    transform: true,
    whitelist: true,
    forbidNonWhitelisted: true
  }));

  // Configurar class-transformer para serializar getters virtuales
  app.useGlobalInterceptors(new ClassSerializerInterceptor(app.get(Reflector)));

  // Configuración de Swagger
  const config = new DocumentBuilder()
    .setTitle('Zentricx Appointments API')
    .setDescription('API para gestión de turnos médicos Zentricx')
    .setVersion('1.0')
    .addTag('appointments')
    .build();

  const document = SwaggerModule.createDocument(app, config);
  SwaggerModule.setup('api/docs', app, document);

  // Puerto de la aplicación
  const port = process.env.PORT || 4000;
  
  await app.listen(port);
  
  console.log(`🚀 Servidor backend iniciado en: http://localhost:${port}`);
  console.log(`📚 Documentación Swagger disponible en: http://localhost:${port}/api/docs`);
  console.log(`🏥 API de turnos Zentricx disponible en: http://localhost:${port}/api/appointments`);
}

bootstrap();