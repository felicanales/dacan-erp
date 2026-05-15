-- CreateTable
CREATE TABLE "CarpetaPagina" (
    "id" TEXT NOT NULL,
    "nombre" TEXT NOT NULL,
    "icono" TEXT,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "CarpetaPagina_pkey" PRIMARY KEY ("id")
);

-- AlterTable
ALTER TABLE "Pagina" ADD COLUMN "carpetaId" TEXT;

-- AddForeignKey
ALTER TABLE "Pagina" ADD CONSTRAINT "Pagina_carpetaId_fkey" FOREIGN KEY ("carpetaId") REFERENCES "CarpetaPagina"("id") ON DELETE SET NULL ON UPDATE CASCADE;
