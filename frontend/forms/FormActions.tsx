import React from 'react';

interface FormActionsProps {
  onSubmit?: () => void;
  onCancel?: () => void;
  onSecondaryAction?: () => void;
  submitLabel?: string;
  cancelLabel?: string;
  secondaryActionLabel?: string;
  isSubmitting?: boolean;
  isLoading?: boolean;
  isDisabled?: boolean;
  submitButtonType?: 'button' | 'submit' | 'reset';
  cancelButtonType?: 'button' | 'submit' | 'reset';
  secondaryButtonType?: 'button' | 'submit' | 'reset';
  submitButtonClassName?: string;
  cancelButtonClassName?: string;
  secondaryButtonClassName?: string;
  className?: string;
  direction?: 'horizontal' | 'vertical';
}

export default function FormActions({
  onSubmit,
  onCancel,
  onSecondaryAction,
  submitLabel = 'Guardar',
  cancelLabel = 'Cancelar',
  secondaryActionLabel,
  isSubmitting = false,
  isLoading = false,
  isDisabled = false,
  submitButtonType = 'submit',
  cancelButtonType = 'button',
  secondaryButtonType = 'button',
  submitButtonClassName = 'btn-primary',
  cancelButtonClassName = 'btn-secondary',
  secondaryButtonClassName = 'btn-secondary',
  className = '',
  direction = 'horizontal'
}: FormActionsProps) {
  const containerClass = direction === 'horizontal'
    ? 'flex justify-end space-x-3'
    : 'flex flex-col space-y-3';

  return (
    <div className={`${containerClass} pt-6 border-t border-gray-200 ${className}`}>
      {/* Acción secundaria (opcional) */}
      {onSecondaryAction && secondaryActionLabel && (
        <button
          type={secondaryButtonType}
          onClick={onSecondaryAction}
          className={secondaryButtonClassName}
          disabled={isSubmitting || isLoading || isDisabled}
        >
          {secondaryActionLabel}
        </button>
      )}

      {/* Botones principales */}
      <div className={direction === 'horizontal' ? 'flex space-x-3' : 'flex flex-col space-y-3'}>
        {/* Botón de cancelar */}
        {onCancel && (
          <button
            type={cancelButtonType}
            onClick={onCancel}
            className={cancelButtonClassName}
            disabled={isSubmitting || isLoading}
          >
            {cancelLabel}
          </button>
        )}

        {/* Botón de submit */}
        {onSubmit && (
          <button
            type={submitButtonType}
            onClick={onSubmit}
            disabled={isSubmitting || isLoading || isDisabled}
            className={`${submitButtonClassName} flex items-center gap-2`}
          >
            {isSubmitting || isLoading ? (
              <>
                <div className="animate-spin rounded-full h-4 w-4 border-b-2 border-white"></div>
                {isSubmitting ? 'Guardando...' : 'Cargando...'}
              </>
            ) : (
              submitLabel
            )}
          </button>
        )}
      </div>
    </div>
  );
}