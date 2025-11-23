import { useState } from 'react';

export interface FhirFilterState {
  appointmentType: string;
  priority: string;
  serviceCategory: string;
}

export function useFhirFilters(onFilterChange?: () => void) {
  const [appointmentType, setAppointmentType] = useState('');
  const [priority, setPriority] = useState('');
  const [serviceCategory, setServiceCategory] = useState('');

  const handleAppointmentTypeChange = (value: string) => {
    setAppointmentType(value);
    onFilterChange?.();
  };

  const handlePriorityChange = (value: string) => {
    setPriority(value);
    onFilterChange?.();
  };

  const handleServiceCategoryChange = (value: string) => {
    setServiceCategory(value);
    onFilterChange?.();
  };

  const clearFilters = () => {
    setAppointmentType('');
    setPriority('');
    setServiceCategory('');
    onFilterChange?.();
  };

  const hasActiveFilters = Boolean(appointmentType || priority || serviceCategory);

  return {
    appointmentType,
    priority,
    serviceCategory,
    setAppointmentType: handleAppointmentTypeChange,
    setPriority: handlePriorityChange,
    setServiceCategory: handleServiceCategoryChange,
    clearFilters,
    hasActiveFilters,
  };
}
