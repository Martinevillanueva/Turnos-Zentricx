'use client';

import React from 'react';
import FormInput from '@/forms/FormInput';
import { CreatePatientData } from '@/hooks/usePatientValidation';
import { usePatientForm } from '@/hooks/usePatientForm';

interface PatientFormProps {
  readonly onSubmit: (data: CreatePatientData) => Promise<void>;
  readonly isLoading?: boolean;
  readonly onCancel?: () => void;
  readonly error?: string;
  readonly initialData?: CreatePatientData;
  readonly mode?: 'create' | 'edit';
  readonly onDeactivate?: () => void;
  readonly isDeactivating?: boolean;
}

export default function PatientForm({
  onSubmit,
  isLoading,
  onCancel,
  error,
  initialData,
  mode = 'create',
  onDeactivate,
  isDeactivating = false
}: PatientFormProps) {
  const {
    formData,
    fieldErrors,
    localError,
    isSubmitting,
    isFormValid,
    handleInputChange,
    handleSubmit
  } = usePatientForm({
    initialData,
    onSubmit
  });

  const isEditMode = mode === 'edit';

  return (
    <form onSubmit={handleSubmit} className="space-y-6">
      <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
        {/* Mensaje de error */}
        {(localError || error) && (
          <div className="md:col-span-2 bg-red-50 border border-red-200 rounded-md p-4">
            <div className="flex">
              <div className="flex-shrink-0">
                <span className="text-red-400 text-lg">⚠️</span>
              </div>
              <div className="ml-3">
                <h3 className="text-sm font-medium text-red-800">
                  Error al {isEditMode ? 'actualizar' : 'crear'} paciente
                </h3>
                <div className="mt-2 text-sm text-red-700">
                  <p>{localError || error}</p>
                </div>
              </div>
            </div>
          </div>
        )}

        <div>
          <FormInput
            id="firstName"
            label="Nombre"
            value={formData.firstName}
            onChange={value => handleInputChange('firstName', value)}
            required
            className={fieldErrors.firstName ? 'border-red-500 focus:border-red-500 focus:ring-red-500' : ''}
            placeholder="Nombre del paciente"
          />
          {fieldErrors.firstName && (
            <p className="mt-1 text-sm text-red-600">{fieldErrors.firstName}</p>
          )}
        </div>

        <div>
          <FormInput
            id="lastName"
            label="Apellido"
            value={formData.lastName}
            onChange={value => handleInputChange('lastName', value)}
            required
            className={fieldErrors.lastName ? 'border-red-500 focus:border-red-500 focus:ring-red-500' : ''}
            placeholder="Apellido del paciente"
          />
          {fieldErrors.lastName && (
            <p className="mt-1 text-sm text-red-600">{fieldErrors.lastName}</p>
          )}
        </div>

        <div>
          <FormInput
            id="documentNumber"
            label="Documento"
            value={formData.documentNumber}
            onChange={value => handleInputChange('documentNumber', value)}
            required
            className={fieldErrors.documentNumber ? 'border-red-500 focus:border-red-500 focus:ring-red-500' : ''}
            placeholder="DNI: 12345678 o Pasaporte: ABC123456"
          />
          {fieldErrors.documentNumber && (
            <p className="mt-1 text-sm text-red-600">{fieldErrors.documentNumber}</p>
          )}
        </div>

        <div>
          <FormInput
            id="phone"
            label="Teléfono"
            value={formData.phone || ''}
            onChange={value => handleInputChange('phone', value)}
            type="tel"
            className={fieldErrors.phone ? 'border-red-500 focus:border-red-500 focus:ring-red-500' : ''}
            placeholder="+54 9 11 1234-5678"
          />
          {fieldErrors.phone && (
            <p className="mt-1 text-sm text-red-600">{fieldErrors.phone}</p>
          )}
        </div>

        <div>
          <FormInput
            id="email"
            label="Email"
            value={formData.email || ''}
            onChange={value => handleInputChange('email', value)}
            type="email"
            className={fieldErrors.email ? 'border-red-500 focus:border-red-500 focus:ring-red-500' : ''}
            placeholder="paciente@email.com"
          />
          {fieldErrors.email && (
            <p className="mt-1 text-sm text-red-600">{fieldErrors.email}</p>
          )}
        </div>

        <div>
          <FormInput
            id="birthDate"
            label="Fecha de Nacimiento"
            value={formData.birthDate || ''}
            onChange={value => handleInputChange('birthDate', value)}
            type="date"
            className={fieldErrors.birthDate ? 'border-red-500 focus:border-red-500 focus:ring-red-500' : ''}
            max={new Date().toISOString().split('T')[0]}
          />
          {fieldErrors.birthDate && (
            <p className="mt-1 text-sm text-red-600">{fieldErrors.birthDate}</p>
          )}
        </div>

        <div>
          <label htmlFor="gender" className="form-label">
            Género
          </label>
          <select
            id="gender"
            value={formData.gender}
            onChange={(e) => handleInputChange('gender', e.target.value)}
            className="form-input"
          >
            <option value="">Seleccionar género</option>
            <option value="M">Masculino</option>
            <option value="F">Femenino</option>
            <option value="Other">Otro</option>
          </select>
        </div>

        <div className="md:col-span-2">
          <FormInput
            id="address"
            label="Dirección"
            value={formData.address || ''}
            onChange={value => handleInputChange('address', value)}
            placeholder="Dirección completa"
          />
        </div>
      </div>

      <div className="flex justify-between pt-6 border-t border-gray-200">
        {/* Botón de dar de baja a la izquierda (solo en modo edición) */}
        <div>
          {mode === 'edit' && onDeactivate && (
            <button
              type="button"
              onClick={onDeactivate}
              disabled={isSubmitting || isLoading || isDeactivating}
              className="px-6 py-2 border border-red-300 rounded-md shadow-sm text-sm font-medium text-red-700 bg-red-50 hover:bg-red-100 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-red-500 disabled:opacity-50 disabled:cursor-not-allowed"
            >
              {isDeactivating ? (
                <div className="flex items-center">
                  <div className="animate-spin rounded-full h-4 w-4 border-b-2 border-red-600 mr-2"></div>
                  Dando de baja...
                </div>
              ) : (
                'Dar de baja'
              )}
            </button>
          )}
        </div>

        {/* Botones principales a la derecha */}
        <div className="flex space-x-3">
          {onCancel && (
            <button
              type="button"
              onClick={onCancel}
              className="px-6 py-2 border border-gray-300 rounded-md shadow-sm text-sm font-medium text-gray-700 bg-white hover:bg-gray-50 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-blue-500"
              disabled={isSubmitting || isLoading || isDeactivating}
            >
              Cancelar
            </button>
          )}

          <button
            type="submit"
            disabled={!isFormValid || isSubmitting || isLoading || isDeactivating}
            className="px-6 py-2 border border-transparent rounded-md shadow-sm text-sm font-medium text-white bg-blue-600 hover:bg-blue-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-blue-500 disabled:opacity-50 disabled:cursor-not-allowed"
          >
            {isSubmitting || isLoading ? (
              <div className="flex items-center">
                <div className="animate-spin rounded-full h-4 w-4 border-b-2 border-white mr-2"></div>
                {isEditMode ? 'Actualizando...' : 'Creando...'}
              </div>
            ) : (
              <>
                {isEditMode ? 'Actualizar Paciente' : 'Crear Paciente'}
              </>
            )}
          </button>
        </div>
      </div>
    </form>
  );
}