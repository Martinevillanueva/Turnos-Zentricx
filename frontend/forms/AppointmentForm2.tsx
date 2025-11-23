'use client';

import React, { useState, useCallback } from 'react';
import FormInput from '@/forms/FormInput';
import FormTextarea from '@/forms/FormTextarea';
import AppointmentTypeSelect from './AppointmentTypeSelect';
import PrioritySelect from './PrioritySelect';
import ReasonCodeInput from './ReasonCodeInput';
import ServiceTypeInput from './ServiceTypeInput';
import SlotInput from './SlotInput';
import IdentifierInput from './IdentifierInput';
import { CreateAppointmentRequest } from '@/types/fhir';
import Autocomplete from '@/forms/Autocomplete';
import PatientModal from '@/modals/PatientModal';
import { AppointmentService } from '@/services/appointmentService';
import { useAppointmentFhir } from '@/hooks/useAppointmentFhir';

interface AppointmentFormProps {
  readonly onSubmit: (data: CreateAppointmentRequest, doctorId?: string, specialtyId?: string) => void;
  readonly isLoading?: boolean;
  readonly onCancel?: () => void;
}

export default function AppointmentForm({ onSubmit, isLoading, onCancel }: AppointmentFormProps) {
  const [formData, setFormData] = useState<CreateAppointmentRequest>({
    patientName: '',
    doctorName: '',
    specialty: '',
    appointmentType: 'routine',
    start: '',
    end: '',
    description: '',
    comment: '',
    priority: 5,
    patientInstruction: ''
  });

  // Estados para almacenar los IDs seleccionados
  const [selectedDoctorId, setSelectedDoctorId] = useState<string>('');
  const [selectedSpecialtyId, setSelectedSpecialtyId] = useState<string>('');
  
  // Hook para campos FHIR
  const { fhirFields, handleAppointmentTypeChange, updateField } = useAppointmentFhir({
    specialtyName: formData.specialty,
    doctorName: formData.doctorName,
    date: formData.start?.split('T')[0],
    time: formData.start?.split('T')[1],
  });

  // Estados para modal de creación de paciente
  const [isPatientModalOpen, setIsPatientModalOpen] = useState(false);

  // Funciones para validar y formatear fechas
  const isValidDate = (dateString: string): boolean => {
    if (!dateString) return false;
    const date = new Date(dateString);
    return date instanceof Date && !Number.isNaN(date.getTime());
  };

  const handleDateTimeChange = (field: 'start' | 'end', value: string) => {
    // Validar que el valor no sea excesivamente largo
    if (value.length > 16) {
      return; // Ignorar entrada excesivamente larga
    }
    
    // Si está vacío, permitir
    if (!value) {
      setFormData(prev => ({ ...prev, [field]: '' }));
      return;
    }
    
    // Verificar formato básico YYYY-MM-DDTHH:mm
    const dateTimeRegex = /^\d{4}-\d{2}-\d{2}T\d{2}:\d{2}$/;
    if (dateTimeRegex.test(value)) {
      try {
        if (isValidDate(value)) {
          const selectedDate = new Date(value);
          const now = new Date();
          const today = new Date(now.getFullYear(), now.getMonth(), now.getDate());
          const oneYearFromNow = new Date(now.getFullYear() + 1, now.getMonth(), now.getDate());
          
          // Validar que no sea anterior al día actual
          if (selectedDate < today) {
            console.warn('Fecha anterior al día actual no permitida');
            return;
          }
          
          // Validar que no sea superior a 1 año desde hoy
          if (selectedDate > oneYearFromNow) {
            console.warn('Fecha superior a 1 año no permitida');
            return;
          }
          
          setFormData(prev => ({ ...prev, [field]: value }));
        }
      } catch (error) {
        console.warn('Invalid date format:', error);
      }
    } else {
      // Permitir entrada parcial mientras se está escribiendo
      setFormData(prev => ({ ...prev, [field]: value }));
    }
  };

  // ...existing code...

  const handleInputChange = (field: keyof CreateAppointmentRequest, value: string) => {
    setFormData(prev => ({
      ...prev,
      [field]: value
    }));
    
    // Auto-calculate end time if start time and duration are set
    if (field === 'start' && value) {
      const startDate = new Date(value);
      const endDate = new Date(startDate.getTime() + 30 * 60000); // 30 minutos por defecto
      setFormData(prev => ({
        ...prev,
        end: endDate.toISOString().slice(0, 16)
      }));
    }
  };

  // Función de búsqueda para pacientes
  const searchPatients = useCallback(async (query: string) => {
    const patients = await AppointmentService.searchPatients(query);
    return patients.map(patient => ({
      id: patient.id,
      label: patient.fullName || `${patient.firstName} ${patient.lastName}`,
      subtitle: patient.email || patient.phone || undefined
    }));
  }, []);

  // Función de búsqueda para médicos
  const searchDoctors = useCallback(async (query: string) => {
    const doctors = await AppointmentService.searchDoctors(query);
    return doctors.map(doctor => ({
      id: doctor.id,
      label: doctor.fullName || `Dr. ${doctor.firstName} ${doctor.lastName}`,
      subtitle: doctor.licenseNumber ? `Matrícula: ${doctor.licenseNumber}` : undefined
    }));
  }, []);

  // Función para manejar selección de doctor
  const handleDoctorSelect = (value: string, optionId?: string) => {
    handleInputChange('doctorName', value);
    if (optionId) {
      setSelectedDoctorId(optionId);
    }
  };

  // Función de búsqueda para especialidades
  const searchSpecialties = useCallback(async (query: string) => {
    const specialties = await AppointmentService.getSpecialties();
    const filtered = specialties.filter((specialty: any) => 
      specialty.name.toLowerCase().includes(query.toLowerCase())
    );
    return filtered.map((specialty: any) => ({
      id: specialty.id,
      label: specialty.name,
      subtitle: specialty.description || undefined
    }));
  }, []);

  // Función para manejar selección de especialidad
  const handleSpecialtySelect = (value: string, optionId?: string) => {
    handleInputChange('specialty', value);
    if (optionId) {
      setSelectedSpecialtyId(optionId);
    }
  };

  // Función para crear un nuevo paciente
  const handlePatientCreated = (newPatient: any) => {
    // Actualizar el campo de paciente con el nombre del nuevo paciente
    const fullName = `${newPatient.firstName} ${newPatient.lastName}`;
    handleInputChange('patientName', fullName);
    setIsPatientModalOpen(false);
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    
    // Validar fechas antes de enviar
    if (!isValidDate(formData.start)) {
      alert('Por favor, ingrese una fecha y hora de inicio válida');
      return;
    }
    
    if (!isValidDate(formData.end)) {
      alert('Por favor, ingrese una fecha y hora de fin válida');
      return;
    }
    
    const startDate = new Date(formData.start);
    const endDate = new Date(formData.end);
    const now = new Date();
    const today = new Date(now.getFullYear(), now.getMonth(), now.getDate());
    const oneYearFromNow = new Date(now.getFullYear() + 1, now.getMonth(), now.getDate());
    
    // Validar que la fecha de fin sea posterior a la de inicio
    if (endDate <= startDate) {
      alert('La fecha de fin debe ser posterior a la fecha de inicio');
      return;
    }
    
    // Validar que no sea anterior al día actual
    if (startDate < today) {
      alert('No se pueden crear turnos para fechas anteriores al día actual');
      return;
    }
    
    // Validar que no sea superior a 1 año desde hoy
    if (startDate > oneYearFromNow || endDate > oneYearFromNow) {
      alert('No se pueden crear turnos para fechas superiores a 1 año desde hoy');
      return;
    }

    // Validar conflictos de horario si tenemos doctor y especialidad seleccionados
    if (selectedDoctorId && selectedSpecialtyId) {
      try {
        const conflictCheck = await AppointmentService.checkAppointmentConflicts(
          selectedDoctorId,
          selectedSpecialtyId,
          startDate,
          endDate
        );

        if (conflictCheck.hasConflict) {
          const conflictingTime = new Date(conflictCheck.conflictingAppointment!.start).toLocaleTimeString('es-ES', {
            hour: '2-digit',
            minute: '2-digit'
          });
          alert(`❌ Conflicto de horario: El médico ya tiene un turno programado a las ${conflictingTime} para esta especialidad.`);
          return;
        }
      } catch (error) {
        console.error('Error checking conflicts:', error);
      }
    }
    
    onSubmit(formData, selectedDoctorId || undefined, selectedSpecialtyId || undefined);
  };

  const isFormValid = formData.patientName && formData.doctorName && formData.start && formData.end;

  return (
    <>
      <form onSubmit={handleSubmit} className="space-y-6">
        <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
          <div>
            <div className="flex items-end gap-2">
              <div className="flex-1">
                <Autocomplete
                  id="patientName"
                  label="Nombre del Paciente"
                  value={formData.patientName}
                onChange={(value) => handleInputChange('patientName', value)}
                onSearch={searchPatients}
                placeholder="Ingrese el nombre completo del paciente"
                required
              />
            </div>
            <button
              type="button"
              onClick={(e) => {
                e.preventDefault();
                e.stopPropagation();
                setIsPatientModalOpen(true);
              }}
              className="px-3 py-2 bg-green-600 text-white text-sm rounded-md hover:bg-green-700 focus:outline-none focus:ring-2 focus:ring-green-500 focus:ring-offset-2 transition-colors"
              title="Crear nuevo paciente"
            >
              <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 6v6m0 0v6m0-6h6m-6 0H6" />
              </svg>
            </button>
          </div>
        </div>

        <Autocomplete
          id="doctorName"
          label="Nombre del Médico"
          value={formData.doctorName}
          onChange={handleDoctorSelect}
          onSearch={searchDoctors}
          placeholder="Ingrese el nombre del médico"
          required
        />

        <Autocomplete
          id="specialty"
          label="Especialidad"
          value={formData.specialty || ''}
          onChange={handleSpecialtySelect}
          onSearch={searchSpecialties}
          placeholder="Ingrese o seleccione una especialidad"
        />

        <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
          <AppointmentTypeSelect
            value={fhirFields.appointmentType}
            onChange={value => {
              handleAppointmentTypeChange(value);
              handleInputChange('appointmentType', value);
              setFormData(prev => ({ ...prev, appointmentType: value, priority: fhirFields.priority }));
            }}
          />

          <PrioritySelect
            value={fhirFields.priority}
            onChange={value => {
              updateField('priority', value);
              setFormData(prev => ({ ...prev, priority: value }));
            }}
          />
        </div>
        
        {/* Campos FHIR adicionales */}
        <div className="space-y-4 bg-blue-50 p-4 rounded-lg border border-blue-200">
          <h3 className="text-sm font-semibold text-blue-900 flex items-center gap-2">
            <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 12h6m-6 4h6m2 5H7a2 2 0 01-2-2V5a2 2 0 012-2h5.586a1 1 0 01.707.293l5.414 5.414a1 1 0 01.293.707V19a2 2 0 01-2 2z" />
            </svg>
            Campos FHIR R4 (Opcional)
          </h3>
          
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <IdentifierInput
              value={fhirFields.identifier}
              onChange={value => {
                updateField('identifier', value);
                setFormData(prev => ({ ...prev, identifier: value }));
              }}
            />
            
            <ReasonCodeInput
              value={fhirFields.reasonCode}
              onChange={value => {
                updateField('reasonCode', value);
                setFormData(prev => ({ ...prev, reasonCode: value }));
              }}
            />
          </div>
          
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <ServiceTypeInput
              value={fhirFields.serviceType}
              serviceCategory={fhirFields.serviceCategory}
              onChange={value => {
                updateField('serviceType', value);
                setFormData(prev => ({ ...prev, serviceType: value }));
              }}
            />
            
            <SlotInput
              value={fhirFields.slotId}
              doctorName={formData.doctorName}
              date={formData.start?.split('T')[0]}
              time={formData.start?.split('T')[1]}
              onChange={value => {
                updateField('slotId', value);
                setFormData(prev => ({ ...prev, slotId: value }));
              }}
            />
          </div>
        </div>

        <FormInput
          id="start"
          label="Fecha y Hora de Inicio *"
          type="datetime-local"
          value={formData.start}
          onChange={value => handleDateTimeChange('start', value)}
          min={new Date().toISOString().slice(0, 16)}
          max={new Date(new Date().getFullYear() + 1, new Date().getMonth(), new Date().getDate()).toISOString().slice(0, 16)}
          required
        />

        <FormInput
          id="end"
          label="Fecha y Hora de Fin *"
          type="datetime-local"
          value={formData.end}
          onChange={value => handleDateTimeChange('end', value)}
          min={formData.start || new Date().toISOString().slice(0, 16)}
          max={new Date(new Date().getFullYear() + 1, new Date().getMonth(), new Date().getDate()).toISOString().slice(0, 16)}
          required
        />
      </div>

      <FormTextarea
        id="description"
        label="Descripción"
        value={formData.description || ''}
        onChange={value => handleInputChange('description', value)}
        rows={3}
        placeholder="Descripción de la cita médica"
      />

      <FormTextarea
        id="comment"
        label="Comentarios adicionales"
        value={formData.comment || ''}
        onChange={value => handleInputChange('comment', value)}
        rows={2}
        placeholder="Comentarios o notas especiales"
      />

      <FormTextarea
        id="patientInstruction"
        label="Instrucciones para el Paciente"
        value={formData.patientInstruction || ''}
        onChange={value => setFormData(prev => ({ ...prev, patientInstruction: value }))}
        rows={3}
        placeholder="Ej: Venir en ayunas 12 horas, traer estudios previos, no suspender medicación..."
      />

      <div className="flex justify-end space-x-3 pt-6 border-t border-gray-200">
        <button
          type="button"
          className="px-4 py-2 text-sm font-medium text-red-700 bg-red-50 border border-red-200 rounded-md hover:bg-red-100 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-red-500 transition-colors"
          onClick={onCancel || (() => globalThis.history.back())}
        >
          Cancelar
        </button>
        <button
          type="submit"
          disabled={!isFormValid || isLoading}
          className={`btn-primary ${(!isFormValid || isLoading) ? 'opacity-50 cursor-not-allowed' : ''}`}
        >
          {isLoading ? 'Creando...' : 'Crear Turno'}
        </button>
      </div>
      </form>

      {/* Modal para crear nuevo paciente */}
      <PatientModal
        isOpen={isPatientModalOpen}
        onClose={() => setIsPatientModalOpen(false)}
        onPatientCreated={handlePatientCreated}
        title="Nuevo Paciente"
      />

    </>
  );
}