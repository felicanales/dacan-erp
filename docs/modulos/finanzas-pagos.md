# Módulo de Finanzas y Pagos — Especificación Técnica

> Fuente: Notion workspace Dacan Global Trading  
> Estado en Notion: Fase conceptual — Módulo finanzas marcado como *futuro* en el ERP doc  
> Fase de construcción objetivo: Fase 3 (Nov–Dic 2026)

---

## 1. Arquitectura del módulo

### 1.1 Submódulos

| Submódulo | Descripción | Prioridad |
|---|---|---|
| Pagos | Registro de todos los pagos realizados | Alta |
| Suscripciones | Servicios con cobro recurrente | Alta |
| Flujo de Caja | Proyección mensual de ingresos/egresos | Media |
| Costos de Importación | Calculadora CIF + aranceles + IVA | Media |
| Presupuesto Inicial | Distribución del capital por concepto | Media |
| Contabilidad y Tributación | Obligaciones SII, calendario tributario | Baja |

### 1.2 Relaciones entre entidades

```
Suscripcion (1) ──────< (N) Pago
Container    (1) ──────< (N) CostoImportacion
FlujoCaja    (1) ──────< (12) FlujoCajaMes
```

---

## 2. Modelo de datos (Prisma)

```prisma
model Pago {
  id             String        @id @default(cuid())
  nombre         String
  tipoPago       TipoPago
  monto          String?       // texto libre: "US$ 25 / mes"
  montoPagadoNum Decimal?      @db.Decimal(12, 0)  // en CLP
  fechaPago      DateTime?
  estadoPago     EstadoPago    @default(PENDIENTE)
  categorias     CategoriaFinanzas[]
  factura        String?       // URL del archivo en R2/S3
  tarjeta        String?
  duenioTarjeta  DuenioTarjeta?
  suscripcionId  String?
  suscripcion    Suscripcion?  @relation(fields: [suscripcionId], references: [id])
  creadoEn       DateTime      @default(now())
  actualizadoEn  DateTime      @updatedAt
}

model Suscripcion {
  id               String            @id @default(cuid())
  nombre           String
  categoria        CategoriaFinanzas?
  estado           EstadoSuscripcion @default(ACTIVA)
  fechaAdquisicion DateTime?
  fechaRenovacion  DateTime?
  pagos            Pago[]
  creadoEn         DateTime          @default(now())
  actualizadoEn    DateTime          @updatedAt
}

model FlujoCaja {
  id       String         @id @default(cuid())
  anio     Int
  meses    FlujoCajaMes[]
}

model FlujoCajaMes {
  id          String    @id @default(cuid())
  flujoCajaId String
  flujoCaja   FlujoCaja @relation(fields: [flujoCajaId], references: [id])
  mes         Int       // 1–12
  ingresos    Decimal?  @db.Decimal(14, 0)
  egresos     Decimal?  @db.Decimal(14, 0)
  // saldo = ingresos - egresos (calculado en runtime)
}

model CostoImportacion {
  id              String   @id @default(cuid())
  containerId     String?
  fob             Decimal  @db.Decimal(14, 0)
  flete           Decimal  @db.Decimal(14, 0)
  seguro          Decimal  @db.Decimal(14, 0)
  arancel         Decimal  @db.Decimal(5, 4) @default(0.06)
  iva             Decimal  @db.Decimal(5, 4) @default(0.19)
  costosLocales   Decimal  @db.Decimal(14, 0) @default(0)
  cantidadUnidades Int?
  // calculados en runtime:
  // cif = fob + flete + seguro
  // totalImpuestos = cif * (1 + arancel) * (1 + iva) - cif
  // totalImportado = cif * (1 + arancel) * (1 + iva) + costosLocales
  // costoUnitario = totalImportado / cantidadUnidades
  notas           String?
  creadoEn        DateTime @default(now())
}

model PresupuestoInicial {
  id       String               @id @default(cuid())
  anio     Int
  items    PresupuestoItem[]
  total    Decimal?             @db.Decimal(14, 0)
}

model PresupuestoItem {
  id              String             @id @default(cuid())
  presupuestoId   String
  presupuesto     PresupuestoInicial @relation(fields: [presupuestoId], references: [id])
  concepto        String
  porcentaje      Decimal            @db.Decimal(5, 2)
  montoEstimado   Decimal?           @db.Decimal(14, 0)
}

// ─── Enums ────────────────────────────────────────────────

enum TipoPago {
  SUSCRIPCION       // 🔁 Suscripción
  GASTO_UNICO       // 🧾 Gasto único
  SERVICIO_PUNTUAL  // 🛠️ Servicio puntual
  REEMBOLSO_AJUSTE  // ↩️ Reembolso / ajuste
}

enum EstadoPago {
  PAGADO      // ✅ Pagado
  PENDIENTE   // 🕒 Pendiente
  FALLIDO     // ❌ Fallido
  REEMBOLSADO // ↩️ Reembolsado
}

enum EstadoSuscripcion {
  ACTIVA    // ✅ Activa
  PAUSADA   // ⏸️ Pausada
  CANCELADA // ❌ Cancelada
}

enum CategoriaFinanzas {
  TECNOLOGIA     // 🛠️ Tecnología
  MARKETING      // 📣 Marketing
  LOGISTICA      // 📦 Logística
  ADMINISTRACION // 💼 Administración
  DISENIO        // 🎨 Diseño
  FINANZAS       // 📊 Finanzas
}

enum DuenioTarjeta {
  GALIE
  ALEJANDRO
  FELIPE
  JUAN_JOSE
  LORENZO
}
```

