-- CreateEnum
CREATE TYPE "TipoPago" AS ENUM ('suscripcion', 'gasto_unico', 'servicio_puntual', 'reembolso_ajuste');

-- CreateEnum
CREATE TYPE "EstadoPago" AS ENUM ('pagado', 'pendiente', 'fallido', 'reembolsado');

-- CreateEnum
CREATE TYPE "EstadoSuscripcion" AS ENUM ('activa', 'pausada', 'cancelada');

-- CreateEnum
CREATE TYPE "CategoriaFinanzas" AS ENUM ('tecnologia', 'marketing', 'logistica', 'administracion', 'disenio', 'finanzas');

-- CreateEnum
CREATE TYPE "DuenioTarjeta" AS ENUM ('galie', 'alejandro', 'felipe', 'juan_jose', 'lorenzo');

-- CreateTable
CREATE TABLE "Suscripcion" (
    "id" TEXT NOT NULL,
    "nombre" TEXT NOT NULL,
    "categoria" "CategoriaFinanzas",
    "estado" "EstadoSuscripcion" NOT NULL DEFAULT 'activa',
    "fechaAdquisicion" TIMESTAMP(3),
    "fechaRenovacion" TIMESTAMP(3),
    "creadoEn" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "actualizadoEn" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "Suscripcion_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "Pago" (
    "id" TEXT NOT NULL,
    "nombre" TEXT NOT NULL,
    "tipoPago" "TipoPago" NOT NULL,
    "monto" TEXT,
    "montoPagadoNum" DECIMAL(12,0),
    "fechaPago" TIMESTAMP(3),
    "estadoPago" "EstadoPago" NOT NULL DEFAULT 'pendiente',
    "categorias" "CategoriaFinanzas"[],
    "factura" TEXT,
    "tarjeta" TEXT,
    "duenioTarjeta" "DuenioTarjeta",
    "suscripcionId" TEXT,
    "creadoEn" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "actualizadoEn" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "Pago_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "FlujoCaja" (
    "id" TEXT NOT NULL,
    "anio" INTEGER NOT NULL,

    CONSTRAINT "FlujoCaja_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "FlujoCajaMes" (
    "id" TEXT NOT NULL,
    "flujoCajaId" TEXT NOT NULL,
    "mes" INTEGER NOT NULL,
    "ingresos" DECIMAL(14,0),
    "egresos" DECIMAL(14,0),

    CONSTRAINT "FlujoCajaMes_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "CostoImportacion" (
    "id" TEXT NOT NULL,
    "containerId" TEXT,
    "fob" DECIMAL(14,0) NOT NULL,
    "flete" DECIMAL(14,0) NOT NULL,
    "seguro" DECIMAL(14,0) NOT NULL,
    "arancel" DECIMAL(5,4) NOT NULL DEFAULT 0.06,
    "iva" DECIMAL(5,4) NOT NULL DEFAULT 0.19,
    "costosLocales" DECIMAL(14,0) NOT NULL DEFAULT 0,
    "cantidadUnidades" INTEGER,
    "notas" TEXT,
    "creadoEn" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,

    CONSTRAINT "CostoImportacion_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "PresupuestoInicial" (
    "id" TEXT NOT NULL,
    "anio" INTEGER NOT NULL,
    "total" DECIMAL(14,0),

    CONSTRAINT "PresupuestoInicial_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "PresupuestoItem" (
    "id" TEXT NOT NULL,
    "presupuestoId" TEXT NOT NULL,
    "concepto" TEXT NOT NULL,
    "porcentaje" DECIMAL(5,2) NOT NULL,
    "montoEstimado" DECIMAL(14,0),

    CONSTRAINT "PresupuestoItem_pkey" PRIMARY KEY ("id")
);

-- CreateIndex
CREATE INDEX "Pago_fechaPago_idx" ON "Pago"("fechaPago");

-- CreateIndex
CREATE INDEX "Pago_tipoPago_idx" ON "Pago"("tipoPago");

-- CreateIndex
CREATE INDEX "Pago_estadoPago_idx" ON "Pago"("estadoPago");

-- CreateIndex
CREATE INDEX "Pago_suscripcionId_idx" ON "Pago"("suscripcionId");

-- CreateIndex
CREATE INDEX "Suscripcion_estado_idx" ON "Suscripcion"("estado");

-- CreateIndex
CREATE INDEX "Suscripcion_fechaRenovacion_idx" ON "Suscripcion"("fechaRenovacion");

-- CreateIndex
CREATE UNIQUE INDEX "FlujoCaja_anio_key" ON "FlujoCaja"("anio");

-- CreateIndex
CREATE UNIQUE INDEX "FlujoCajaMes_flujoCajaId_mes_key" ON "FlujoCajaMes"("flujoCajaId", "mes");

-- CreateIndex
CREATE INDEX "CostoImportacion_containerId_idx" ON "CostoImportacion"("containerId");

-- CreateIndex
CREATE INDEX "CostoImportacion_creadoEn_idx" ON "CostoImportacion"("creadoEn");

-- CreateIndex
CREATE UNIQUE INDEX "PresupuestoInicial_anio_key" ON "PresupuestoInicial"("anio");

-- AddForeignKey
ALTER TABLE "Pago" ADD CONSTRAINT "Pago_suscripcionId_fkey" FOREIGN KEY ("suscripcionId") REFERENCES "Suscripcion"("id") ON DELETE SET NULL ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "FlujoCajaMes" ADD CONSTRAINT "FlujoCajaMes_flujoCajaId_fkey" FOREIGN KEY ("flujoCajaId") REFERENCES "FlujoCaja"("id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "CostoImportacion" ADD CONSTRAINT "CostoImportacion_containerId_fkey" FOREIGN KEY ("containerId") REFERENCES "Container"("id") ON DELETE SET NULL ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "PresupuestoItem" ADD CONSTRAINT "PresupuestoItem_presupuestoId_fkey" FOREIGN KEY ("presupuestoId") REFERENCES "PresupuestoInicial"("id") ON DELETE RESTRICT ON UPDATE CASCADE;
