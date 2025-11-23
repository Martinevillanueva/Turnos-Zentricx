import React from 'react';
import { SimpleAppointment, AppointmentStatus } from '@/types/fhir';
import Modal from './Modal';
import StatusBadge from '@/components/StatusBadge';
import { useAppointmentStatus } from '@/hooks/useAppointmentStatus';

interface AppointmentDetailsModalProps {
  appointment: SimpleAppointment | null;
  isOpen: boolean;
  onClose: () => void;
  onStatusChange?: (id: string, status: AppointmentStatus) => void;
  onTimeSlotClick?: (date: string, time: string, context: {
    selectedSpecialty?: { id: string; name: string };
    selectedDoctor?: { id: string; name: string };
  }) => void;
  onCancelAppointment?: () => void;
}

export default function AppointmentDetailsModal({
  appointment,
  isOpen,
  onClose,
  onStatusChange,
  onTimeSlotClick,
  onCancelAppointment
}: Readonly<AppointmentDetailsModalProps>) {
  const { getStatusActions, getButtonStyle, statusLabels } = useAppointmentStatus();

  if (!appointment) return null;

  const formatAppointmentTime = (appointment: SimpleAppointment) => {
    const startTime = new Date(appointment.start);
    const endTime = new Date(appointment.end);

    return `${startTime.toLocaleTimeString('es-ES', { hour: '2-digit', minute: '2-digit' })} - ${endTime.toLocaleTimeString('es-ES', { hour: '2-digit', minute: '2-digit' })}`;
  };

  const handleReschedule = () => {
    if (!onTimeSlotClick) return;

    // Formatear la fecha para el modal
    const appointmentDate = new Date(appointment.start);
    const dateStr = appointmentDate.toISOString().split('T')[0]; // YYYY-MM-DD
    const timeStr = appointmentDate.toLocaleTimeString('es-ES', {
      hour: '2-digit',
      minute: '2-digit',
      hour12: false
    });

    // Obtener contexto de especialidad y médico
    let selectedSpecialty;
    if (appointment.specialtyInfo) {
      selectedSpecialty = {
        id: appointment.specialtyInfo.id,
        name: appointment.specialtyInfo.name
      };
    } else if (appointment.specialty && typeof appointment.specialty === 'object') {
      selectedSpecialty = {
        id: appointment.specialty.id,
        name: appointment.specialty.name
      };
    }

    let selectedDoctor;
    if (appointment.doctor && typeof appointment.doctor === 'object') {
      selectedDoctor = {
        id: appointment.doctor.id,
        name: appointment.doctor.fullName || `${appointment.doctor.firstName} ${appointment.doctor.lastName}`
      };
    } else if (appointment.doctorName) {
      selectedDoctor = {
        id: '',
        name: appointment.doctorName
      };
    }

    const context = {
      selectedSpecialty,
      selectedDoctor
    };

    onTimeSlotClick(dateStr, timeStr, context);
    onClose();
  };

  const availableActions = getStatusActions(appointment);
  const isCancelled = appointment.status?.slug === 'cancelled' || appointment.status === 'cancelled';
  const isCompleted = appointment.status?.slug === 'fulfilled';

  return (
    <Modal
      isOpen={isOpen}
      onClose={onClose}
      title="Estado del Turno"
      size="md"
    >
      <div className="space-y-6">
        {/* Encabezado del turno */}
        <div className="bg-gradient-to-r from-blue-50 to-indigo-50 rounded-lg p-4 border border-blue-200">
          <div className="text-center mb-3">
            <h3 className="text-xl font-bold text-gray-900">{appointment.patientName}</h3>
            <p className="text-sm text-gray-600 font-medium">{formatAppointmentTime(appointment)}</p>
          </div>
          
          <div className="flex items-center justify-center gap-3 flex-wrap">
            <StatusBadge status={appointment.status?.slug || appointment.status || 'pending'} />
            
            {/* Badge de Prioridad FHIR */}
            {appointment.priority !== undefined && appointment.priority !== 5 && (
              <span className={`px-2 py-1 text-xs rounded-full font-medium ${
                appointment.priority >= 8 ? 'bg-red-100 text-red-700' :
                appointment.priority >= 6 ? 'bg-orange-100 text-orange-700' :
                appointment.priority >= 4 ? 'bg-yellow-100 text-yellow-700' :
                'bg-green-100 text-green-700'
              }`}>
                Prioridad: {appointment.priority}
              </span>
            )}
            
            {/* Badge de Tipo de Turno */}
            {appointment.appointmentType && (
              <span className="px-2 py-1 text-xs rounded-full font-medium bg-purple-100 text-purple-700">
                {appointment.appointmentType === 'routine' ? 'Rutina' :
                 appointment.appointmentType === 'follow-up' ? 'Seguimiento' :
                 appointment.appointmentType === 'emergency' ? 'Emergencia' :
                 appointment.appointmentType === 'checkup' ? 'Control' :
                 appointment.appointmentType === 'consultation' ? 'Consulta' :
                 appointment.appointmentType}
              </span>
            )}
          </div>
        </div>

        {/* Información Principal */}
        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
          {/* Columna Izquierda - Datos Básicos */}
          <div className="space-y-3">
            <h4 className="font-semibold text-gray-900 text-sm uppercase tracking-wide border-b pb-1">Datos del Turno</h4>
            
            {appointment.doctorName && (
              <div className="flex items-start gap-2">
                <span className="text-sm font-medium text-gray-500 min-w-[80px]">Médico:</span>
                <span className="text-sm text-gray-900 font-medium">{appointment.doctorName}</span>
              </div>
            )}

            {(appointment.specialty || appointment.specialtyInfo?.name) && (
              <div className="flex items-start gap-2">
                <span className="text-sm font-medium text-gray-500 min-w-[80px]">Especialidad:</span>
                <span className="text-sm text-gray-900 font-medium">
                  {appointment.specialtyInfo?.name ||
                   (typeof appointment.specialty === 'object' ? appointment.specialty.name : appointment.specialty)}
                </span>
              </div>
            )}
            
            {appointment.duration && (
              <div className="flex items-start gap-2">
                <span className="text-sm font-medium text-gray-500 min-w-[80px]">Duración:</span>
                <span className="text-sm text-gray-900">{appointment.duration} minutos</span>
              </div>
            )}
            
            {appointment.createdAt && (
              <div className="flex items-start gap-2">
                <span className="text-sm font-medium text-gray-500 min-w-[80px]">Creado:</span>
                <span className="text-sm text-gray-900">
                  {new Date(appointment.createdAt).toLocaleString('es-ES', {
                    day: '2-digit',
                    month: '2-digit',
                    year: 'numeric',
                    hour: '2-digit',
                    minute: '2-digit'
                  })}
                </span>
              </div>
            )}
            
            {appointment.arrivedAt && (
              <div className="flex items-start gap-2">
                <span className="text-sm font-medium text-gray-500 min-w-[80px]">Llegada:</span>
                <span className="text-sm text-gray-900">
                  {new Date(appointment.arrivedAt).toLocaleTimeString('es-ES', {
                    hour: '2-digit',
                    minute: '2-digit'
                  })}
                </span>
              </div>
            )}
            
            {appointment.consultationStartedAt && (
              <div className="flex items-start gap-2">
                <span className="text-sm font-medium text-gray-500 min-w-[80px]">Consulta iniciada:</span>
                <span className="text-sm text-gray-900">
                  {new Date(appointment.consultationStartedAt).toLocaleTimeString('es-ES', {
                    hour: '2-digit',
                    minute: '2-digit'
                  })}
                </span>
              </div>
            )}
          </div>

          {/* Columna Derecha - Detalles Clínicos */}
          <div className="space-y-3">
            <h4 className="font-semibold text-gray-900 text-sm uppercase tracking-wide border-b pb-1">Detalles Clínicos</h4>
            
            {appointment.reason && (
              <div>
                <span className="text-sm font-medium text-gray-500 block mb-1">Motivo:</span>
                <p className="text-sm text-gray-900 bg-gray-50 p-2 rounded">{appointment.reason}</p>
              </div>
            )}
            
            {appointment.symptoms && (
              <div>
                <span className="text-sm font-medium text-gray-500 block mb-1">Síntomas:</span>
                <p className="text-sm text-gray-900 bg-gray-50 p-2 rounded">{appointment.symptoms}</p>
              </div>
            )}
            
            {appointment.description && (
              <div>
                <span className="text-sm font-medium text-gray-500 block mb-1">Descripción:</span>
                <p className="text-sm text-gray-900 bg-gray-50 p-2 rounded">{appointment.description}</p>
              </div>
            )}
            
            {appointment.notes && (
              <div>
                <span className="text-sm font-medium text-gray-500 block mb-1">Notas Médicas:</span>
                <p className="text-sm text-gray-900 bg-gray-50 p-2 rounded italic">{appointment.notes}</p>
              </div>
            )}
          </div>
        </div>

        {/* Instrucciones para el Paciente (FHIR) */}
        {appointment.patientInstruction && (
          <div className="bg-blue-50 border border-blue-200 rounded-lg p-3">
            <div className="flex items-start gap-2">
              <span className="text-blue-600 text-lg">📋</span>
              <div>
                <span className="text-sm font-semibold text-blue-900 block mb-1">Instrucciones para el Paciente:</span>
                <p className="text-sm text-blue-800">{appointment.patientInstruction}</p>
              </div>
            </div>
          </div>
        )}

        {/* Datos FHIR Adicionales */}
        {(appointment.reasonCode || appointment.identifier || appointment.serviceType || appointment.slotId) && (
          <div className="bg-purple-50 border border-purple-200 rounded-lg p-3">
            <div className="flex items-start gap-2 mb-2">
              <span className="text-purple-600 text-lg">🏥</span>
              <span className="text-sm font-semibold text-purple-900">Datos FHIR:</span>
            </div>
            <div className="grid grid-cols-1 md:grid-cols-2 gap-2 ml-7">
              {appointment.reasonCode && (
                <div className="flex items-center gap-2">
                  <span className="text-xs font-medium text-purple-600">Código ICD-10:</span>
                  <span className="text-xs text-purple-900 font-mono bg-white px-2 py-1 rounded">{appointment.reasonCode}</span>
                </div>
              )}
              {appointment.serviceType && (
                <div className="flex items-center gap-2">
                  <span className="text-xs font-medium text-purple-600">Tipo de Servicio:</span>
                  <span className="text-xs text-purple-900">{appointment.serviceType}</span>
                </div>
              )}
              {appointment.identifier && (
                <div className="flex items-center gap-2">
                  <span className="text-xs font-medium text-purple-600">ID Externo:</span>
                  <span className="text-xs text-purple-900 font-mono bg-white px-2 py-1 rounded">{appointment.identifier}</span>
                </div>
              )}
              {appointment.slotId && (
                <div className="flex items-center gap-2">
                  <span className="text-xs font-medium text-purple-600">Slot ID:</span>
                  <span className="text-xs text-purple-900 font-mono bg-white px-2 py-1 rounded">{appointment.slotId}</span>
                </div>
              )}
            </div>
          </div>
        )}

        {/* Acciones disponibles */}
        <div className="space-y-3">
          {availableActions.length > 0 && (
            <>
              <p className="text-sm text-gray-600 text-center">Seleccione el nuevo estado:</p>
              <div className="space-y-2">
                {availableActions.map((status) => (
                  <button
                    key={status}
                    onClick={() => {
                      if (onStatusChange && appointment.id) {
                        onStatusChange(appointment.id, status as AppointmentStatus);
                      }
                      onClose();
                    }}
                    className={`w-full px-4 py-2 text-sm rounded-lg border transition-all hover:scale-105 font-medium ${getButtonStyle(status)}`}
                  >
                    {statusLabels[status] || status}
                  </button>
                ))}
              </div>
            </>
          )}

          {/* Botón de reagendar para turnos cancelados */}
          {isCancelled && (
            <button
              onClick={handleReschedule}
              className="w-full px-4 py-2 text-sm rounded-lg border border-blue-300 text-blue-700 hover:bg-blue-50 hover:border-blue-400 transition-all font-medium"
            >
              📅 Agendar Nuevo Turno
            </button>
          )}

          {/* Botón de cancelar para turnos no cancelados y no completados */}
          {!isCancelled && !isCompleted && onCancelAppointment && (
            <button
              onClick={onCancelAppointment}
              className="w-full px-4 py-2 text-sm rounded-lg border border-red-300 text-red-700 hover:bg-red-50 hover:border-red-400 transition-all font-medium"
            >
              ❌ Cancelar Turno
            </button>
          )}
        </div>
      </div>
    </Modal>
  );
}