---

## 3. Lógica de negocio

### 3.1 Calculadora de costos de importación

```typescript
// lib/finanzas/calculadora-importacion.ts

export interface InputCostoImportacion {
  fob: number
  flete: number
  seguro: number
  arancel?: number       // default 0.06 (6%)
  iva?: number           // default 0.19 (19%)
  costosLocales?: number // default 0
  cantidadUnidades?: number
}

export interface ResultadoCostoImportacion {
  cif: number
  montoArancel: number
  baseIva: number
  montoIva: number
  totalImpuestos: number
  totalImportado: number
  costoUnitario?: number
  factorMultiplicador: number
}

export function calcularCostoImportacion(input: InputCostoImportacion): ResultadoCostoImportacion {
  const { fob, flete, seguro, costosLocales = 0, cantidadUnidades } = input
  const arancel = input.arancel ?? 0.06
  const iva = input.iva ?? 0.19

  const cif = fob + flete + seguro
  const montoArancel = cif * arancel
  const baseIva = cif + montoArancel
  const montoIva = baseIva * iva
  const totalImpuestos = montoArancel + montoIva
  const totalImportado = cif + totalImpuestos + costosLocales
  const costoUnitario = cantidadUnidades ? totalImportado / cantidadUnidades : undefined
  const factorMultiplicador = totalImportado / fob

  return {
    cif,
    montoArancel,
    baseIva,
    montoIva,
    totalImpuestos,
    totalImportado,
    costoUnitario,
    factorMultiplicador,
  }
}
```

### 3.2 Cálculo de saldo en flujo de caja

```typescript
// Saldo acumulado mes a mes (calculado en runtime, no se persiste)
export function calcularSaldoAcumulado(meses: { ingresos: number; egresos: number }[]) {
  let acumulado = 0
  return meses.map((m) => {
    acumulado += (m.ingresos ?? 0) - (m.egresos ?? 0)
    return { ...m, saldo: acumulado }
  })
}
```

### 3.3 Resumen financiero del módulo

```typescript
export interface ResumenFinanciero {
  totalPagadoMes: number      // sum(montoPagadoNum) donde fechaPago en mes actual
  totalSuscripciones: number  // count suscripciones activas
  costoSuscripcionesMes: number // sum de pagos tipo SUSCRIPCION del mes
  pagosPendientes: number     // count pagos con estado PENDIENTE
}
```

---

## 4. API Routes (Next.js App Router)

