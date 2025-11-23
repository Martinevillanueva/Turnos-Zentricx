import { useState, useCallback } from 'react';
import { CreatePatientData, usePatientValidation } from './usePatientValidation';

interface UsePatientFormOptions {
  initialData?: CreatePatientData;
  onSubmit: (data: CreatePatientData) => Promise<void>;
}

export const usePatientForm = ({ initialData, onSubmit }: UsePatientFormOptions) => {
  const [formData, setFormData] = useState<CreatePatientData>(initialData || {
    firstName: '',
    lastName: '',
    documentNumber: '',
    phone: '',
    email: '',
    birthDate: '',
    gender: '',
    address: ''
  });

  const [fieldErrors, setFieldErrors] = useState<Record<string, string>>({});
  const [localError, setLocalError] = useState<string>('');
  const [isSubmitting, setIsSubmitting] = useState(false);

  const { validateField, validateAllFields } = usePatientValidation();

  const handleInputChange = useCallback((field: keyof CreatePatientData, value: string) => {
    // Limpiar errores cuando el usuario empiece a escribir
    if (localError || Object.keys(fieldErrors).length > 0) {
      setLocalError('');
    }

    // Limpiar error específico del campo
    if (fieldErrors[field]) {
      setFieldErrors(prev => {
        const newErrors = { ...prev };
        delete newErrors[field];
        return newErrors;
      });
    }

    // Actualizar valor
    setFormData(prev => ({
      ...prev,
      [field]: value
    }));

    // Validación en tiempo real para ciertos campos
    if (value.trim()) {
      const validationError = validateField(field, value);
      if (validationError) {
        setFieldErrors(prev => ({
          ...prev,
          [field]: validationError
        }));
      }
    }
  }, [localError, fieldErrors, validateField]);

  const handleSubmit = useCallback(async (e: React.FormEvent) => {
    e.preventDefault();
    setLocalError('');
    setFieldErrors({});

    // Validar todos los campos
    const errors = validateAllFields(formData);

    // Si hay errores, mostrarlos
    if (Object.keys(errors).length > 0) {
      setFieldErrors(errors);
      setLocalError('Por favor, corrige los errores en el formulario');
      return;
    }

    try {
      setIsSubmitting(true);
      await onSubmit(formData);
    } finally {
      setIsSubmitting(false);
    }
  }, [formData, validateAllFields, onSubmit]);

  const resetForm = useCallback(() => {
    setFormData(initialData || {
      firstName: '',
      lastName: '',
      documentNumber: '',
      phone: '',
      email: '',
      birthDate: '',
      gender: '',
      address: ''
    });
    setFieldErrors({});
    setLocalError('');
  }, [initialData]);

  const isFormValid = formData.firstName && formData.lastName && formData.documentNumber && Object.keys(fieldErrors).length === 0;

  return {
    formData,
    fieldErrors,
    localError,
    isSubmitting,
    isFormValid,
    handleInputChange,
    handleSubmit,
    resetForm
  };
};