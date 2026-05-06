# Dacan ERP

Sistema de gestión interno para Dacan Global Trading.
Arquitectura de dos servicios: frontend (UI) y backend (API + base de datos).

## Estructura del proyecto

```
dacan-erp/
├── frontend/        # Next.js 15 — UI (puerto 3000)
├── backend/         # Next.js 15 — API + Prisma (puerto 3001)
├── .env.example     # Variables de entorno de referencia
└── package.json     # Scripts raíz para correr ambos servicios
```

## Stack

| Servicio | Tecnología |
|---|---|
| Frontend | Next.js 15, Tailwind CSS, shadcn/ui, Clerk |
| Backend | Next.js 15 (API routes), Prisma, PostgreSQL |
| Auth | Clerk (JWT verificado en backend) |
| Correos | Resend (pendiente) |
| Archivos | Cloudflare R2 (pendiente) |

## Setup local

### 1. Instalar dependencias

```bash
npm run install:all
```

O por separado:
```bash
npm install --prefix frontend
npm install --prefix backend
```

### 2. Variables de entorno

Crear `.env.local` en cada servicio:
```bash
cp .env.example frontend/.env.local   # completar con variables de frontend
cp .env.example backend/.env.local    # completar con variables de backend
```

Ver `.env.example` para referencia de qué variables van en cada servicio.

### 3. Base de datos

```bash
npm run db:migrate     # crea tablas en PostgreSQL
npm run db:seed        # carga datos de prueba
```

### 4. Correr en desarrollo

```bash
npm run dev            # inicia frontend (3000) y backend (3001) juntos
```

O por separado:
```bash
npm run dev:frontend   # solo frontend en localhost:3000
npm run dev:backend    # solo backend en localhost:3001
```

## Módulos — Fase 1 (MVP)

- [ ] Autenticación y roles (Clerk)
- [ ] Catálogo de Productos
- [ ] Inventario
- [ ] Proveedores
- [ ] Containers
- [ ] Dashboard de KPIs