```
app/api/finanzas/
├── pagos/
│   ├── route.ts              GET (lista) · POST (crear)
│   └── [id]/
│       └── route.ts          GET · PUT · DELETE
├── suscripciones/
│   ├── route.ts              GET · POST
│   └── [id]/
│       └── route.ts          GET · PUT · DELETE
├── flujo-caja/
│   ├── route.ts              GET (por año) · POST (crear/actualizar mes)
│   └── [anio]/
│       └── route.ts          GET año específico
├── costos-importacion/
│   ├── route.ts              GET · POST
│   ├── [id]/
│   │   └── route.ts          GET · PUT · DELETE
│   └── calcular/
│       └── route.ts          POST (sin persistir — solo retorna cálculo)
└── resumen/
    └── route.ts              GET (dashboard KPIs finanzas)
```

### Endpoints clave

#### `POST /api/finanzas/costos-importacion/calcular`
Calcula sin persistir. Recibe `InputCostoImportacion`, devuelve `ResultadoCostoImportacion`.

#### `GET /api/finanzas/resumen`
Devuelve `ResumenFinanciero` para el dashboard.

#### `GET /api/finanzas/pagos?tipo=SUSCRIPCION&mes=2026-05&estado=PENDIENTE`
Filtros: `tipo`, `mes` (YYYY-MM), `estado`, `categoria`, `duenioTarjeta`.

---

## 5. Estructura de páginas frontend

```
app/(erp)/finanzas/
├── page.tsx                  Dashboard financiero (resumen + accesos rápidos)
├── pagos/
│   ├── page.tsx              Tabla de pagos con filtros
│   └── nuevo/
│       └── page.tsx          Formulario nuevo pago
├── suscripciones/
│   ├── page.tsx              Tabla de suscripciones + relación con pagos
│   └── nueva/
│       └── page.tsx          Formulario nueva suscripción
├── flujo-caja/
│   └── page.tsx              Tabla proyección mensual editable
├── costos-importacion/
│   ├── page.tsx              Historial de cálculos + nueva calculadora
│   └── calcular/
│       └── page.tsx          Calculadora interactiva (sin persistir)
└── presupuesto/
    └── page.tsx              Distribución del capital
```

---

## 6. Componentes UI

```
components/finanzas/
├── TablaPageos.tsx            Tabla con columnas: Nombre · Tipo · Monto · Fecha · Estado · Categoría · Tarjeta · Dueño · Factura
├── FiltroPagos.tsx            Barra de filtros (tipo, estado, categoría, mes)
├── FormularioPago.tsx         Crear/editar pago
├── TablaSuscripciones.tsx     Tabla suscripciones + badge estado
├── FormularioSuscripcion.tsx  Crear/editar suscripción
├── TablaFlujoCaja.tsx         12 filas editables inline (ingresos/egresos/saldo)
├── CalculadoraImportacion.tsx Formulario + resultado en tiempo real (useEffect en cada campo)
├── ResumenFinanzasCard.tsx    4 KPI cards para el dashboard
└── BadgeEstadoPago.tsx        Chip de color por estado (✅ verde, 🕒 amarillo, etc.)
```

### Vistas de la tabla de Pagos (fiel a Notion)

| Vista | Filtro | Orden |
|---|---|---|
| Pagos (todos) | ninguno | Fecha de pago DESC |
| 🔁 Suscripciones | tipo = SUSCRIPCION | Fecha de pago DESC |
| 🧾 Otros pagos | tipo ≠ SUSCRIPCION | Fecha de pago DESC |
| Calendario | — | Por fecha en grid mensual |

---

## 7. Columnas de la tabla Pagos

