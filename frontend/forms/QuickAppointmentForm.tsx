'use client';

import React, { useState } from 'react';
import PatientModal from '@/modals/PatientModal';
import SelectInput from '@/forms/SelectInput';
import { usePatientSearch } from '@/hooks/usePatientSearch';
import { useDoctors } from '@/hooks/useDoctors';
import { useSpecialties } from '@/hooks/useSpecialties';
import { useQuickAppointmentForm } from '@/hooks/useQuickAppointmentForm';


interface AppointmentFormProps {
  selectedDate: string;
  selectedTime: string;
  preSelectedSpecialty?: { id: string; name: string };
  preSelectedDoctor?: { id: string; name: string };
  onSubmit: (data: {
    patientName: string;
    doctorId: string;
    specialtyId: string;
    description?: string;
    priority?: number;
    appointmentType?: string;
    serviceType?: string;
    patientInstruction?: string;
  }) => void;
  onCancel: () => void;
  isLoading?: boolean;
}

export default function AppointmentForm({ 
  selectedDate, 
  selectedTime,
  preSelectedSpecialty,
  preSelectedDoctor,
  onSubmit, 
  onCancel, 
  isLoading = false 
}: Readonly<AppointmentFormProps>) {
  const [description, setDescription] = useState('');
  const [showCreatePatientModal, setShowCreatePatientModal] = useState(false);
  
  // Estados para campos FHIR
  const [priority, setPriority] = useState<number>(5);
  const [appointmentType, setAppointmentType] = useState<string>('routine');
  const [serviceType, setServiceType] = useState<string>('');
  const [patientInstruction, setPatientInstruction] = useState<string>('');

  // Usar hooks para lógica de negocio
  const {
    patientName,
    selectedPatient,
    patientSuggestions,
    showPatientSuggestions,
    handlePatientNameChange,
    handlePatientSelect,
    handleClearPatient,
    handlePatientCreated: handlePatientCreatedFromHook
  } = usePatientSearch();

  const {
    doctors,
    loading: loadingDoctors,
    selectedDoctorId,
    setSelectedDoctorId,
    selectedDoctor
  } = useDoctors(preSelectedDoctor?.id);

  const {
    specialties,
    loading: loadingSpecialties
  } = useSpecialties();

  const {
    selectedSpecialtyId,
    setSelectedSpecialtyId,
    handleSubmit,
    formatDateTime
  } = useQuickAppointmentForm({
    selectedDate,
    selectedTime,
    preSelectedSpecialty,
    preSelectedDoctor,
    doctors,
    selectedDoctorId,
    onSubmit,
    patientName,
    selectedPatient,
    description,
    priority,
    appointmentType,
    serviceType,
    patientInstruction
  });

  const handlePatientCreated = (newPatient: any) => {
    handlePatientCreatedFromHook(newPatient);
    setShowCreatePatientModal(false);
  };

  const handleFormSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    handleSubmit();
  };

  const dateTime = formatDateTime();

  return (
    <div className="bg-white">
      {/* Header */}
      <div className="bg-blue-50 px-6 py-4 border-b border-blue-200">
        <h3 className="text-lg font-semibold text-blue-900">Fecha de turno:</h3>
        <div className="text-sm text-blue-700 mt-1">
          <div className="font-medium">{dateTime.date}</div>
          <div className="flex items-center gap-2">
            <span>📅 {dateTime.timeRange}</span>
            <span className="text-blue-500">(30 minutos)</span>
          </div>
        </div>
      </div>

      {/* Formulario */}
      <form onSubmit={handleFormSubmit} className="p-6 space-y-4">
        {/* Nombre del paciente con autocomplete */}
        <div className="relative">
          <div className="flex items-center justify-between mb-2">
            <label htmlFor="patient-name" className="form-label mb-0">
              Nombre del Paciente *
            </label>
            <button
              type="button"
              onClick={() => setShowCreatePatientModal(true)}
              className="inline-flex items-center px-2 py-1 text-xs font-medium text-blue-600 bg-blue-100 rounded-md hover:bg-blue-200 transition-colors"
              title="Crear nuevo paciente"
              disabled={isLoading}
            >
              <span className="text-sm mr-1">+</span>
              <span>Nuevo</span>
            </button>
          </div>
          {selectedPatient ? (
            /* Paciente seleccionado - Vista anclada */
            <div className="relative">
              <div className="form-input bg-green-50 border-green-200 text-green-800 pr-10">
                <div className="flex items-center justify-between">
                  <div>
                    <div className="font-medium">{patientName}</div>
                    {selectedPatient.documentNumber && (
                      <div className="text-xs text-green-600">DNI: {selectedPatient.documentNumber}</div>
                    )}
                  </div>
                  <span className="text-xs text-green-600 bg-green-100 px-2 py-1 rounded-full">
                    ✓ Seleccionado
                  </span>
                </div>
              </div>
              <button
                type="button"
                onClick={handleClearPatient}
                className="absolute right-2 top-1/2 transform -translate-y-1/2 text-green-400 hover:text-green-600 bg-white rounded-full p-1 shadow-sm border border-green-200"
                title="Limpiar selección"
                disabled={isLoading}
              >
                ✕
              </button>
            </div>
          ) : (
            /* Búsqueda de paciente - Input normal */
            <div className="relative">
              <input
                type="text"
                id="patient-name"
                value={patientName}
                onChange={(e) => handlePatientNameChange(e.target.value)}
                onBlur={() => {
                  // El hook maneja automáticamente el ocultamiento de sugerencias
                }}
                onFocus={() => {
                  if (patientName.length >= 3) {
                    // La búsqueda se hace automáticamente en handlePatientNameChange
                  }
                }}
                placeholder="Escriba el nombre del paciente para buscar..."
                className="form-input"
                disabled={isLoading}
                autoFocus
                autoComplete="off"
              />
              
              {/* Sugerencias de pacientes */}
              {showPatientSuggestions && patientSuggestions.length > 0 && (
                <div className="absolute z-50 w-full mt-1 bg-white border border-gray-300 rounded-md shadow-lg max-h-40 overflow-y-auto">
                  {patientSuggestions.map((patient) => {
                    const displayName = patient.fullName || `${patient.firstName} ${patient.lastName}`;
                    return (
                      <button
                        key={patient.id}
                        type="button"
                        className="w-full px-3 py-2 text-left hover:bg-blue-50 focus:bg-blue-50 border-0 text-sm"
                        onClick={() => handlePatientSelect(patient)}
                      >
                        <div className="font-medium">{displayName}</div>
                        {patient.documentNumber && (
                          <div className="text-xs text-gray-500">DNI: {patient.documentNumber}</div>
                        )}
                      </button>
                    );
                  })}
                </div>
              )}
              
              {/* Mensaje de ayuda cuando no hay paciente seleccionado */}
              {!showPatientSuggestions && patientName.length > 0 && patientName.length < 3 && (
                <div className="absolute z-50 w-full mt-1 bg-yellow-50 border border-yellow-200 rounded-md p-3">
                  <p className="text-xs text-yellow-700">Escriba al menos 3 caracteres para buscar pacientes</p>
                </div>
              )}
              
              {/* Mensaje cuando no se encuentran pacientes */}
              {!showPatientSuggestions && patientName.length >= 3 && (
                <div className="absolute z-50 w-full mt-1 bg-gray-50 border border-gray-200 rounded-md p-3">
                  <p className="text-xs text-gray-600">No se encontraron pacientes. Use el botón "+ Nuevo" para crear uno.</p>
                </div>
              )}
            </div>
          )}
        </div>

        {/* Médico */}
        <div>
          <label htmlFor="doctor" className="form-label">
            Médico *
          </label>
          {preSelectedDoctor ? (
            <div className="form-input bg-blue-50 border-blue-200 text-blue-800">
              <div className="flex items-center justify-between">
                <span className="font-medium">{preSelectedDoctor.name}</span>
                <span className="text-xs text-blue-600 bg-blue-100 px-2 py-1 rounded-full">
                  Pre-seleccionado
                </span>
              </div>
            </div>
          ) : (
            <SelectInput
              id="doctor"
              label=""
              value={selectedDoctorId}
              options={doctors.map(doctor => ({
                id: doctor.id,
                label: doctor.fullName || `${doctor.firstName} ${doctor.lastName}`
              }))}
              onChange={setSelectedDoctorId}
              disabled={isLoading || loadingDoctors}
              placeholder="Seleccionar médico"
            />
          )}
        </div>

        {/* Especialidad */}
        <div>
          <label htmlFor="specialty" className="form-label">
            Especialidad *
          </label>
          {preSelectedSpecialty ? (
            <div className="form-input bg-green-50 border-green-200 text-green-800">
              <div className="flex items-center justify-between">
                <span className="font-medium">{preSelectedSpecialty.name}</span>
                <span className="text-xs text-green-600 bg-green-100 px-2 py-1 rounded-full">
                  Pre-seleccionado
                </span>
              </div>
            </div>
          ) : (() => {
              const doctorSpecialty = selectedDoctor?.specialty;
              if (doctorSpecialty) {
                return (
                  <div className="form-input bg-blue-50 border-blue-200 text-blue-800">
                    <div className="flex items-center justify-between">
                      <span className="font-medium">{doctorSpecialty.name}</span>
                      <span className="text-xs text-blue-600 bg-blue-100 px-2 py-1 rounded-full">
                        Asociado al médico
                      </span>
                    </div>
                  </div>
                );
              }
              return (
                <SelectInput
                  id="specialty"
                  label=""
                  value={selectedSpecialtyId}
                  options={specialties.map(specialty => ({
                    id: specialty.id,
                    label: specialty.name
                  }))}
                  onChange={setSelectedSpecialtyId}
                  disabled={isLoading || loadingSpecialties || Boolean(doctorSpecialty)}
                  placeholder={selectedDoctorId && !doctorSpecialty
                    ? "El médico seleccionado no tiene especialidad asignada"
                    : "Seleccionar especialidad"}
                />
              );
            })()
          }
        </div>

        {/* Prioridad */}
        <div>
          <label htmlFor="priority" className="form-label">
            Prioridad *
          </label>
          <select
            id="priority"
            value={priority}
            onChange={(e) => setPriority(Number(e.target.value))}
            className="form-input"
            disabled={isLoading}
          >
            <option value={1}>🔴 Urgente (1)</option>
            <option value={2}>🟠 Muy Alta (2)</option>
            <option value={3}>🟡 Alta (3)</option>
            <option value={4}>🟢 Media-Alta (4)</option>
            <option value={5}>⚪ Normal (5)</option>
            <option value={6}>🔵 Media-Baja (6)</option>
            <option value={7}>🟣 Baja (7)</option>
            <option value={8}>⚫ Muy Baja (8)</option>
            <option value={9}>⚪ Mínima (9)</option>
          </select>
        </div>

        {/* Tipo de Cita */}
        <div>
          <label htmlFor="appointmentType" className="form-label">
            Tipo de Cita *
          </label>
          <select
            id="appointmentType"
            value={appointmentType}
            onChange={(e) => setAppointmentType(e.target.value)}
            className="form-input"
            disabled={isLoading}
          >
            <option value="routine">📋 Consulta de Rutina</option>
            <option value="follow-up">🔄 Seguimiento</option>
            <option value="emergency">🚨 Emergencia</option>
            <option value="checkup">✅ Chequeo General</option>
            <option value="consultation">💬 Consulta</option>
          </select>
        </div>

        {/* Tipo de Servicio */}
        <div>
          <label htmlFor="serviceType" className="form-label">
            Tipo de Servicio
          </label>
          <input
            type="text"
            id="serviceType"
            value={serviceType}
            onChange={(e) => setServiceType(e.target.value)}
            placeholder="Ej: Consulta general, Examen físico, etc."
            className="form-input"
            disabled={isLoading}
          />
          <p className="text-xs text-gray-500 mt-1">Especifique el tipo de servicio específico para esta especialidad</p>
        </div>

        {/* Descripción */}
        <div>
          <label htmlFor="description" className="form-label">
            Motivo de la consulta
          </label>
          <textarea
            id="description"
            value={description}
            onChange={(e) => setDescription(e.target.value)}
            placeholder="Descripción opcional del motivo de la consulta"
            className="form-input"
            rows={3}
            disabled={isLoading}
          />
        </div>

        {/* Instrucciones para el Paciente */}
        <div>
          <label htmlFor="patientInstruction" className="form-label">
            Instrucciones para el Paciente
          </label>
          <textarea
            id="patientInstruction"
            value={patientInstruction}
            onChange={(e) => setPatientInstruction(e.target.value)}
            placeholder="Ej: Venir en ayunas, traer estudios previos, etc."
            className="form-input"
            rows={2}
            disabled={isLoading}
          />
          <p className="text-xs text-gray-500 mt-1">Instrucciones o preparaciones especiales que debe seguir el paciente</p>
        </div>

        {/* Botones */}
        <div className="flex justify-end gap-3 pt-4 border-t border-gray-200">
          <button
            type="button"
            onClick={onCancel}
            className="btn-secondary"
            disabled={isLoading}
          >
            Cancelar
          </button>
          <button
            type="submit"
            className="btn-primary flex items-center gap-2"
            disabled={
              isLoading || 
              !selectedPatient || 
              !selectedDoctorId || 
              (!selectedSpecialtyId && !selectedDoctor?.specialty)
            }
          >
            {isLoading ? (
              <>
                <div className="animate-spin rounded-full h-4 w-4 border-b-2 border-white"></div>
                Creando...
              </>
            ) : (
              <>
                Crear Turno
              </>
            )}
          </button>
        </div>
      </form>

      {/* Modal para crear paciente */}
      <PatientModal
        isOpen={showCreatePatientModal}
        onClose={() => setShowCreatePatientModal(false)}
        onPatientCreated={handlePatientCreated}
        title="Nuevo Paciente"
      />
    </div>
  );
}