CREATE TYPE "ReunionTipo" AS ENUM ('interna', 'con_proveedor', 'con_cliente');

ALTER TABLE "Reunion"
  ADD COLUMN "duracionMinutos" INTEGER,
  ADD COLUMN "tipo" "ReunionTipo" NOT NULL DEFAULT 'interna',
  ADD COLUMN "linkVideoCall" TEXT,
  ADD COLUMN "actaEnviada" BOOLEAN NOT NULL DEFAULT false,
  ADD COLUMN "actaEnviadaAt" TIMESTAMP(3);
