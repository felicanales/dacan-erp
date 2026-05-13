# Módulo: Reuniones

> Fase 3 — Equipo  
> Equivalente al módulo "Reuniones" del workspace de Notion de Dacan Global Trading

---

## Propósito

Registrar y hacer seguimiento de las reuniones del equipo: agenda previa, acta posterior y
acuerdos/compromisos resultantes. Reemplaza el módulo de Notion con automatizaciones de correo
que Notion no ofrece sin costo.

---

## Modelo de datos

### Tablas involucradas (ya en schema Prisma)

```prisma
model Reunion {
  id            String   @id @default(cuid())
  titulo        String
  fecha         DateTime
  agenda        String?   // Texto libre o markdown
  acta          String?   // Registrada post-reunión
  acuerdos      String?   // Compromisos concretos post-reunión
  createdAt     DateTime  @default(now())
  updatedAt     DateTime  @updatedAt

  participantes ReunionParticipante[]
}

model ReunionParticipante {
  id        String  @id @default(cuid())
  reunionId String
  reunion   Reunion @relation(fields: [reunionId], references: [id])
  usuarioId String
  usuario   Usuario @relation(fields: [usuarioId], references: [id])

  @@unique([reunionId, usuarioId])
}
```

### Campos adicionales a evaluar

| Campo | Tipo | Justificación |
|---|---|---|
| `duracionMinutos` | `Int?` | Útil para planificación |
| `tipo` | `enum` | `interna \| con_proveedor \| con_cliente` |
| `actaEnviada` | `Boolean` | Flag para saber si ya se disparó el correo de resumen |
| `linkVideoCall` | `String?` | URL de Google Meet / Zoom |

---

## Páginas y rutas

| Ruta | Descripción |
|---|---|
| `/reuniones` | Lista de todas las reuniones |
| `/reuniones/nueva` | Formulario para agendar una reunión |
| `/reuniones/[id]` | Detalle de reunión: agenda + acta + acuerdos |

---

## Pantalla: Lista `/reuniones`

**Header:**
- Título "Reuniones"
- Botón "+ Nueva reunión"

**Stats (si hay reuniones):**
- Total de reuniones
- Próximas (fecha futura)
- Con acta pendiente (fecha pasada + sin `acta`)

**Tabla / Cards:**

| Columna | Contenido |
|---|---|
| Título | Link al detalle |
| Fecha | Formato dd/MM/yyyy HH:mm — en timezone del usuario |
| Participantes | Avatares o nombres abreviados |
| Estado | Badge: `Próxima` / `Realizada` / `Acta pendiente` |
| Acciones | Editar, Eliminar |

**Lógica de estado:**
- `Próxima` → `fecha > now()`
- `Acta pendiente` → `fecha < now()` y `acta == null`
- `Realizada` → `fecha < now()` y `acta != null`

**Filtros:**
- Por estado (Próximas / Realizadas / Acta pendiente)

---

## Pantalla: Nueva reunión `/reuniones/nueva`

**Sección: Datos básicos**
- Título `*`
- Fecha y hora `*` — date + time picker
- Link videollamada (opcional)

**Sección: Participantes**
- Multi-select de usuarios del sistema (Felipe, Galie, Alejandro, Juan José, Lorenzo)
- Mostrar nombre + avatar inicial

**Sección: Agenda**
- Textarea libre — qué se va a tratar
- Placeholder: "1. Revisión estado containers\n2. Avance ventas B2B\n3. Próximos pasos"

**Botón:** "Agendar reunión" → crea registro + dispara correo de agenda

---

## Pantalla: Detalle `/reuniones/[id]`

**Header:**
- Breadcrumb → Reuniones
- Título + badge de estado
- Fecha, hora y participantes

**Sección: Agenda**
- Texto de agenda (editable inline o mediante botón)

**Sección: Acta post-reunión** *(visible solo si `fecha < now()`)*
- Textarea: resumen de lo discutido
- Textarea: acuerdos y compromisos concretos
- Botón "Guardar acta y enviar resumen" → guarda + dispara correo de acta
- Si ya fue enviada: badge "Acta enviada" + fecha de envío

**Sección: Editar reunión**
- Formulario con los mismos campos de creación (prefilled)

---

## API endpoints (backend)

