import { PrismaClient } from "@prisma/client";
import { ensureTeamUsers } from "../src/lib/team-users";

const prisma = new PrismaClient();

async function main() {
  await ensureTeamUsers(prisma);

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

  const producto = await prisma.producto.upsert({
    where: { sku: "DAC-ALF-001" },
    update: {},
    create: {
      sku: "DAC-ALF-001",
      nombre: "Alfombra persa 2x3 m",
      descripcion: "Alfombra decorativa importada para venta B2B y B2C.",
      categoriaId: categorias[0].id,
      precioCosto: 120,
      precioB2B: 189990,
      precioB2C: 249990,
      proveedorId: proveedor.id,
      fotos: [],
      fotoPortada: null,
      estado: "disponible",
      notas: "Producto de muestra para validar el catalogo.",
    },
  });

  const inventario = await prisma.inventario.upsert({
    where: { productoId: producto.id },
    update: {
      stockMinimo: 3,
      ubicacion: "Bodega principal",
    },
    create: {
      productoId: producto.id,
      stockDisponible: 8,
      stockEnTransito: 0,
      stockMinimo: 3,
      ubicacion: "Bodega principal",
    },
  });

  const movimientos = await prisma.inventarioMovimiento.count({
    where: { productoId: producto.id },
  });

  if (movimientos === 0) {
    await prisma.inventarioMovimiento.create({
      data: {
        inventarioId: inventario.id,
        productoId: producto.id,
        tipo: "ingreso_disponible",
        cantidad: inventario.stockDisponible,
        stockDisponibleAntes: 0,
        stockDisponibleDespues: inventario.stockDisponible,
        stockEnTransitoAntes: 0,
        stockEnTransitoDespues: inventario.stockEnTransito,
        nota: "Stock inicial de seed",
      },
    });
  }

  console.log("Seed completado:", {
    categorias: categorias.length,
    proveedores: 1,
    productos: producto ? 1 : 0,
    usuarios: 5,
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
