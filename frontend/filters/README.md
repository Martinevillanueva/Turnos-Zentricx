# Filters Module

Esta carpeta contiene toda la lógica relacionada con filtros de turnos en la aplicación.

## Estructura

```
filters/
├── index.ts                          # Punto de entrada principal, exporta todo
├── components/                       # Componentes visuales de filtros
│   ├── AppointmentFilters.tsx       # Filtros genéricos de turnos
│   ├── CalendarFilters.tsx          # Filtros específicos del calendario
│   └── SelectFilter.tsx             # Componente select reutilizable
├── hooks/                           # Hooks personalizados para gestión de filtros
│   └── useAppointmentFilters.ts    # Hooks useListFilters y useCalendarFilters
└── utils/                           # Utilidades de filtrado
    └── appointmentFilterUtils.ts   # Funciones puras de filtrado
```

## Uso

### Importar desde el módulo principal

```typescript
import { 
  // Hooks
  useListFilters,
  useCalendarFilters,
  
  // Componentes
  SelectFilter,
  CalendarFilters,
  AppointmentFilters,
  
  // Utilidades
  filterBySpecialty,
  filterByDoctor,
  filterByPatientName,
  filterByDate,
  filterCancelled,
  filterCancelledDuplicates,
  sortAppointmentsByDate,
  extractSpecialtyId,
  extractDoctorId,
  extractPatientName,
  isSameDay,
  isAppointmentCancelled
} from '@/filters';
```

## Hooks

### `useListFilters`
Hook para gestionar filtros de la vista de lista de turnos.

**Parámetros:**
- `doctors`: Array de doctores para validar relaciones specialty-doctor
- `onFilterChange`: Callback que se ejecuta cuando cambian los filtros

**Retorna:**
- `specialty`, `setSpecialty`: Estado de filtro por especialidad
- `doctor`, `setDoctor`: Estado de filtro por doctor
- `patientName`, `setPatientName`: Estado de filtro por nombre de paciente
- `showCancelled`, `setShowCancelled`: Estado para mostrar/ocultar cancelados
- `clearFilters()`: Función para limpiar todos los filtros
- `hasFilters`: Boolean indicando si hay filtros activos

### `useCalendarFilters`
Hook para gestionar filtros de la vista de calendario/agenda.

**Parámetros:**
- `doctors`: Array de doctores para validar relaciones specialty-doctor
- `onFilterChange`: Callback opcional (no usado actualmente)

**Retorna:**
- `specialty`, `setSpecialty`: Estado de filtro por especialidad
- `doctor`, `setDoctor`: Estado de filtro por doctor
- `selectedDate`, `setSelectedDate`: Fecha seleccionada en el calendario

## Utilidades de Filtrado

### Funciones de Extracción
- `extractSpecialtyId(appointment)`: Extrae el ID de especialidad de un turno
- `extractDoctorId(appointment)`: Extrae el ID de doctor de un turno
- `extractPatientName(appointment)`: Extrae el nombre del paciente de un turno

### Funciones de Filtrado
- `filterBySpecialty(appointments, specialtyId)`: Filtra turnos por especialidad
- `filterByDoctor(appointments, doctorId)`: Filtra turnos por doctor
- `filterByPatientName(appointments, patientName)`: Filtra turnos por nombre de paciente
- `filterByDate(appointments, targetDate)`: Filtra turnos por fecha
- `filterCancelled(appointments, includeCancelled)`: Filtra turnos cancelados
- `filterCancelledDuplicates(appointments)`: Elimina turnos cancelados duplicados en el mismo horario

### Funciones de Utilidad
- `isSameDay(date1, date2)`: Compara dos fechas ignorando la hora
- `isAppointmentCancelled(appointment)`: Verifica si un turno está cancelado
- `sortAppointmentsByDate(appointments)`: Ordena turnos por fecha de inicio

## Componentes

### `SelectFilter`
Componente select reutilizable para filtros.

**Props:**
- `id`: ID del elemento
- `label`: Etiqueta del filtro
- `value`: Valor actual
- `options`: Array de opciones `[{ id, label }]`
- `onChange`: Callback cuando cambia el valor
- `disabled`: Deshabilitar el select
- `className`: Clases CSS adicionales

### `CalendarFilters`
Filtros específicos para la vista de calendario con especialidad, doctor y fecha.

### `AppointmentFilters`
Filtros genéricos para turnos con múltiples opciones de filtrado.

## Notas

- Todas las funciones de utilidad son **puras** (sin efectos secundarios)
- Los hooks manejan la **auto-limpieza** de filtros relacionados (ej: limpiar doctor cuando cambia especialidad)
- La lógica de filtrado está **centralizada** para evitar duplicación
- Los componentes son **reutilizables** en diferentes vistas
