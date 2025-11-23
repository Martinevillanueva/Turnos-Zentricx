import { useState, useCallback } from 'react';

export interface CreatePatientData {
  firstName: string;
  lastName: string;
  documentNumber: string;
  phone?: string;
  email?: string;
  birthDate?: string;
  gender?: string;
  address?: string;
}

// Funciones de validación
export const validateName = (name: string): string | null => {
  if (!name.trim()) {
    return 'Este campo es requerido';
  }
  if (name.trim().length < 2) {
    return 'Debe tener al menos 2 caracteres';
  }
  if (!/^[a-zA-ZáéíóúÁÉÍÓÚñÑüÜ\s]+$/.test(name.trim())) {
    return 'Solo se permiten letras y espacios';
  }
  return null;
};

export const validateDocumentNumber = (doc: string): string | null => {
  if (!doc.trim()) {
    return 'El documento es requerido';
  }
  // Validar DNI argentino (8 dígitos) o pasaporte (formato más flexible)
  const cleanDoc = doc.trim().replace(/[^0-9A-Za-z]/g, '');
  if (!/^\d{7,8}$|^[A-Za-z0-9]{6,12}$/.test(cleanDoc)) {
    return 'Formato de documento inválido (DNI: o Pasaporte)';
  }
  return null;
};

export const validatePhone = (phone: string): string | null => {
  if (!phone.trim()) {
    return null; // Teléfono es opcional
  }
  // Validar formato de teléfono argentino
  const cleanPhone = phone.replace(/[^0-9+]/g, '');
  if (!/^(\+54)?\d{10,13}$/.test(cleanPhone)) {
    return 'Formato de teléfono inválido (ej: +54 9 11 1234-5678)';
  }
  return null;
};

export const validateEmail = (email: string): string | null => {
  if (!email.trim()) {
    return null; // Email es opcional
  }
  const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
  if (!emailRegex.test(email.trim())) {
    return 'Formato de email inválido';
  }
  return null;
};

export const validateBirthDate = (birthDate: string): string | null => {
  if (!birthDate.trim()) {
    return null; // Fecha de nacimiento es opcional
  }
  const date = new Date(birthDate);
  const today = new Date();

  if (Number.isNaN(date.getTime())) {
    return 'Fecha inválida';
  }

  if (date > today) {
    return 'La fecha de nacimiento no puede ser futura';
  }

  // Verificar que la edad sea razonable (máximo 120 años)
  const age = today.getFullYear() - date.getFullYear();
  if (age > 120) {
    return 'Edad no válida (máximo 120 años)';
  }

  return null;
};

export const usePatientValidation = () => {
  const validateField = useCallback((field: keyof CreatePatientData, value: string): string | null => {
    switch (field) {
      case 'firstName':
      case 'lastName':
        return validateName(value);
      case 'documentNumber':
        return validateDocumentNumber(value);
      case 'phone':
        return validatePhone(value);
      case 'email':
        return validateEmail(value);
      case 'birthDate':
        return validateBirthDate(value);
      default:
        return null;
    }
  }, []);

  const validateAllFields = useCallback((data: CreatePatientData): Record<string, string> => {
    const errors: Record<string, string> = {};

    // Validaciones obligatorias
    const firstNameError = validateName(data.firstName);
    if (firstNameError) errors.firstName = firstNameError;

    const lastNameError = validateName(data.lastName);
    if (lastNameError) errors.lastName = lastNameError;

    const documentError = validateDocumentNumber(data.documentNumber);
    if (documentError) errors.documentNumber = documentError;

    // Validaciones opcionales
    if (data.phone?.trim()) {
      const phoneError = validatePhone(data.phone);
      if (phoneError) errors.phone = phoneError;
    }

    if (data.email?.trim()) {
      const emailError = validateEmail(data.email);
      if (emailError) errors.email = emailError;
    }

    if (data.birthDate?.trim()) {
      const birthDateError = validateBirthDate(data.birthDate);
      if (birthDateError) errors.birthDate = birthDateError;
    }

    return errors;
  }, []);

  return { validateField, validateAllFields };
};