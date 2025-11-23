# Dockerfile para Backend (Nest.js)
FROM node:18-alpine AS deps
RUN apk add --no-cache libc6-compat
WORKDIR /app

# Copiar archivos de dependencias
COPY package.json package-lock.json* ./
RUN npm ci --frozen-lockfile --only=production

# Imagen de construcción
FROM node:18-alpine AS builder
WORKDIR /app

# Copiar dependencias desde deps
COPY --from=deps /app/node_modules ./node_modules
COPY . .

# Instalar todas las dependencias (incluidas dev)
RUN npm ci --frozen-lockfile

# Construir aplicación
RUN npm run build

# Imagen de producción
FROM node:18-alpine AS runner
WORKDIR /app

ENV NODE_ENV production

# Crear usuario para ejecutar la aplicación
RUN addgroup --system --gid 1001 nodejs && \
    adduser --system --uid 1001 nestjs

# Copiar node_modules de producción
COPY --from=deps --chown=nestjs:nodejs /app/node_modules ./node_modules

# Copiar aplicación construida
COPY --from=builder --chown=nestjs:nodejs /app/dist ./dist
COPY --from=builder --chown=nestjs:nodejs /app/package.json ./package.json

USER nestjs

EXPOSE 4000

ENV PORT 4000

CMD ["node", "dist/main"]