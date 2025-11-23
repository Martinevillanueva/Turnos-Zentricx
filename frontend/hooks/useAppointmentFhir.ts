import { useState, useEffect } from 'react';

export interface FhirAppointmentFields {
  identifier: string;
  priority: number;
  appointmentType: string;
  reasonCode: string;
  serviceCategory: string;
  serviceType: string;
  patientInstruction: string;
  slotId: string;
}

interface UseAppointmentFhirProps {
  specialtyName?: string;
  doctorName?: string;
  date?: string;
  time?: string;
}

export function useAppointmentFhir({
  specialtyName,
  doctorName,
  date,
  time,
}: UseAppointmentFhirProps = {}) {
  const [fhirFields, setFhirFields] = useState<FhirAppointmentFields>({
    identifier: '',
    priority: 5, // Default: Normal
    appointmentType: 'routine', // Default: Routine
    reasonCode: '',
    serviceCategory: '',
    serviceType: '',
    patientInstruction: '',
    slotId: '',
  });

  // Auto-asignar serviceCategory desde la especialidad
  useEffect(() => {
    if (specialtyName && !fhirFields.serviceCategory) {
      setFhirFields(prev => ({
        ...prev,
        serviceCategory: specialtyName,
      }));
    }
  }, [specialtyName]);

  // Auto-asignar priority según appointmentType
  const handleAppointmentTypeChange = (type: string) => {
    let newPriority = 5; // Default
    
    switch (type) {
      case 'emergency':
        newPriority = 9; // Urgente
        break;
      case 'follow-up':
        newPriority = 6; // Media-Alta
        break;
      case 'routine':
        newPriority = 5; // Normal
        break;
      case 'checkup':
        newPriority = 4; // Media-Baja
        break;
      default:
        newPriority = 5;
    }

    setFhirFields(prev => ({
      ...prev,
      appointmentType: type,
      priority: newPriority,
    }));
  };

  const updateField = <K extends keyof FhirAppointmentFields>(
    field: K,
    value: FhirAppointmentFields[K]
  ) => {
    setFhirFields(prev => ({
      ...prev,
      [field]: value,
    }));
  };

  const resetFields = () => {
    setFhirFields({
      identifier: '',
      priority: 5,
      appointmentType: 'routine',
      reasonCode: '',
      serviceCategory: specialtyName || '',
      serviceType: '',
      patientInstruction: '',
      slotId: '',
    });
  };

  // Generar slot ID automáticamente
  const generateSlotId = () => {
    if (!date || !time || !doctorName) return '';
    
    const dateStr = date.split('-').join('');
    const timeStr = time.split(':').join('');
    const doctorInitials = doctorName
      .split(' ')
      .map(n => n[0])
      .join('')
      .toUpperCase()
      .substring(0, 3);
    
    return `SLOT-${dateStr}-${timeStr}-${doctorInitials}`;
  };

  return {
    fhirFields,
    updateField,
    resetFields,
    handleAppointmentTypeChange,
    generateSlotId,
    setFhirFields,
  };
}
