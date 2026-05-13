-- CreateTable
CREATE TABLE "Pagina" (
    "id" TEXT NOT NULL,
    "titulo" TEXT NOT NULL DEFAULT 'Sin título',
    "icono" TEXT,
    "contenido" JSONB,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "Pagina_pkey" PRIMARY KEY ("id")
);
