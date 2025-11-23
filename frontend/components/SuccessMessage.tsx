'use client';

import React from 'react';

interface SuccessMessageProps {
  readonly title: string;
  readonly description: string;
  readonly type?: 'success' | 'warning' | 'error';
  readonly isClosing?: boolean;
}

export default function SuccessMessage({ 
  title, 
  description, 
  type = 'success',
  isClosing = true
}: SuccessMessageProps) {
  const getColors = () => {
    switch (type) {
      case 'success':
        return {
          iconColor: 'text-green-400',
          titleColor: 'text-green-800',
          descriptionColor: 'text-green-600',
          closingColor: 'text-green-500'
        };
      case 'error':
        return {
          iconColor: 'text-red-400',
          titleColor: 'text-red-800',
          descriptionColor: 'text-red-600',
          closingColor: 'text-red-500'
        };
      case 'warning':
        return {
          iconColor: 'text-orange-400',
          titleColor: 'text-orange-800',
          descriptionColor: 'text-orange-600',
          closingColor: 'text-orange-500'
        };
      default:
        return {
          iconColor: 'text-green-400',
          titleColor: 'text-green-800',
          descriptionColor: 'text-green-600',
          closingColor: 'text-green-500'
        };
    }
  };

  const colors = getColors();

  const getIcon = () => {
    switch (type) {
      case 'success':
        return (
          <path
            strokeLinecap="round"
            strokeLinejoin="round"
            strokeWidth={2}
            d="M5 13l4 4L19 7"
          />
        );
      case 'error':
        return (
          <path
            strokeLinecap="round"
            strokeLinejoin="round"
            strokeWidth={2}
            d="M12 9v2m0 4h.01m-6.938 4h13.856c1.54 0 2.502-1.667 1.732-2.5L13.732 4c-.77-.833-1.996-.833-2.732 0L3.732 16.5c-.77.833.192 2.5 1.732 2.5z"
          />
        );
      case 'warning':
        return (
          <path
            strokeLinecap="round"
            strokeLinejoin="round"
            strokeWidth={2}
            d="M12 9v2m0 4h.01m-6.938 4h13.856c1.54 0 2.502-1.667 1.732-2.5L13.732 4c-.77-.833-1.996-.833-2.732 0L3.732 16.5c-.77.833.192 2.5 1.732 2.5z"
          />
        );
      default:
        return (
          <path
            strokeLinecap="round"
            strokeLinejoin="round"
            strokeWidth={2}
            d="M5 13l4 4L19 7"
          />
        );
    }
  };

  return (
    <div className="text-center py-8">
      <div className={`mx-auto h-16 w-16 ${colors.iconColor} mb-4`}>
        <svg
          fill="none"
          viewBox="0 0 24 24"
          stroke="currentColor"
        >
          {getIcon()}
        </svg>
      </div>
      <h2 className={`text-xl font-semibold ${colors.titleColor} mb-2`}>
        {title}
      </h2>
      <p className={`${colors.descriptionColor} mb-4`}>
        {description}
      </p>
    </div>
  );
}