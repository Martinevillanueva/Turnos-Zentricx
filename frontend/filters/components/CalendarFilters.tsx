import React from 'react';

interface CalendarFiltersProps {
  localSpecialty: string;
  localDoctor: string;
  localDate: string;
  specialties: Array<{id: string, name: string}>;
  doctors: Array<{id: string, name: string, firstName: string, lastName: string, specialtyId?: string}>;
  onSpecialtyChange: (value: string) => void;
  onDoctorChange: (value: string) => void;
  onDateChange: (value: string) => void;
  onApplyFilters: () => void;
}

export default function CalendarFilters({
  localSpecialty,
  localDoctor,
  localDate,
  specialties,
  doctors,
  onSpecialtyChange,
  onDoctorChange,
  onDateChange,
  onApplyFilters
}: Readonly<CalendarFiltersProps>) {

  return (
    <div className="space-y-3">
      <div className="flex gap-4 flex-wrap">
        <div className="min-w-[200px]">
          <label htmlFor="calendar-specialty-filter" className="block text-xs font-medium text-blue-100 mb-1">
            Especialidad:
          </label>
          <select
            id="calendar-specialty-filter"
            value={localSpecialty}
            onChange={(e) => onSpecialtyChange(e.target.value)}
            className="w-full px-3 py-2 text-gray-700 bg-white border border-blue-300 rounded-md text-sm focus:ring-2 focus:ring-blue-200 focus:border-blue-400"
          >
            <option value="">Seleccionar especialidad</option>
            {specialties.map(specialty => (
              <option key={specialty.id} value={specialty.id}>
                {specialty.name}
              </option>
            ))}
          </select>
        </div>

        <div className="min-w-[200px]">
          <label htmlFor="calendar-doctor-filter" className="block text-xs font-medium text-blue-100 mb-1">
            Médico:
          </label>
          <select
            id="calendar-doctor-filter"
            value={localDoctor}
            onChange={(e) => onDoctorChange(e.target.value)}
            disabled={!localSpecialty || doctors.filter(doctor => String(doctor.specialtyId) === String(localSpecialty)).length === 0}
            className={`w-full px-3 py-2 text-gray-700 border border-blue-300 rounded-md text-sm focus:ring-2 focus:ring-blue-200 focus:border-blue-400 ${
              (!localSpecialty || doctors.filter(doctor => String(doctor.specialtyId) === String(localSpecialty)).length === 0) ? 'bg-gray-100 text-gray-400 cursor-not-allowed' : 'bg-white'
            }`}
          >
            {(() => {
              if (!localSpecialty) {
                return <option value="">Seleccionar especialidad primero</option>;
              }
              const availableDoctors = doctors.filter(doctor => String(doctor.specialtyId) === String(localSpecialty));
              if (availableDoctors.length === 0) {
                return <option value="">No hay médicos disponibles</option>;
              }
              return null; // No mostrar option vacío cuando hay médicos
            })()}
            {doctors
              .filter(doctor => {
                if (!localSpecialty) return true;
                if (doctor.specialtyId) {
                  return String(doctor.specialtyId) === String(localSpecialty);
                }
                return false;
              })
              .map(doctor => {
                const doctorName = doctor.firstName && doctor.lastName
                  ? `${doctor.firstName} ${doctor.lastName}`
                  : doctor.name || 'Médico sin nombre';
                return (
                  <option key={doctor.id} value={doctor.id}>
                    {doctorName}
                  </option>
                );
              })}
          </select>
        </div>

        <div className="min-w-[160px]">
          <label htmlFor="calendar-date-filter" className="block text-xs font-medium text-blue-100 mb-1">
            Fecha de la agenda:
          </label>
          <div className="flex gap-2">
            <input
              type="date"
              id="calendar-date-filter"
              value={localDate}
              onChange={(e) => onDateChange(e.target.value)}
              className="flex-1 px-3 py-2 text-gray-700 bg-white border border-blue-300 rounded-md text-sm focus:ring-2 focus:ring-blue-200 focus:border-blue-400"
            />
            <button
              onClick={onApplyFilters}
              disabled={!(localSpecialty && localDoctor && localDate)}
              className={`px-6 py-2 border border-gray-800 bg-gray-100 text-gray-900 rounded-md hover:bg-blue-600 transition-colors font-medium text-sm whitespace-nowrap ${localSpecialty && localDoctor && localDate ? '' : 'opacity-50 cursor-not-allowed'}`}
            >
              Buscar
            </button>
          </div>
        </div>
      </div>
    </div>
  );
}