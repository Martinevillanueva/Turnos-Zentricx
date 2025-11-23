"use client";

import React, { useState, useEffect } from "react";
import CalendarAgenda from "@/components/CalendarAgenda";
import PatientModal from "@/modals/PatientModal";
import QuickAppointmentModal from "@/modals/AppointmentModal";
import AppointmentListSection from "@/components/AppointmentListSection";
import PatientsSection from "@/components/PatientsSection";
import AppHeader from "./AppHeader";
import AppointmentService from "@/services/appointmentService";
import { usePatientModal } from "@/hooks/usePatientModal";
import { usePatients } from "@/hooks/usePatients";
import { useQuickAppointmentModal } from "@/hooks/useQuickAppointmentModal";
import { 
  useListFilters, 
  useCalendarFilters, 
  filterCancelledDuplicates,
  filterBySpecialty,
  filterByDoctor,
  filterByPatientName,
  filterByDate,
  filterByStatus,
  filterCancelled,
  sortAppointmentsByDate
} from "@/filters";
import {
  SimpleAppointment,
  AppointmentStatus,
} from "@/types/fhir";

// Extender la interfaz Window para incluir propiedades personalizadas
declare global {
  interface Window {
    __onPatientProfileUpdated?: ((patient: any) => void) | null;
  }
  
  var __onPatientProfileUpdated: ((patient: any) => void) | null | undefined;
}

