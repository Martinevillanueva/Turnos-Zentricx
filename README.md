#  Sistema de Gestión de Turnos Médicos - Challenge Zentricx

Sistema de gestión de turnos médicos bajo el estándar **FHIR HL7 R4**. Administra citas, pacientes y médicos con base de datos PostgreSQL.

**Stack:** Next.js 14 · NestJS · TypeScript · PostgreSQL · Docker · Tailwind CSS

##  Vista General del Proyecto - Capturas de Pantalla
![Foto 1](https://github.com/Martinevillanueva/Turnos-Zentricx/blob/main/frontend/public/images/screens/1.jpg)
![Foto 2](https://github.com/Martinevillanueva/Turnos-Zentricx/blob/main/frontend/public/images/screens/2.jpg)
![Foto 3](https://github.com/Martinevillanueva/Turnos-Zentricx/blob/main/frontend/public/images/screens/3.jpg)
![Foto 4](https://github.com/Martinevillanueva/Turnos-Zentricx/blob/main/frontend/public/images/screens/4.jpg)
![Foto 5](https://github.com/Martinevillanueva/Turnos-Zentricx/blob/main/frontend/public/images/screens/5.jpg)
![Foto 6](https://github.com/Martinevillanueva/Turnos-Zentricx/blob/main/frontend/public/images/screens/6.jpg)


##  Inicio Rápido

```bash
# Con Docker (recomendado)
docker-compose up --build

# Desarrollo local
npm run setup && npm run dev:all
```

**URLs:**
- Frontend: http://localhost:3000
- Backend API con Swaggerr: http://localhost:4000/api/docs

## 🔗 Endpoints de la API

### 📅 Turnos (Appointments)
- `GET /api/appointments` - Listar todos los turnos con filtros opcionales
- `GET /api/appointments/paginated` - Lista paginada con filtros avanzados
- `GET /api/appointments/:id` - Obtener turno específico por ID
- `POST /api/appointments` - Crear nuevo turno
- `PATCH /api/appointments/:id/status` - Actualizar estado del turno
- `DELETE /api/appointments/:id` - Cancelar turno (soft delete)
- `GET /api/appointments/stats` - Estadísticas generales de turnos
- `GET /api/appointments/doctors` - Listar médicos disponibles
- `GET /api/appointments/specialties` - Listar especialidades médicas
- `GET /api/appointments/statuses` - Listar estados FHIR disponibles
- `GET /api/appointments/status-map` - Mapa completo de estados y transiciones
- `GET /api/appointments/patients` - Listar pacientes con turnos
- `POST /api/appointments/patients` - Crear paciente desde turno

### 👥 Pacientes (Patients)
- `GET /api/patients` - Listar todos los pacientes con filtros
- `GET /api/patients/:id` - Obtener paciente por ID con historial
- `POST /api/patients` - Registrar nuevo paciente con validación CUIT
- `PUT /api/patients/:id` - Actualizar datos completos del paciente
- `DELETE /api/patients/:id` - Eliminar paciente (hard delete)
- `PATCH /api/patients/:id/deactivate` - Desactivar paciente (soft delete)

📖 **Documentación interactiva Swagger:** http://localhost:4000/api/docs



## 🧪 Testing

```bash
# Ejecutar test de conexión a la API
cd frontend
node test.js
```

El script `test.js` verifica:
- ✅ Conexión al backend
- ✅ Endpoints de turnos funcionando
- ✅ Endpoints de pacientes funcionando
- ✅ Respuestas correctas de la API

---


##  Estados FHIR

| Estado | Código | Transición |
|--------|--------|------------|
| Pendiente | \`pending\` | → booked/cancelled |
| Confirmado | \`booked\` | → arrived/cancelled |
| Recepcionado | \`arrived\` | → in-consultation/cancelled |
| En Consulta | \`in-consultation\` | → fulfilled/cancelled |
| Completado | \`fulfilled\` | [Final] |
| Cancelado | \`cancelled\` | [Final] |

## ️ Tecnologías

**Frontend:** Next.js 14, React 18, TypeScript, Tailwind CSS  
**Backend:** NestJS, TypeORM, PostgreSQL, Swagger  
**DevOps:** Docker, Docker Compose

## ⚙️ Configuración

**Frontend** (\`.env.local\`):
```env
NEXT_PUBLIC_API_URL=http://localhost:4000
```

**Backend** (\`.env\`):
```env
DATABASE_HOST=postgres
DATABASE_PORT=5432
DATABASE_USER=zentricx
DATABASE_PASSWORD=zentricx123
DATABASE_NAME=turnos_db
```

## ✨ Características Principales

### 🎯 Gestión de Turnos
- ✅ Calendario interactivo con vista diaria por médico
- ✅ Creación rápida de turnos con formulario simplificado
- ✅ Detalles expandibles al hacer clic en cada turno
- ✅ Timer en tiempo real para consultas en curso
- ✅ Cancelación de turnos con modal de confirmación
- ✅ Estados FHIR con validación de transiciones

### 👥 Gestión de Pacientes
- ✅ Registro completo con validaciones
- ✅ Búsqueda avanzada por nombre, apellido o documento
- ✅ Perfil de paciente con historial completo de turnos
- ✅ Edición de datos con validaciones en tiempo real
- ✅ Desactivación lógica (soft delete) de registros
- ✅ Autocompletar en formularios de turnos

### 🔍 Filtros y Búsqueda
- ✅ Filtro multi-selección por estados de turno
- ✅ Filtro por especialidad médica
- ✅ Filtro por médico (dependiente de especialidad)
- ✅ Selector de rango de fechas personalizado
- ✅ Búsqueda de pacientes con debounce optimizado
- ✅ Paginación de resultados

### 📊 Interfaz y UX
- ✅ Diseño responsive mobile-first con Tailwind CSS
- ✅ Indicadores de color por estado de turno
- ✅ Modales informativos para acciones críticas
- ✅ Notificaciones toast de éxito/error
- ✅ Header con fecha y hora en tiempo real
- ✅ Avatares de pacientes con iniciales
- ✅ Badges de estado con colores FHIR

### 🔒 Validaciones y Seguridad
- ✅ Validación FHIR completa en backend con DTOs
- ✅ Validación de formularios en frontend
- ✅ Algoritmo verificador de CUIT/CUIL
- ✅ Sanitización automática de inputs
- ✅ Manejo robusto de errores
- ✅ Prevención de conflictos de horarios

### 🗄️ Base de Datos
- ✅ PostgreSQL con TypeORM
- ✅ Migraciones automáticas
- ✅ Relaciones entre entidades (Patient ↔ Appointment)
- ✅ Índices en campos de búsqueda frecuente
- ✅ Timestamps automáticos (createdAt, updatedAt)

##  Estándar FHIR HL7

Implementa [FHIR R4](https://hl7.org/fhir/R4/):
- Recurso [Appointment](https://hl7.org/fhir/R4/appointment.html)
- Recurso [Patient](https://hl7.org/fhir/R4/patient.html)

**Códigos:** \`cardiology\`, \`dermatology\`, \`general-practice\`, \`neurology\`, \`pediatrics\`  
**Tipos:** \`ROUTINE\`, \`FOLLOWUP\`, \`EMERGENCY\`, \`CHECKUP\`

## 🐳 Docker

```bash
docker-compose up -d              # Iniciar
docker-compose logs -f            # Ver logs
docker-compose build --no-cache   # Rebuild
docker-compose down               # Detener
```

**Challenge Técnico Zentricx** · Noviembre 2025
