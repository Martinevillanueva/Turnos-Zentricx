import { IsNotEmpty, IsOptional, IsEmail, IsDateString, IsIn, MinLength, MaxLength, Matches } from 'class-validator';
import { Transform } from 'class-transformer';

export class CreatePatientDto {
  @IsNotEmpty({ message: 'El nombre es requerido' })
  @MinLength(2, { message: 'El nombre debe tener al menos 2 caracteres' })
  @MaxLength(100, { message: 'El nombre no puede tener más de 100 caracteres' })
  @Matches(/^[a-zA-ZáéíóúÁÉÍÓÚñÑüÜ\s]+$/, { message: 'El nombre solo puede contener letras y espacios' })
  @Transform(({ value }) => value?.trim())
  firstName: string;

  @IsNotEmpty({ message: 'El apellido es requerido' })
  @MinLength(2, { message: 'El apellido debe tener al menos 2 caracteres' })
  @MaxLength(100, { message: 'El apellido no puede tener más de 100 caracteres' })
  @Matches(/^[a-zA-ZáéíóúÁÉÍÓÚñÑüÜ\s]+$/, { message: 'El apellido solo puede contener letras y espacios' })
  @Transform(({ value }) => value?.trim())
  lastName: string;

  @IsNotEmpty({ message: 'El documento es requerido' })
  @MaxLength(20, { message: 'El documento no puede tener más de 20 caracteres' })
  @Matches(/^\d{7,8}$|^[A-Za-z0-9]{6,12}$/, { 
    message: 'Formato de documento inválido (DNI: 7-8 dígitos o Pasaporte: 6-12 caracteres alfanuméricos)' 
  })
  @Transform(({ value }) => value?.trim().replaceAll(/[^0-9A-Za-z]/g, ''))
  documentNumber: string;

  @IsOptional()
  @MaxLength(15, { message: 'El teléfono no puede tener más de 15 caracteres' })
  @Matches(/^(\+54)?\d{10,13}$/, { 
    message: 'Formato de teléfono inválido (ej: +54 9 11 1234-5678)' 
  })
  @Transform(({ value }) => value ? value.replaceAll(/[^0-9+]/g, '') : value)
  phone?: string;

  @IsOptional()
  @IsEmail({}, { message: 'Formato de email inválido' })
  @MaxLength(100, { message: 'El email no puede tener más de 100 caracteres' })
  @Transform(({ value }) => value?.trim().toLowerCase())
  email?: string;

  @IsOptional()
  @IsDateString({}, { message: 'Formato de fecha inválido' })
  birthDate?: string;

  @IsOptional()
  @IsIn(['M', 'F', 'Other'], { message: 'Debes elegir un tipo de Género' })
  gender?: string;

  @IsOptional()
  @MaxLength(200, { message: 'La dirección no puede tener más de 200 caracteres' })
  @Transform(({ value }) => value?.trim())
  address?: string;
}