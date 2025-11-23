// Exportar componentes de filtros
export { default as AppointmentFilters } from './components/AppointmentFilters';
export { default as CalendarFilters } from './components/CalendarFilters';
export { default as SelectFilter } from './components/SelectFilter';

// Exportar hooks de filtros
export { useListFilters, useCalendarFilters } from './hooks/useAppointmentFilters';

// Exportar utilidades de filtros
export {
  extractSpecialtyId,
  extractDoctorId,
  extractPatientName,
  isSameDay,
  isAppointmentCancelled,
  filterBySpecialty,
  filterByDoctor,
  filterByPatientName,
  filterByDate,
  filterByStatus,
  filterCancelled,
  filterCancelledDuplicates,
  sortAppointmentsByDate,
} from './utils/appointmentFilterUtils';
