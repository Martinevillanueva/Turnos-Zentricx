import { useState, useCallback } from 'react';
import AppointmentService from '@/services/appointmentService';
import { SimpleAppointment } from '@/types/fhir';

interface UseAppointmentDataOptions {
  viewType: 'list' | 'calendar' | 'patients';
  currentPage: number;
  listFilterSpecialty: string;
  listFilterDoctor: string;
  listFilterPatientName: string;
  listShowCancelled: boolean;
  calendarFilterDoctor: string;
}

export const useAppointmentData = ({
  viewType,
  currentPage,
  listFilterSpecialty,
  listFilterDoctor,
  listFilterPatientName,
  listShowCancelled,
  calendarFilterDoctor,
}: UseAppointmentDataOptions) => {
  const [appointments, setAppointments] = useState<SimpleAppointment[]>([]);
  const [specialties, setSpecialties] = useState<{ id: string; name: string }[]>([]);
  const [doctors, setDoctors] = useState<
    {
      id: string;
      name: string;
      firstName: string;
      lastName: string;
      specialtyId?: string;
      specialty?: any;
    }[]
  >([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [paginationInfo, setPaginationInfo] = useState({
    total: 0,
    totalPages: 0,
    page: 1,
    limit: 20,
  });

  const isSameDay = (date1: Date, date2: Date) => {
    const d1 = new Date(date1.getFullYear(), date1.getMonth(), date1.getDate());
    const d2 = new Date(date2.getFullYear(), date2.getMonth(), date2.getDate());
    return d1.getTime() === d2.getTime();
  };

  const loadSpecialties = useCallback(async () => {
    try {
      const data = await AppointmentService.getSpecialties();
      setSpecialties(data);
    } catch (err) {
      console.warn("Error al cargar especialidades:", err);
    }
  }, []);

  const loadDoctors = useCallback(async () => {
    try {
      const data = await AppointmentService.getDoctors();
      const mappedDoctors = data.map((doctor: any) => {
        if (
          doctor.specialty &&
          typeof doctor.specialty === "object" &&
          doctor.specialty.id
        ) {
          return { ...doctor, specialtyId: String(doctor.specialty.id) };
        } else if (
          doctor.specialty &&
          (typeof doctor.specialty === "string" ||
            typeof doctor.specialty === "number")
        ) {
          return { ...doctor, specialtyId: String(doctor.specialty) };
        }
        return doctor;
      });
      setDoctors(mappedDoctors);
    } catch (err) {
      console.warn("Error al cargar médicos:", err);
    }
  }, []);

  const loadAppointments = useCallback(async (doctorId?: string) => {
    try {
      setLoading(true);
      setError(null);
      const selectedDate = new Date().toISOString().split("T")[0];

      // Vista de agenda
      if (viewType === "calendar") {
        const targetDoctorId = doctorId || calendarFilterDoctor;

        if (!targetDoctorId) {
          setAppointments([]);
          setLoading(false);
          return;
        }

        const data = await AppointmentService.getAppointments({
          doctorId: targetDoctorId,
        });
        setAppointments(data);
        return;
      }

      // Vista de lista
      try {
        const filters: any = {
          date: selectedDate,
          page: currentPage,
          limit: 20,
        };

        if (listFilterSpecialty) {
          filters.specialtyId = listFilterSpecialty;
        }
        if (listFilterDoctor) {
          filters.doctorId = listFilterDoctor;
        }
        if (!listShowCancelled) {
          filters.excludeCancelled = true;
        }

        const result = await AppointmentService.getAppointmentsPaginated(filters);

        let filteredAppointments = result.appointments;
        if (listFilterPatientName) {
          filteredAppointments = result.appointments.filter((appointment) => {
            const patientName = (
              appointment.patient?.fullName ||
              appointment.patientName ||
              ""
            ).toLowerCase();
            return patientName.includes(listFilterPatientName.toLowerCase());
          });
        }

        setAppointments(filteredAppointments);
        setPaginationInfo({
          total: result.total,
          totalPages: result.totalPages,
          page: result.page,
          limit: result.limit,
        });
      } catch (paginatedError) {
        console.warn("Paginated API failed, trying regular API:", paginatedError);
        const data = await AppointmentService.getAppointments({
          date: selectedDate,
        });

        let filteredData = data.filter((appointment) => {
          const appointmentDate = new Date(appointment.start);
          const selectedDateParts = selectedDate.split("-");
          const selected = new Date(
            Number.parseInt(selectedDateParts[0], 10),
            Number.parseInt(selectedDateParts[1], 10) - 1,
            Number.parseInt(selectedDateParts[2], 10)
          );

          if (!isSameDay(appointmentDate, selected)) {
            return false;
          }

          if (listFilterSpecialty) {
            let appointmentSpecialtyId = "";
            if (appointment.specialtyInfo?.id) {
              appointmentSpecialtyId = String(appointment.specialtyInfo.id);
            } else if (
              appointment.specialty &&
              typeof appointment.specialty === "object" &&
              appointment.specialty.id
            ) {
              appointmentSpecialtyId = String(appointment.specialty.id);
            }
            if (appointmentSpecialtyId !== String(listFilterSpecialty)) {
              return false;
            }
          }

          if (listFilterDoctor) {
            let appointmentDoctorId = "";
            if (appointment.doctor && typeof appointment.doctor === "object") {
              appointmentDoctorId = String(appointment.doctor.id);
            }
            if (appointmentDoctorId !== String(listFilterDoctor)) {
              return false;
            }
          }

          if (listFilterPatientName) {
            const patientName = (
              appointment.patient?.fullName ||
              appointment.patientName ||
              ""
            ).toLowerCase();
            if (!patientName.includes(listFilterPatientName.toLowerCase())) {
              return false;
            }
          }

          return true;
        });

        const total = filteredData.length;
        const totalPages = Math.ceil(total / 20);
        const startIndex = (currentPage - 1) * 20;
        const endIndex = startIndex + 20;
        const paginatedData = filteredData.slice(startIndex, endIndex);

        setAppointments(paginatedData);
        setPaginationInfo({
          total,
          totalPages,
          page: currentPage,
          limit: 20,
        });
      }
    } catch (err) {
      console.error("Error loading appointments:", err);
      setError(
        err instanceof Error ? err.message : "Error al cargar los turnos"
      );
    } finally {
      setLoading(false);
    }
  }, [
    viewType,
    currentPage,
    listFilterSpecialty,
    listFilterDoctor,
    listFilterPatientName,
    listShowCancelled,
    calendarFilterDoctor,
  ]);

  return {
    appointments,
    specialties,
    doctors,
    loading,
    error,
    paginationInfo,
    setAppointments,
    setError,
    loadSpecialties,
    loadDoctors,
    loadAppointments,
  };
};