| Campo | Tipo en DB | Tipo UI | Notas |
|---|---|---|---|
| Nombre de pago | `String` | Input texto | Identificador (mes/año o referencia) |
| Tipo de pago | `TipoPago` (enum) | Select | 🔁 🧾 🛠️ ↩️ |
| Monto | `String` | Input texto | Texto libre: "US$ 25 / mes" |
| Monto pagado (num) | `Decimal` | Input número | En CLP, formato peso chileno |
| Fecha de pago | `DateTime` | Date picker | — |
| Estado del pago | `EstadoPago` (enum) | Select con color | ✅🕒❌↩️ |
| Categorías | `CategoriaFinanzas[]` | Multi-select | Varios valores permitidos |
| Factura | `String` (URL) | File upload | Sube a R2/S3, guarda URL |
| Tarjeta | `String` | Input texto | Nombre de la tarjeta usada |
| Dueño de tarjeta | `DuenioTarjeta` (enum) | Select | Galie · Alejandro · Felipe · Juan José · Lorenzo |

---

## 8. Columnas de la tabla Suscripciones

| Campo | Tipo en DB | Tipo UI | Notas |
|---|---|---|---|
| Nombre | `String` | Input texto | Nombre del servicio |
| Categoría | `CategoriaFinanzas` | Select | Un solo valor |
| Estado | `EstadoSuscripcion` | Select con color | ✅ ⏸️ ❌ |
| Fecha de adquisición | `DateTime` | Date picker | — |
| Fecha de renovación | `DateTime` | Date picker | Próxima fecha de cobro |
| Pagos | Relación a `Pago[]` | Lista de chips | Links a registros de Pagos |

---

## 9. Dashboard de finanzas — KPI cards

```tsx
// Orden visual en la página /finanzas
<ResumenFinanzasCard label="Pagado este mes"       valor={totalPagadoMes}       formato="clp" />
<ResumenFinanzasCard label="Suscripciones activas" valor={totalSuscripciones}    formato="número" />
<ResumenFinanzasCard label="Costo suscripciones"   valor={costoSuscripcionesMes} formato="clp" />
<ResumenFinanzasCard label="Pagos pendientes"       valor={pagosPendientes}       formato="número" color="amarillo" />
```

---

## 10. Lógica tributaria (Contabilidad)

| Obligación | Frecuencia | Responsable | Campo en sistema |
|---|---|---|---|
| Declaración IVA (F29) | Mensual | Contador | — (recordatorio externo) |
| Retención boletas honorarios | Mensual | Administración | — |
| Declaración renta (F22) | Anual (Abril) | Contador | — |
| Impuesto comercio exterior | Por importación | Agente aduana | Ligado a `CostoImportacion` |

> Esta sección es referencial. El sistema no declara al SII; solo registra el seguimiento.

---

## 11. Fórmula de costos de importación (referencia)

```
CIF = FOB + Flete + Seguro

Arancel (6%) = CIF × 0.06
Base IVA     = CIF + Arancel
IVA (19%)    = Base IVA × 0.19

Total Importado = CIF + Arancel + IVA + Costos Locales
Costo Unitario  = Total Importado / Cantidad de unidades

Factor rápido (sin TLC): Total ≈ CIF × 1.26 + Costos Locales
Regla de negocio: Costo proveedor × 1.35–1.60 = costo puesto en Chile
```

**Variables críticas que cambian el resultado:**
- Volumen del contenedor (FCL vs LCL)
- TLC vigente (ahorra el 6% de arancel)
- Incoterm (EXW / FOB / CIF)
- Tipo de producto (código arancelario)

---

## 12. Distribución del presupuesto inicial

| Concepto | % asignado |
|---|---|
| Compra de productos (FOB) | 50% |
| Flete y seguro internacional | 15% |
| Gastos de aduana e internación | 10% |
| Bodega y logística local | 5% |
| Marketing y lanzamiento | 10% |
| Capital de trabajo / reserva | 10% |

---

## 13. Automatizaciones de correo (Resend)

| Trigger | Destinatario | Contenido |
|---|---|---|
| Suscripción próxima a renovar (7 días) | Felipe | Alerta con nombre, monto y fecha |
| Pago marcado como ❌ Fallido | Felipe + dueño de tarjeta | Detalle del pago fallido |
| Pago marcado como ✅ Pagado | — | (sin correo, solo registro) |

---

*Documento generado: 2026-05-16 — Fuente: Notion workspace Dacan Global Trading*
