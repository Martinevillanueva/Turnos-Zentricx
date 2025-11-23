import React from 'react';

interface ConfirmDeactivateModalProps {
  patient: any;
  isDeactivating: boolean;
  onCancel: () => void;
  onConfirm: () => void;
}

export default function ConfirmDeactivateModal({ patient, isDeactivating, onCancel, onConfirm }: Readonly<ConfirmDeactivateModalProps>) {
  return (
    <div className="text-center py-8">
      <div className="mx-auto flex items-center justify-center h-12 w-12 rounded-full bg-orange-100 mb-4">
        <svg className="h-6 w-6 text-orange-600" fill="none" viewBox="0 0 24 24" stroke="currentColor">
          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M12 9v2m0 4h.01m-6.938 4h13.856c1.54 0 2.502-1.667 1.732-2.5L13.732 4c-.77-.833-1.996-.833-2.732 0L3.732 16.5c-.77.833.192 2.5 1.732 2.5z" />
        </svg>
      </div>
      <h3 className="text-lg font-medium text-gray-900 mb-2">
        ¿Dar de baja paciente?
      </h3>
      <p className="text-sm text-gray-500 mb-6">
        ¿Estás seguro de que quieres dar de baja a{' '}
        <span className="font-medium">
          {patient?.firstName} {patient?.lastName}
        </span>?
        <br />
        El paciente no aparecerá en las búsquedas y no podrá tener nuevos turnos.
      </p>
      <div className="flex justify-center space-x-4">
        <button
          onClick={onCancel}
          disabled={isDeactivating}
          className="px-4 py-2 bg-gray-500 text-white text-base font-medium rounded-md shadow-sm hover:bg-gray-600 focus:outline-none focus:ring-2 focus:ring-gray-300 disabled:opacity-50"
        >
          Cancelar
        </button>
        <button
          onClick={onConfirm}
          disabled={isDeactivating}
          className="px-4 py-2 bg-red-600 text-white text-base font-medium rounded-md shadow-sm hover:bg-red-700 focus:outline-none focus:ring-2 focus:ring-red-500 disabled:opacity-50"
        >
          {isDeactivating ? (
            <>
              <div className="animate-spin rounded-full h-4 w-4 border-b-2 border-white mr-2 inline-block"></div>
              Dando de baja...
            </>
          ) : (
            'Dar de baja'
          )}
        </button>
      </div>
    </div>
  );
}
