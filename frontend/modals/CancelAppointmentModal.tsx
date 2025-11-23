import React from 'react';

interface CancelAppointmentModalProps {
  patientName: string;
  isOpen: boolean;
  onCancel: () => void;
  onConfirm: () => void;
}

export default function CancelAppointmentModal({ patientName, isOpen, onCancel, onConfirm }: Readonly<CancelAppointmentModalProps>) {
  if (!isOpen) return null;
  return (
    <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-[1000000]">
      <div className="bg-white rounded-lg p-6 max-w-md w-full mx-4 border border-gray-200 shadow-lg z-[1000001]">
        <div className="text-center">
          <div className="mb-4">
            <div className="mx-auto w-16 h-16 bg-orange-100 rounded-full flex items-center justify-center mb-4">
              <span className="text-orange-600 text-2xl">❌</span>
            </div>
            <h3 className="text-lg font-semibold text-gray-900 mb-2">
              Cancelar Turno
            </h3>
            <p className="text-gray-600 mb-4">
              ¿Está seguro de que desea cancelar el turno de <strong>{patientName}</strong>?
            </p>
            <p className="text-sm text-gray-500">
              El turno permanecerá en el sistema pero marcado como cancelado.
            </p>
          </div>
          <div className="flex gap-3">
            <button
              onClick={onCancel}
              className="flex-1 px-4 py-2 text-gray-700 bg-gray-200 rounded-lg hover:bg-gray-300 transition-colors"
            >
              No cancelar
            </button>
            <button
              onClick={onConfirm}
              className="flex-1 px-4 py-2 bg-red-600 text-white rounded-lg hover:bg-red-700 transition-colors"
            >
              Cancelar Turno
            </button>
          </div>
        </div>
      </div>
    </div>
  );
}
