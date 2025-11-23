import React from 'react';

interface PatientAvatarProps {
  gender?: string;
  size?: 'sm' | 'md' | 'lg' | 'xl';
  className?: string;
}

export default function PatientAvatar({
  gender,
  size = 'md',
  className = ''
}: PatientAvatarProps) {
  const sizeClasses = {
    sm: 'w-8 h-8',
    md: 'w-16 h-16',
    lg: 'w-24 h-24',
    xl: 'w-32 h-32'
  };

  const iconSize = {
    sm: 'w-4 h-4',
    md: 'w-8 h-8',
    lg: 'w-12 h-12',
    xl: 'w-16 h-16'
  };

  const isMale = gender === 'M' || gender === 'male' || gender === 'Masculino';
  const isFemale = gender === 'F' || gender === 'female' || gender === 'Femenino';

  const getIcon = () => {
    if (isMale) {
      return (
        <svg className={`${iconSize[size]} text-blue-500`} fill="currentColor" viewBox="0 0 20 20">
          <path fillRule="evenodd" d="M10 9a3 3 0 100-6 3 3 0 000 6zm-7 9a7 7 0 1114 0H3z" clipRule="evenodd" />
        </svg>
      );
    } else if (isFemale) {
      return (
        <svg className={`${iconSize[size]} text-pink-500`} fill="currentColor" viewBox="0 0 20 20">
          <path fillRule="evenodd" d="M10 9a3 3 0 100-6 3 3 0 000 6zm-7 9a7 7 0 1114 0H3z" clipRule="evenodd" />
        </svg>
      );
    } else {
      return (
        <svg className={`${iconSize[size]} text-gray-500`} fill="currentColor" viewBox="0 0 20 20">
          <path fillRule="evenodd" d="M10 9a3 3 0 100-6 3 3 0 000 6zm-7 9a7 7 0 1114 0H3z" clipRule="evenodd" />
        </svg>
      );
    }
  };

  return (
    <div className={`${sizeClasses[size]} bg-gray-100 rounded-full flex items-center justify-center ${className}`}>
      {getIcon()}
    </div>
  );
}