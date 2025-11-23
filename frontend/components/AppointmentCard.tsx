'use client';

import React, { useState, useEffect } from 'react';
import { createPortal } from 'react-dom';
import { SimpleAppointment, AppointmentStatus } from '@/types/fhir';
import { useQuickAppointment } from '@/hooks/useQuickAppointment';
import QuickAppointmentForm from '@/forms//QuickAppointmentForm';
import AppointmentService from '@/services/appointmentService';
import { useConsultationTimer } from '@/hooks/useConsultationTimer';
import StatusBadge from '@/components/StatusBadge';
import SpecialtyLabel from './SpecialtyLabel';
import CancelAppointmentModal from '@/modals/CancelAppointmentModal';
import { useAppointmentActions } from '@/hooks/useAppointmentActions';
import { useAppointmentFormatting } from '@/hooks/useAppointmentFormatting';

interface AppointmentCardProps {
  readonly appointment: SimpleAppointment;
  readonly onStatusChange?: (id: string, status: AppointmentStatus) => void;
  readonly onTimeSlotClick?: (date: string, time: string, context?: {
    selectedSpecialty?: { id: string; name: string };
    selectedDoctor?: { id: string; name: string };
  }) => void;
  readonly index?: number; // Para alternar colores
  readonly showPatientInfo?: boolean; // Para mostrar u ocultar información del paciente
}