| Método | Ruta | Descripción |
|---|---|---|
| `GET` | `/api/reuniones` | Lista todas las reuniones con participantes |
| `POST` | `/api/reuniones` | Crea reunión + dispara correo de agenda |
| `GET` | `/api/reuniones/:id` | Detalle con participantes y historial |
| `PUT` | `/api/reuniones/:id` | Edita campos (titulo, fecha, agenda, acta, acuerdos) |
| `DELETE` | `/api/reuniones/:id` | Elimina reunión |
| `POST` | `/api/reuniones/:id/enviar-acta` | Dispara correo de resumen post-reunión |

### Validaciones
- `titulo`: requerido, mínimo 3 caracteres
- `fecha`: requerida, debe ser válida (no bloquear fechas pasadas para poder registrar reuniones retroactivas)
- `participantes`: array de `usuarioId`, mínimo 1

---

## Automatizaciones de correo

### 1. Correo de agenda — al agendar

**Trigger:** `POST /api/reuniones` exitoso  
**Destinatarios:** todos los participantes de la reunión  
**Asunto:** `📅 Reunión agendada: {titulo} — {fecha}`  
**Contenido:**
- Título y fecha/hora (en timezone del destinatario)
- Lista de participantes
- Agenda si fue completada
- Link a videollamada si existe

**Nota:** Juan José está en UTC+2 (Suiza) — la hora debe mostrarse en su timezone en el correo.

---

### 2. Correo de acta — post-reunión (disparo manual)

**Trigger:** `POST /api/reuniones/:id/enviar-acta`  
**Destinatarios:** todo el equipo (todos los usuarios activos)  
**Asunto:** `📝 Acta reunión: {titulo} — {fecha}`  
**Contenido:**
- Título y fecha
- Participantes presentes
- Resumen del acta
- Acuerdos y compromisos
- Link a la reunión en el ERP

**Control:** flag `actaEnviada` en la BD para evitar reenvíos accidentales. Mostrar advertencia en UI si se intenta enviar de nuevo.

---

## Consideraciones específicas de Dacan

- **Juan José opera desde Suiza (UTC+2):** Las fechas en correos y UI deben mostrarse en el timezone de cada usuario (ya modelado en `Usuario.timezone`). Usar `Intl.DateTimeFormat` en frontend y considerar el timezone al enviar correos.
- **Equipo pequeño (5 personas):** El multi-select de participantes puede ser simplemente un checklist de los 5 miembros sin búsqueda.
- **Reuniones retroactivas:** Permitir registrar reuniones con fecha pasada para mantener historial desde que se adopte el ERP.
- **Acuerdos como tareas:** A futuro, los acuerdos del acta pueden generar automáticamente `Tarea` en el módulo de Tareas (no requerido en v1).

---

## Orden de construcción sugerido

1. Schema Prisma — ya está definido; solo agregar campos opcionales si se decide incluirlos
2. Migración: `prisma migrate dev --name add-reunion-fields` (si se agregan campos)
3. API endpoints GET + POST + PUT + DELETE
4. Página lista `/reuniones`
5. Página nueva `/reuniones/nueva`
6. Página detalle `/reuniones/[id]`
7. Correo de agenda (Resend + React Email)
8. Correo de acta (Resend + React Email)

---

## Dependencias

- `Usuario` — debe existir el modelo y haber usuarios en la BD para asignar como participantes
- `Resend` — para los correos automáticos
- El módulo de Tareas puede construirse en paralelo o después

---

## Archivos a crear

```
backend/
  app/api/reuniones/
    route.ts                  # GET lista, POST crear
    [id]/
      route.ts                # GET detalle, PUT editar, DELETE
      enviar-acta/
        route.ts              # POST disparar correo de acta

frontend/
  app/(dashboard)/reuniones/
    page.tsx                  # Lista
    nueva/
      page.tsx                # Formulario nueva reunión
    [id]/
      page.tsx                # Detalle + acta

  components/reuniones/
    ReunionForm.tsx           # Formulario compartido (crear + editar)
    ActaForm.tsx              # Formulario del acta post-reunión
    ParticipantesSelect.tsx   # Multi-select de usuarios

backend/
  emails/
    AgendaReunion.tsx         # Template React Email — correo de agenda
    ActaReunion.tsx           # Template React Email — correo de acta
```
