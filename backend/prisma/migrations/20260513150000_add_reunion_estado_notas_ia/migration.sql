CREATE TYPE "ReunionEstado" AS ENUM ('programada', 'completada', 'cancelada');

ALTER TABLE "Reunion"
  ADD COLUMN "estado" "ReunionEstado" NOT NULL DEFAULT 'programada',
  ADD COLUMN "notasIa" TEXT;
