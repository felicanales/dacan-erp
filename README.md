# Dacan ERP

Sistema de gestión interno para Dacan Global Trading.

## Stack

- **Framework:** Next.js 15 (App Router)
- **UI:** Tailwind CSS + shadcn/ui
- **Auth:** Clerk
- **ORM:** Prisma
- **DB:** PostgreSQL (Railway)
- **Correos:** Resend (pendiente de configurar)
- **Archivos:** Cloudflare R2 (pendiente de configurar)

## Setup local

1. Clonar el repositorio
2. Instalar dependencias:
   ```bash
   npm install
   ```
3. Copiar variables de entorno:
   ```bash
   cp .env.example .env.local
   ```
4. Completar las variables en `.env.local` (ver `.env.example`)
5. Crear la base de datos y correr migraciones:
   ```bash
   npm run db:migrate
   ```
6. (Opcional) Cargar datos de prueba:
   ```bash
   npm run db:seed
   ```
7. Iniciar el servidor de desarrollo:
   ```bash
   npm run dev
   ```

## Comandos útiles

| Comando | Descripción |
|---|---|
| `npm run dev` | Servidor de desarrollo |
| `npm run db:migrate` | Crear y aplicar migraciones |
| `npm run db:push` | Sincronizar schema sin migración (solo dev) |
| `npm run db:studio` | Abrir Prisma Studio |
| `npm run db:seed` | Cargar datos de prueba |

## Módulos (Fase 1 — MVP)

- [ ] Autenticación y roles (Clerk)
- [ ] Catálogo de Productos
- [ ] Inventario
- [ ] Proveedores
- [ ] Containers
- [ ] Dashboard de KPIs