export default function HomePage() {
  const [appointments, setAppointments] = useState<SimpleAppointment[]>([]);
  const [specialties, setSpecialties] = useState<
    { id: string; name: string }[]
  >([]);
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
  const [currentPage, setCurrentPage] = useState(1);
  const [selectedDate] = useState<string>(
    new Date().toISOString().split("T")[0]
  );
  const [viewType, setViewType] = useState<"list" | "calendar" | "patients">("list");
  // Hooks personalizados
  const patientModal = usePatientModal();
  const patientsData = usePatients();
  const quickAppointment = useQuickAppointmentModal();
  const [paginationInfo, setPaginationInfo] = useState({
    total: 0,
    totalPages: 0,
    page: 1,
    limit: 20,
  });
  const [statusMap, setStatusMap] = useState<Record<string, string>>({});
  const appointmentsPerPage = 20;

  // Hooks de filtros con recarga automática
  const listFilters = useListFilters({
    doctors,
    onFilterChange: () => {
      if (!loading && viewType === "list") {
        setCurrentPage(1);
        loadAppointments();
      }
    },
  });

  const calendarFilters = useCalendarFilters({
    doctors,
  });

  // Inicializar con fecha actual y cargar datos
  useEffect(() => {
    const initializeData = async () => {
      await loadSpecialties();
      await loadDoctors();
      await loadStatusMap();
      await loadAppointments(); // Cargar turnos después de cargar los datos básicos
    };
    initializeData();
  }, []);

  const loadStatusMap = async () => {
    try {
      const map = await AppointmentService.getStatusMap();
      setStatusMap(map);
    } catch (err) {
      console.warn("Error al cargar mapa de estados:", err);
    }
  };

  const loadAppointments = async () => {
    try {
      setLoading(true);
      setError(null);

      // Si estamos en vista de agenda, usar lógica original sin paginación
      if (viewType === "calendar") {
        const targetDoctorId = calendarFilters.doctor;

        // Si no hay médico seleccionado en agenda, no cargamos nada
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

      // Para vista de lista - SIEMPRE filtrar por fecha del día
      try {
        const filters: any = {
          date: selectedDate, // Siempre incluir fecha del día actual
          page: currentPage,
          limit: 20,
        };

        // Agregar filtros activos solo si tienen valor
        if (listFilters.specialty) {
          filters.specialtyId = listFilters.specialty;
        }
        if (listFilters.doctor) {
          filters.doctorId = listFilters.doctor;
        }
        
        // Convertir statusFilter (slugs) a statusIds usando el mapa
        if (listFilters.statusFilter.length > 0) {
          const statusIds = listFilters.statusFilter
            .map(slug => statusMap[slug])
            .filter(Boolean);
          
          if (statusIds.length > 0) {
            filters.statusIds = statusIds.join(',');
          }
        }

        // Agregar filtros FHIR si están presentes
        if (listFilters.fhirAppointmentType) {
          filters.appointmentType = listFilters.fhirAppointmentType;
        }
        if (listFilters.fhirPriority) {
          filters.priority = listFilters.fhirPriority;
        }

        const result = await AppointmentService.getAppointmentsPaginated(
          filters
        );

        // Aplicar filtros de frontend (solo paciente, los estados ya vienen filtrados del backend)
        let filteredAppointments = result.appointments;
        
        // Filtro por nombre de paciente
        if (listFilters.patientName) {
          filteredAppointments = filteredAppointments.filter((appointment) => {
            const patientName = (
              appointment.patient?.fullName ||
              appointment.patientName ||
              ""
            ).toLowerCase();
            return patientName.includes(listFilters.patientName.toLowerCase());
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
        console.warn(
          "Paginated API failed, trying regular API:",
          paginatedError
        );
        // Fallback al método original si falla la paginación
        const data = await AppointmentService.getAppointments({
          date: selectedDate,
        });

        // Aplicar filtros manualmente usando utilidades
        const selectedDateParts = selectedDate.split("-");
        const targetDate = new Date(
          Number.parseInt(selectedDateParts[0], 10),
          Number.parseInt(selectedDateParts[1], 10) - 1,
          Number.parseInt(selectedDateParts[2], 10)
        );
        
        let filteredData = filterByDate(data, targetDate);
        filteredData = filterBySpecialty(filteredData, listFilters.specialty);
        filteredData = filterByDoctor(filteredData, listFilters.doctor);
        filteredData = filterByPatientName(filteredData, listFilters.patientName);
        filteredData = filterByStatus(filteredData, listFilters.statusFilter);

        // Simular paginación en frontend
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
  };

  const loadSpecialties = async () => {
    try {
      const data = await AppointmentService.getSpecialties();
      setSpecialties(data);
    } catch (err) {
      console.warn("Error al cargar especialidades:", err);
      // No mostrar error al usuario, solo log en consola
    }
  };

  const loadDoctors = async () => {
    try {
      const data = await AppointmentService.getDoctors();
      // Mapear specialtyId si existe specialty en el objeto
      const mappedDoctors = data.map((doctor: any) => {
        // Si el doctor tiene specialty como objeto o id, lo mapeamos
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
      // No mostrar error al usuario, solo log en consola
    }
  };

  const handleStatusChange = async (id: string, status: AppointmentStatus) => {
    try {
      await AppointmentService.updateAppointmentStatus(id, status);
      // Actualizar el status localmente en lugar de recargar toda la lista
      setAppointments(prevAppointments =>
        prevAppointments.map(appointment =>
          appointment.id === id
            ? { ...appointment, status: status }
            : appointment
        )
      );
    } catch (err) {
      setError(
        err instanceof Error ? err.message : "Error al actualizar el turno"
      );
    }
  };

  const handleQuickAppointment = async (data: {
    patientName: string;
    doctorId: string;
    specialtyId: string;
    description?: string;
  }) => {
    await quickAppointment.handleQuickAppointment(data, loadAppointments);
  };

  const handleTimeSlotClick = (
    date: string,
    time: string,
    context?: {
      selectedSpecialty?: { id: string; name: string };
      selectedDoctor?: { id: string; name: string };
    }
  ) => {
    quickAppointment.openQuickModal(date, time, context);
  };

  const handlePatientCreated = (newPatient: any) => {
    if (viewType === "patients") {
      patientsData.loadPatients();
    }
  };

  const handlePatientUpdated = (updatedPatient: any) => {
    if (viewType === "patients") {
      patientsData.loadPatients();
    }
  };

  // Filtrar y ordenar turnos para vista de agenda
  const getFilteredAppointmentsForAgenda = () => {
    const selectedDate = new Date(calendarFilters.selectedDate);
    
    // Filtrar por fecha seleccionada
    let filtered = filterByDate(appointments || [], selectedDate);
    
    // Siempre filtrar cancelados en agenda
    filtered = filterCancelled(filtered, false);
    
    // Aplicar filtro de cancelados duplicados
    filtered = filterCancelledDuplicates(filtered);

    // Filtrar por especialidad
    filtered = filterBySpecialty(filtered, calendarFilters.specialty);
    
    // Filtrar por doctor
    filtered = filterByDoctor(filtered, calendarFilters.doctor);
    
    // Ordenar por fecha
    return sortAppointmentsByDate(filtered);
  };

  // Para vista de lista, aplicar filtro de nombre de paciente en frontend
  const getFilteredAppointmentsForList = () => {
    let filtered = appointments;

    // Filtrar por nombre de paciente
    filtered = filterByPatientName(filtered, listFilters.patientName);

    // Aplicar filtro de cancelados duplicados SOLO si no se quieren mostrar cancelados
    return filterCancelledDuplicates(filtered);
  };

  // Para vista de lista, usar directamente los appointments cargados (ya paginados del backend) pero aplicar filtro de nombre
  const filteredAndSortedAppointments =
    viewType === "calendar"
      ? getFilteredAppointmentsForAgenda()
      : getFilteredAppointmentsForList(); // Aplicar filtro de nombre en frontend

  // Calcular paginación
  const hasPatientFilter = listFilters.patientName.trim() !== "";
  // El filtro de estados ahora se aplica en el backend, no es filtro frontend
  const hasActiveFilters = hasPatientFilter;
  
  // Usar paginación del backend solo si no hay filtros frontend (paciente es el único filtro frontend)
  const useBackendPagination = !hasActiveFilters;
  
  const totalPages = useBackendPagination
    ? paginationInfo.totalPages
    : Math.ceil(filteredAndSortedAppointments.length / appointmentsPerPage);

  const total = useBackendPagination
    ? paginationInfo.total
    : filteredAndSortedAppointments.length;

  // Para vista de lista, usar directamente appointments (ya paginados) excepto cuando hay filtros aplicados
  // Para vista de agenda, aplicar paginación frontend
  const currentAppointments =
    viewType === "list" && useBackendPagination
      ? filteredAndSortedAppointments
      : (() => {
          const startIndex = (currentPage - 1) * appointmentsPerPage;
          const endIndex = startIndex + appointmentsPerPage;
          return filteredAndSortedAppointments.slice(startIndex, endIndex);
        })();

  const startIndex =
    viewType === "list" && useBackendPagination
      ? (paginationInfo.page - 1) * paginationInfo.limit + 1
      : (currentPage - 1) * appointmentsPerPage + 1;

  const endIndex =
    viewType === "list" && useBackendPagination
      ? Math.min(startIndex + appointments.length - 1, paginationInfo.total)
      : Math.min(startIndex + currentAppointments.length - 1, total);

  // Cargar pacientes cuando cambie la paginación
  useEffect(() => {
    if (viewType === "patients") {
      patientsData.loadPatients();
    }
  }, [viewType, patientsData.patientsPagination.page]);

  // Recargar cuando cambia la página o la vista (pero no en la primera carga)
  useEffect(() => {
    if (!loading) {
      loadAppointments();
    }
  }, [currentPage, viewType, calendarFilters.doctor]);



  // Manejar tecla Escape para cerrar modal
  useEffect(() => {
    const handleEscape = (event: KeyboardEvent) => {
      if (event.key === "Escape") {
        if (quickAppointment.isQuickModalOpen) {
          quickAppointment.closeQuickModal();
        }
      }
    };

    document.addEventListener("keydown", handleEscape);
    return () => document.removeEventListener("keydown", handleEscape);
  }, [quickAppointment.isQuickModalOpen]);

  if (loading) {
    return (
      <div className="flex justify-center items-center min-h-64">
        <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-primary-600"></div>
      </div>
    );
  }

  return (
    <div className="space-y-6">
      {/* Header con título, toggle de vista y mensaje de error */}
      <AppHeader
        viewType={viewType}
        onViewTypeChange={setViewType}
        error={error}
        onRetry={loadAppointments}
      />

      {/* Vista condicional */}
      {viewType === "calendar" && (
        <CalendarAgenda
          appointments={appointments}
          selectedDate={calendarFilters.selectedDate}
          onAppointmentClick={() => {}}
          onStatusChange={handleStatusChange}
          onTimeSlotClick={(date, time, context) => {
            handleTimeSlotClick(date, time, context);
          }}
          onFiltersChange={(specialty, doctor, date) => {
            calendarFilters.setSpecialty(specialty);
            if (doctor && typeof doctor === "object" && "id" in doctor) {
              calendarFilters.setDoctor(String((doctor as any).id));
            } else {
              calendarFilters.setDoctor(String(doctor));
            }
            calendarFilters.setSelectedDate(date);
          }}
          specialties={specialties}
          doctors={doctors}
          filterSpecialty={calendarFilters.specialty}
          filterDoctor={calendarFilters.doctor}
        />
      )}

      {viewType === "list" && (
        <AppointmentListSection
          listFilterSpecialty={listFilters.specialty}
          setListFilterSpecialty={listFilters.setSpecialty}
          listFilterDoctor={listFilters.doctor}
          setListFilterDoctor={listFilters.setDoctor}
          listFilterPatientName={listFilters.patientName}
          setListFilterPatientName={listFilters.setPatientName}
          listFilterStatus={listFilters.statusFilter}
          setListFilterStatus={listFilters.setStatusFilter}
          fhirAppointmentType={listFilters.fhirAppointmentType}
          setFhirAppointmentType={listFilters.setFhirAppointmentType}
          fhirPriority={listFilters.fhirPriority}
          setFhirPriority={listFilters.setFhirPriority}
          specialties={specialties}
          doctors={doctors}
          filteredAndSortedAppointments={filteredAndSortedAppointments}
          currentAppointments={currentAppointments}
          loadAppointments={loadAppointments}
          handleStatusChange={handleStatusChange}
          handleTimeSlotClick={handleTimeSlotClick}
          useBackendPagination={useBackendPagination}
          paginationInfo={paginationInfo}
          currentPage={currentPage}
          setCurrentPage={setCurrentPage}
          totalPages={totalPages}
          startIndex={startIndex}
          endIndex={endIndex}
          total={total}
        />
      )}

      {viewType === "patients" && (
        <PatientsSection
          patients={patientsData.patients}
          loadingPatients={patientsData.loadingPatients}
          patientSearchQuery={patientsData.patientSearchQuery}
          setPatientSearchQuery={patientsData.setPatientSearchQuery}
          showPatientProfile={patientsData.showPatientProfile}
          selectedPatientForProfile={patientsData.selectedPatientForProfile}
          loadPatients={patientsData.loadPatients}
          setShowPatientModal={patientModal.openCreateModal}
          handleBackFromProfile={patientsData.handleBackFromProfile}
          handleRowClick={patientsData.handleViewPatientProfile}
          setEditingPatient={patientModal.openEditModal}
          setPatientModalMode={patientModal.setPatientModalMode}
          patientsPagination={patientsData.patientsPagination}
          setPatientsPagination={patientsData.setPatientsPagination}
        />
      )}

      {/* Modal para nuevo/editar paciente */}
      <PatientModal
        isOpen={patientModal.showPatientModal}
        onClose={patientModal.closeModal}
        onPatientCreated={handlePatientCreated}
        onPatientUpdated={(updatedPatient) => {
          if (globalThis.__onPatientProfileUpdated) {
            globalThis.__onPatientProfileUpdated(updatedPatient);
            globalThis.__onPatientProfileUpdated = null;
            patientsData.setSelectedPatientForProfile(updatedPatient);
          }
          handlePatientUpdated(updatedPatient);
        }}
        onPatientDeactivated={() => {
          patientsData.loadPatients();
        }}
        title={patientModal.patientModalMode === 'edit' ? 'Editar Paciente' : 'Nuevo Paciente'}
        patient={patientModal.editingPatient}
        mode={patientModal.patientModalMode}
      />

      {/* Modal para turno rápido desde agenda */}
      <QuickAppointmentModal
        isOpen={quickAppointment.isQuickModalOpen}
        onClose={quickAppointment.closeQuickModal}
        modalSuccess={quickAppointment.modalSuccess}
        modalError={quickAppointment.modalError}
        quickModalDate={quickAppointment.quickModalDate}
        quickModalTime={quickAppointment.quickModalTime}
        quickModalContext={quickAppointment.quickModalContext}
        onSubmit={handleQuickAppointment}
        isCreatingAppointment={quickAppointment.isCreatingAppointment}
      />
    </div>
  );
}
