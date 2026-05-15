CREATE TYPE "InventarioMovimientoTipo" AS ENUM (
  'ingreso_disponible',
  'ingreso_transito',
  'confirmacion_transito',
  'salida',
  'devolucion',
  'merma',
  'ajuste_disponible',
  'ajuste_transito'
);

ALTER TABLE "Producto"
  ADD COLUMN "archivadoAt" TIMESTAMP(3),
  ADD COLUMN "archivadoMotivo" TEXT;

ALTER TABLE "Inventario"
  ADD COLUMN "stockDisponible" INTEGER NOT NULL DEFAULT 0,
  ADD COLUMN "stockEnTransito" INTEGER NOT NULL DEFAULT 0,
  ADD COLUMN "stockMinimo" INTEGER NOT NULL DEFAULT 5;

UPDATE "Inventario"
SET "stockDisponible" = "cantidad";

UPDATE "Inventario" AS i
SET "stockMinimo" = p."stockMinimo"
FROM "Producto" AS p
WHERE p."id" = i."productoId";

INSERT INTO "Inventario" (
  "id",
  "productoId",
  "ubicacion",
  "updatedAt",
  "stockDisponible",
  "stockEnTransito",
  "stockMinimo",
  "cantidad"
)
SELECT
  CONCAT('inv_', SUBSTRING(MD5(RANDOM()::TEXT || p."id") FROM 1 FOR 20)),
  p."id",
  NULL,
  CURRENT_TIMESTAMP,
  p."stockActual",
  0,
  p."stockMinimo",
  p."stockActual"
FROM "Producto" AS p
WHERE NOT EXISTS (
  SELECT 1
  FROM "Inventario" AS i
  WHERE i."productoId" = p."id"
);

CREATE TABLE "InventarioMovimiento" (
  "id" TEXT NOT NULL,
  "inventarioId" TEXT NOT NULL,
  "productoId" TEXT NOT NULL,
  "containerId" TEXT,
  "tipo" "InventarioMovimientoTipo" NOT NULL,
  "cantidad" INTEGER NOT NULL,
  "stockDisponibleAntes" INTEGER NOT NULL,
  "stockDisponibleDespues" INTEGER NOT NULL,
  "stockEnTransitoAntes" INTEGER NOT NULL,
  "stockEnTransitoDespues" INTEGER NOT NULL,
  "nota" TEXT,
  "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,

  CONSTRAINT "InventarioMovimiento_pkey" PRIMARY KEY ("id")
);

INSERT INTO "InventarioMovimiento" (
  "id",
  "inventarioId",
  "productoId",
  "containerId",
  "tipo",
  "cantidad",
  "stockDisponibleAntes",
  "stockDisponibleDespues",
  "stockEnTransitoAntes",
  "stockEnTransitoDespues",
  "nota",
  "createdAt"
)
SELECT
  CONCAT('mov_', SUBSTRING(MD5(RANDOM()::TEXT || i."id") FROM 1 FOR 20)),
  i."id",
  i."productoId",
  p."containerId",
  'ajuste_disponible',
  i."stockDisponible",
  0,
  i."stockDisponible",
  0,
  i."stockEnTransito",
  'Stock inicial migrado desde Producto',
  CURRENT_TIMESTAMP
FROM "Inventario" AS i
JOIN "Producto" AS p ON p."id" = i."productoId";

CREATE INDEX "InventarioMovimiento_productoId_createdAt_idx"
  ON "InventarioMovimiento"("productoId", "createdAt");

CREATE INDEX "InventarioMovimiento_inventarioId_createdAt_idx"
  ON "InventarioMovimiento"("inventarioId", "createdAt");

CREATE INDEX "InventarioMovimiento_containerId_idx"
  ON "InventarioMovimiento"("containerId");

ALTER TABLE "InventarioMovimiento"
  ADD CONSTRAINT "InventarioMovimiento_inventarioId_fkey"
    FOREIGN KEY ("inventarioId") REFERENCES "Inventario"("id") ON DELETE RESTRICT ON UPDATE CASCADE,
  ADD CONSTRAINT "InventarioMovimiento_productoId_fkey"
    FOREIGN KEY ("productoId") REFERENCES "Producto"("id") ON DELETE RESTRICT ON UPDATE CASCADE,
  ADD CONSTRAINT "InventarioMovimiento_containerId_fkey"
    FOREIGN KEY ("containerId") REFERENCES "Container"("id") ON DELETE SET NULL ON UPDATE CASCADE;

ALTER TABLE "Producto"
  DROP COLUMN "stockActual",
  DROP COLUMN "stockMinimo";

ALTER TABLE "Inventario"
  DROP COLUMN "cantidad";