export default function AppointmentCard({ 
  appointment, 
  onStatusChange, 
  onTimeSlotClick, 
  index = 0,
  showPatientInfo = true
}: AppointmentCardProps) {
  const [isExpanded, setIsExpanded] = useState(false);
  const [isMounted, setIsMounted] = useState(false);
  
  // Hook para acciones de turno
  const {
    showCancelConfirm,
    handleCancel,
    confirmCancel,
    cancelCancel,
    handleStatusChange: handleStatusChangeFromHook,
  } = useAppointmentActions({
    appointmentId: appointment.id,
    onStatusChange,
  });

  // Hook para formateo y estilos
  const {
    statusLabels,
    formatTime,
    formatTimeWithoutSeconds,
    formatDateTimeWithoutSeconds,
    getButtonLabel,
    getButtonStyle,
    getExpandedButtonStyle,
    getStatusActions,
    translateAppointmentType,
  } = useAppointmentFormatting();
  
  // Hook para modal de nuevo turno
  const {
    isQuickModalOpen,
    quickModalDate,
    quickModalTime,
    quickModalContext,
    isCreatingAppointment,
    setIsCreatingAppointment,
    openQuickModal,
    closeQuickModal
  } = useQuickAppointment();
  
  // Verificar que estamos en el cliente
  useEffect(() => {
    setIsMounted(true);
  }, []);
  
  // Determinar si está en consulta y obtener tiempo de inicio
  const isInConsultation = appointment.status?.slug === 'in-consultation' || appointment.status === 'in-consultation';
  const consultationStartTime = appointment.consultationStartedAt || appointment.consultationStartTime;
  
  const elapsed = useConsultationTimer(isInConsultation ? consultationStartTime : undefined);

  const startDate = new Date(appointment.startTime || appointment.start);
  const endDate = new Date(appointment.endTime || appointment.end);

  // Alternar colores de fondo
  const isEven = index % 2 === 0;
  const bgColor = isEven ? 'bg-gray-50' : 'bg-white';
  const borderColor = isEven ? 'border-gray-200' : 'border-gray-100';

  const statusActions = getStatusActions(appointment.status?.slug || appointment.status);

  // Determinar color de la barra izquierda
  const status = appointment.status?.slug || appointment.status;
  const colorMap = {
    'cancelled': 'bg-red-500',
    'pending': 'bg-yellow-300',
    'in-consultation': 'bg-orange-400',
    'booked': 'bg-blue-600',
    'arrived': 'bg-green-600',
    'fulfilled': 'bg-emerald-600',
  };
  const barColor = (colorMap as any)[status] || 'bg-gray-400';

  return (
    <div className={`relative ${bgColor} border-b ${borderColor} hover:bg-blue-50 transition-colors duration-150`}>
      {/* Barra de color izquierda */}
      <div className={`absolute left-0 top-0 bottom-0 w-2 ${barColor}`}></div>
      
      {/* Fila principal tipo agenda */}
      <button 
        className="w-full p-4 pl-5 text-left flex items-center justify-between focus:outline-none focus:ring-2 focus:ring-blue-500 focus:ring-offset-2 hover:bg-opacity-75 transition-all"
        onClick={() => setIsExpanded(!isExpanded)}
      >
        {/* Hora */}
        <div className="flex-shrink-0 w-20 text-right">
          <div className="text-lg font-semibold text-gray-900">
            {formatTime(startDate)}
          </div>
          <div className="text-xs text-gray-500">
            {(appointment.duration || 30)}min
          </div>
        </div>

        {/* Separador vertical */}
        <div className="w-px bg-gray-200 h-12 mx-4"></div>

        {/* Información principal */}
        <div className="flex-1 min-w-0">
          <div className="flex items-center gap-3 mb-1 flex-wrap">
            {showPatientInfo && (
              <h3 className="text-lg font-semibold text-gray-900 truncate">
                {appointment.patient?.fullName || appointment.patientName || 'Paciente'}
              </h3>
            )}
            <StatusBadge status={appointment.status?.slug || appointment.status} label={appointment.status?.label} />
            
            {/* Badge de Prioridad FHIR */}
            {appointment.priority !== undefined && appointment.priority !== 5 && (
              <span className={`px-2 py-0.5 text-xs rounded-full font-medium ${
                appointment.priority >= 8 ? 'bg-red-100 text-red-700' :
                appointment.priority >= 6 ? 'bg-orange-100 text-orange-700' :
                appointment.priority >= 4 ? 'bg-yellow-100 text-yellow-700' :
                'bg-green-100 text-green-700'
              }`}>
                P{appointment.priority}
              </span>
            )}
            
            {(appointment.status?.slug === 'in-consultation' || appointment.status === 'in-consultation') && elapsed && (
              <div className="flex items-center gap-1 text-orange-600 bg-orange-100 px-2 py-1 rounded-full text-xs font-mono animate-pulse">
                <span className="w-2 h-2 bg-orange-500 rounded-full animate-pulse"></span>
                Tiempo: {elapsed}
              </div>
            )}
          </div>
          <div className="flex items-center gap-4 text-sm text-gray-600">
            <span className="font-medium text-blue-600">
              {appointment.doctor?.fullName || `Dr. ${appointment.doctorName}` || 'Doctor'}
            </span>
            {/* Componente para mostrar la especialidad correctamente */}
            <SpecialtyLabel specialty={appointment.specialty} />
            {appointment.appointmentType && (
              <span>• {translateAppointmentType(appointment.appointmentType)}</span>
            )}
          </div>
        </div>

        {/* Acciones rápidas */}
        <div className="flex-shrink-0 flex items-center gap-2 ml-4">
          {statusActions.slice(0, 2).map((status) => (
            <button
              key={status}
              onClick={(e) => {
                e.stopPropagation();
                handleStatusChangeFromHook(status);
              }}
              className={`px-3 py-1 text-xs rounded-full border transition-all hover:scale-105 ${getButtonStyle(status)}`}
            >
              {getButtonLabel(status)}
            </button>
          ))}
          <button className="text-gray-400 hover:text-gray-600 p-1">
            {isExpanded ? '▲' : '▼'}
          </button>
        </div>
      </button>

      {/* Contenido expandido */}
      {isExpanded && (
        <div className="border-t border-gray-200 px-4 pb-4 bg-white bg-opacity-50">
          <div className="max-w-6xl mx-auto">
            <div className="grid grid-cols-1 md:grid-cols-3 gap-8 mt-4">
              {/* Información del turno - IZQUIERDA */}
              <div className="space-y-3">
                <h4 className="font-semibold text-gray-900 text-sm uppercase tracking-wide">Información del Turno</h4>
                <div className="space-y-2 text-sm">
                  <div className="flex items-center gap-2">
                    <span className="text-gray-500 min-w-[60px]">Inicio:</span>
                    <span className="font-medium">{formatDateTimeWithoutSeconds(startDate)}</span>
                  </div>
                  <div className="flex items-center gap-2">
                    <span className="text-gray-500 min-w-[60px]">Fin:</span>
                    <span className="font-medium">{formatDateTimeWithoutSeconds(endDate)}</span>
                  </div>
                  {appointment.createdAt && (
                    <div className="flex items-center gap-2">
                      <span className="text-gray-500 min-w-[60px]">Creado:</span>
                      <span className="font-medium">{formatDateTimeWithoutSeconds(new Date(appointment.createdAt))}</span>
                    </div>
                  )}
                </div>
              </div>

              {/* Detalles adicionales - CENTRO */}
              <div className="space-y-3">
                <h4 className="font-semibold text-gray-900 text-sm uppercase tracking-wide text-center">Detalles</h4>
                <div className="space-y-3 text-sm text-center">
                  {(appointment.reason || appointment.symptoms) && (
                    <div>
                      <span className="text-gray-500 block font-medium mb-1">Motivo de consulta:</span>
                      <p className="text-gray-900">{appointment.reason || 'No especificado'}</p>
                    </div>
                  )}
                  {appointment.symptoms && (
                    <div>
                      <span className="text-gray-500 block font-medium mb-1">Síntomas:</span>
                      <p className="text-gray-900">{appointment.symptoms}</p>
                    </div>
                  )}
                  {appointment.patientInstruction && (
                    <div className="bg-blue-50 p-2 rounded border border-blue-200">
                      <span className="text-blue-700 block font-medium mb-1 text-xs">📋 Instrucciones para el Paciente:</span>
                      <p className="text-blue-900 text-xs">{appointment.patientInstruction}</p>
                    </div>
                  )}
                  
                  {/* Campos FHIR adicionales */}
                  {(appointment.reasonCode || appointment.identifier || appointment.serviceType || appointment.slotId) && (
                    <div className="bg-purple-50 p-2 rounded border border-purple-200 space-y-1">
                      <span className="text-purple-700 block font-medium mb-1 text-xs">🏥 Datos FHIR:</span>
                      {appointment.reasonCode && (
                        <div className="text-xs">
                          <span className="text-purple-600 font-medium">ICD-10:</span>
                          <span className="text-purple-900 ml-1">{appointment.reasonCode}</span>
                        </div>
                      )}
                      {appointment.serviceType && (
                        <div className="text-xs">
                          <span className="text-purple-600 font-medium">Servicio:</span>
                          <span className="text-purple-900 ml-1">{appointment.serviceType}</span>
                        </div>
                      )}
                      {appointment.identifier && (
                        <div className="text-xs">
                          <span className="text-purple-600 font-medium">ID Externo:</span>
                          <span className="text-purple-900 ml-1">{appointment.identifier}</span>
                        </div>
                      )}
                      {appointment.slotId && (
                        <div className="text-xs">
                          <span className="text-purple-600 font-medium">Slot:</span>
                          <span className="text-purple-900 ml-1 font-mono">{appointment.slotId}</span>
                        </div>
                      )}
                    </div>
                  )}
                  
                  {appointment.notes && (
                    <div>
                      <span className="text-gray-500 block font-medium mb-1">Notas médicas:</span>
                      <p className="text-gray-900 italic">{appointment.notes}</p>
                    </div>
                  )}
                  {(appointment.consultationStartedAt || appointment.arrivedAt) && (
                    <div className="pt-2 border-t border-gray-100 space-y-1">
                      {appointment.arrivedAt && (
                        <div className="flex justify-center">
                          <div className="flex items-center gap-2">
                            <span className="text-gray-500 text-xs min-w-[100px]">Hora de llegada:</span>
                            <span className="text-gray-700 text-xs">{formatTimeWithoutSeconds(appointment.arrivedAt)}</span>
                          </div>
                        </div>
                      )}
                      {appointment.consultationStartedAt && (
                        <div className="flex justify-center">
                          <div className="flex items-center gap-2">
                            <span className="text-gray-500 text-xs min-w-[100px]">Consulta iniciada:</span>
                            <span className="text-gray-700 text-xs">{formatTimeWithoutSeconds(appointment.consultationStartedAt)}</span>
                          </div>
                        </div>
                      )}
                    </div>
                  )}
                </div>
              </div>

              {/* Sección de acciones */}
              {(statusActions.length > 0 || 
                (appointment.status?.slug === 'cancelled' || appointment.status === 'cancelled') ||
                !(appointment.status?.slug === 'cancelled' || appointment.status === 'cancelled') && 
                !(appointment.status?.slug === 'fulfilled' || appointment.status === 'fulfilled')) && (
                <div className="space-y-3">
                  <h4 className="font-semibold text-gray-900 text-sm uppercase tracking-wide text-center">Acciones</h4>
                  <div className="flex flex-col items-center gap-2">
                    {statusActions.map((status) => (
                      <button
                        key={status}
                        onClick={(e) => {
                          e.stopPropagation();
                          handleStatusChangeFromHook(status);
                        }}
                        className={`px-4 py-2 text-sm rounded-lg border transition-all hover:scale-105 font-medium w-full max-w-[200px] ${getExpandedButtonStyle(status)}`}
                      >
                        {statusLabels[status]}
                      </button>
                    ))}
                    
                    {/* Botón de agendar nuevo turno para turnos cancelados */}
                    {(appointment.status?.slug === 'cancelled' || appointment.status === 'cancelled') && (
                      <button
                        onClick={(e) => {
                          e.stopPropagation();
                          const appointmentDate = new Date(appointment.start);
                          const dateStr = appointmentDate.toISOString().split('T')[0];
                          const timeStr = appointmentDate.toLocaleTimeString('es-ES', { 
                            hour: '2-digit', 
                            minute: '2-digit',
                            hour12: false 
                          });
                          
                          const context = {
                            selectedSpecialty: appointment.specialty && typeof appointment.specialty === 'object' 
                              ? { id: appointment.specialty.id, name: appointment.specialty.name }
                              : undefined,
                            selectedDoctor: appointment.doctor && typeof appointment.doctor === 'object'
                              ? { id: appointment.doctor.id, name: appointment.doctor.fullName || `${appointment.doctor.firstName} ${appointment.doctor.lastName}` }
                              : undefined
                          };
                          
                          openQuickModal(dateStr, timeStr, context);
                        }}
                        className="px-4 py-2 text-sm rounded-lg border border-blue-300 text-blue-700 hover:bg-blue-50 hover:border-blue-400 transition-all hover:scale-105 font-medium w-full max-w-[200px]"
                      >
                        📅 Agendar Nuevo Turno
                      </button>
                    )}
                    
                    {/* Solo botón de cancelar para turnos no cancelados y no completados */}
                    {!(appointment.status?.slug === 'cancelled' || appointment.status === 'cancelled') && 
                     !(appointment.status?.slug === 'fulfilled' || appointment.status === 'fulfilled') && (
                      <button
                        onClick={(e) => {
                          e.stopPropagation();
                          handleCancel();
                        }}
                        className="px-4 py-2 text-sm rounded-lg border border-red-300 text-red-700 hover:bg-red-50 hover:border-red-400 transition-all hover:scale-105 font-medium w-full max-w-[200px]"
                      >
                        ❌ Cancelar Turno
                      </button>
                    )}
                  </div>
                </div>
              )}
            </div>
          </div>
        </div>
      )}

      {/* Modal de confirmación para cancelar turno */}
      <CancelAppointmentModal
        patientName={appointment.patient?.fullName || appointment.patientName || 'este paciente'}
        isOpen={showCancelConfirm}
        onCancel={cancelCancel}
        onConfirm={confirmCancel}
      />
      
      {/* Modal de nuevo turno */}
      {isMounted && isQuickModalOpen && (() => {
        return createPortal(
          <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50" onClick={closeQuickModal}>
            <div className="bg-white rounded-lg max-w-md w-full mx-4 max-h-[90vh] overflow-y-auto" onClick={(e) => e.stopPropagation()}>
              <QuickAppointmentForm
                selectedDate={quickModalDate}
                selectedTime={quickModalTime}
                preSelectedSpecialty={quickModalContext.selectedSpecialty}
                preSelectedDoctor={quickModalContext.selectedDoctor}
                onSubmit={async (data) => {
                  setIsCreatingAppointment(true);
                  try {
                    // Crear la fecha de inicio y fin (asegurando que se use la zona horaria local)
                    const [year, month, day] = quickModalDate.split('-').map(Number);
                    const [hours, minutes] = quickModalTime.split(':').map(Number);
                    
                    const startDateTime = new Date(year, month - 1, day, hours, minutes);
                    const endDateTime = new Date(startDateTime.getTime() + 30 * 60000); // +30 minutos
                    
                    const appointmentData = {
                      patientName: data.patientName,
                      doctorName: '', // Se resuelve en el backend
                      start: startDateTime.toISOString(),
                      end: endDateTime.toISOString(),
                      description: data.description || '',
                      priority: data.priority,
                      appointmentType: data.appointmentType,
                      serviceType: data.serviceType,
                      patientInstruction: data.patientInstruction,
                    };
                    
                    await AppointmentService.createAppointmentWithIds(appointmentData, data.doctorId, data.specialtyId);
                    closeQuickModal();
                    // Recargar la página
                    if (typeof globalThis !== 'undefined') {
                      globalThis.location.reload();
                    }
                  } catch (error) {
                    console.error('Error creating appointment:', error);
                    setIsCreatingAppointment(false);
                  }
                }}
                onCancel={closeQuickModal}
                isLoading={isCreatingAppointment}
              />
            </div>
          </div>,
          document.body
        );
      })()}
    </div>
  );
}