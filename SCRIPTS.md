# Scripts de inicio para el proyecto de Turnos FHIR

## Desarrollo Local

### Iniciar Backend
```bash
cd backend
npm install
npm run start:dev
```

### Iniciar Frontend (en otra terminal)
```bash
cd frontend  
npm install
cp .env.example .env.local  # Configurar variables de entorno
npm run dev
```

## Docker

### Iniciar todo el stack
```bash
docker-compose up --build
```

### Logs en tiempo real
```bash
docker-compose logs -f
```

### Parar servicios
```bash
docker-compose down
```

## URLs de acceso

- Frontend: http://localhost:3000
- Backend API: http://localhost:4000/api/appointments
- Documentación Swagger: http://localhost:4000/api/docs

## Comandos útiles

### Reinstalar dependencias
```bash
# Frontend
cd frontend && rm -rf node_modules package-lock.json && npm install

# Backend  
cd backend && rm -rf node_modules package-lock.json && npm install
```

### Linting y formato
```bash
# Frontend
cd frontend && npm run lint

# Backend
cd backend && npm run lint
```

### Tests
```bash
# Backend
cd backend && npm run test
cd backend && npm run test:e2e
```