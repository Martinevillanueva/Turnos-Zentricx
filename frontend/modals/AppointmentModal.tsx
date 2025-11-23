import React from 'react';
import { createPortal } from 'react-dom';
import QuickAppointmentForm from '@/forms/QuickAppointmentForm';

interface QuickAppointmentModalProps {
  isOpen: boolean;
  onClose: () => void;
  modalSuccess: boolean;
  modalError: string | null;
  quickModalDate: string;
  quickModalTime: string;
  quickModalContext: {
    selectedSpecialty?: { id: string; name: string };
    selectedDoctor?: { id: string; name: string };
  };
  onSubmit: (data: {
    patientName: string;
    doctorId: string;
    specialtyId: string;
    description?: string;
    priority?: number;
    appointmentType?: string;
    serviceType?: string;
    patientInstruction?: string;
  }) => Promise<void>;
  isCreatingAppointment: boolean;
}

export default function QuickAppointmentModal({
  isOpen,
  onClose,
  modalSuccess,
  modalError,
  quickModalDate,
  quickModalTime,
  quickModalContext,
  onSubmit,
  isCreatingAppointment,
}: QuickAppointmentModalProps) {
  if (!isOpen || typeof document === 'undefined') {
    return null;
  }

  return createPortal(
    <>
      <button
        className="fixed bg-gray-900 bg-opacity-50 z-[99999] border-0 p-0 cursor-default"
        style={{
          position: "fixed",
          top: 0,
          left: 0,
          right: 0,
          bottom: 0,
          width: "100vw",
          height: "100vh",
          zIndex: 99999,
          minHeight: "100vh",
          minWidth: "100vw",
        }}
        onClick={onClose}
        aria-label="Cerrar modal"
      />
      <div
        className="fixed inset-0 flex items-center justify-center p-4 z-[99999] overflow-y-auto"
        style={{ zIndex: 100000 }}
      >
        <div className="bg-white rounded-lg shadow-xl max-w-2xl w-full max-h-[90vh] overflow-y-auto my-8 relative">
          {modalSuccess ? (
            /* Mensaje de éxito */
            <div className="p-8 text-center">
              <div className="mx-auto h-16 w-16 text-green-400 mb-4">
                <svg
                  fill="none"
                  viewBox="0 0 24 24"
                  stroke="currentColor"
                >
                  <path
                    strokeLinecap="round"
                    strokeLinejoin="round"
                    strokeWidth={2}
                    d="M5 13l4 4L19 7"
                  />
                </svg>
              </div>
              <h2 className="text-xl font-semibold text-green-800 mb-2">
                ¡Turno creado exitosamente!
              </h2>
              <p className="text-green-600 mb-4">
                El turno ha sido registrado en el sistema.
              </p>
            </div>
          ) : (
            /* Formulario rápido */
            <>
              <div className="flex items-center justify-between p-4 border-b border-gray-200">
                <h2 className="text-lg font-semibold text-gray-900">
                  Crear Turno
                </h2>
                <button
                  onClick={onClose}
                  className="text-gray-400 hover:text-gray-600 transition-colors"
                >
                  <svg
                    className="w-6 h-6"
                    fill="none"
                    stroke="currentColor"
                    viewBox="0 0 24 24"
                  >
                    <path
                      strokeLinecap="round"
                      strokeLinejoin="round"
                      strokeWidth={2}
                      d="M6 18L18 6M6 6l12 12"
                    />
                  </svg>
                </button>
              </div>

              {modalError && (
                <div className="mx-6 mt-4 bg-red-50 border border-red-200 text-red-700 px-4 py-3 rounded-md">
                  <p className="font-medium">Error:</p>
                  <p>{modalError}</p>
                </div>
              )}

              <QuickAppointmentForm
                selectedDate={quickModalDate}
                selectedTime={quickModalTime}
                preSelectedSpecialty={quickModalContext.selectedSpecialty}
                preSelectedDoctor={quickModalContext.selectedDoctor}
                onSubmit={onSubmit}
                onCancel={onClose}
                isLoading={isCreatingAppointment}
              />
            </>
          )}
        </div>
      </div>
    </>,
    document.body
  );
}
