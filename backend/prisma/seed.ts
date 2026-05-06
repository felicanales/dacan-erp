import { PrismaClient } from "@prisma/client";

const prisma = new PrismaClient();

async function main() {
  // Categorías base
  const categorias = await Promise.all([
    prisma.categoria.upsert({
      where: { nombre: "Alfombras" },
      update: {},
      create: { nombre: "Alfombras", descripcion: "Alfombras artesanales del Medio Oriente" },
    }),
    prisma.categoria.upsert({
      where: { nombre: "Decoración" },
      update: {},
      create: { nombre: "Decoración", descripcion: "Objetos decorativos y adornos" },
    }),
    prisma.categoria.upsert({
      where: { nombre: "Muebles" },
      update: {},
      create: { nombre: "Muebles", descripcion: "Inmuebles y muebles orientales" },
    }),
    prisma.categoria.upsert({
      where: { nombre: "Artesanías" },
      update: {},
      create: { nombre: "Artesanías", descripcion: "Artesanías y objetos únicos" },
    }),
  ]);

  // Proveedor de ejemplo
  const proveedor = await prisma.proveedor.upsert({
    where: { id: "seed-proveedor-01" },
    update: {},
    create: {
      id: "seed-proveedor-01",
      nombre: "Al-Rashid Trading Co.",
      pais: "Turquía",
      ciudad: "Estambul",
      contactoNombre: "Ahmed Al-Rashid",
      contactoEmail: "ahmed@alrashid.com",
      contactoTelefono: "+90 212 000 0000",
      moneda: "USD",
      condicionesPago: "30% anticipado, 70% contra BL",
    },
  });

  console.log("Seed completado:", {
    categorias: categorias.length,
    proveedores: 1,
  });
}

main()
  .catch((e) => {
    console.error(e);
    process.exit(1);
  })
  .finally(async () => {
    await prisma.$disconnect();
  });
