import type {
  Inventario,
  InventarioMovimientoTipo,
  Prisma,
  ProductoEstado,
} from "@prisma/client";

type TransactionClient = Prisma.TransactionClient;

type StockSnapshot = Pick<
  Inventario,
  "id" | "productoId" | "stockDisponible" | "stockEnTransito" | "stockMinimo" | "ubicacion"
>;

type MovementInput = {
  productoId: string;
  tipo: InventarioMovimientoTipo;
  cantidad: number;
  containerId?: string | null;
  nota?: string | null;
  allowZero?: boolean;
};

export function deriveProductStatus(
  inventario: Pick<Inventario, "stockDisponible" | "stockEnTransito">,
  archivadoAt?: Date | null
): ProductoEstado {
  if (archivadoAt) return "descontinuado";
  if (inventario.stockDisponible > 0) return "disponible";
  if (inventario.stockEnTransito > 0) return "en_transito";
  return "agotado";
}

function assertValidMovement(
  tipo: InventarioMovimientoTipo,
  cantidad: number,
  allowZero?: boolean
) {
  if (!Number.isInteger(cantidad)) {
    throw new Error("La cantidad debe ser un numero entero");
  }

  if (allowZero && cantidad === 0) return;

  if (["ajuste_disponible", "ajuste_transito"].includes(tipo)) {
    if (cantidad === 0) throw new Error("El ajuste no puede ser cero");
    return;
  }

  if (cantidad <= 0) {
    throw new Error("La cantidad debe ser mayor a cero");
  }
}

function nextStock(
  inventario: StockSnapshot,
  tipo: InventarioMovimientoTipo,
  cantidad: number
) {
  let stockDisponible = inventario.stockDisponible;
  let stockEnTransito = inventario.stockEnTransito;

  switch (tipo) {
    case "ingreso_disponible":
    case "devolucion":
      stockDisponible += cantidad;
      break;
    case "ingreso_transito":
      stockEnTransito += cantidad;
      break;
    case "confirmacion_transito":
      if (stockEnTransito < cantidad) {
        throw new Error("No hay suficiente stock en transito para confirmar");
      }
      stockEnTransito -= cantidad;
      stockDisponible += cantidad;
      break;
    case "salida":
    case "merma":
      if (stockDisponible < cantidad) {
        throw new Error("No hay suficiente stock disponible para descontar");
      }
      stockDisponible -= cantidad;
      break;
    case "ajuste_disponible":
      stockDisponible += cantidad;
      if (stockDisponible < 0) {
        throw new Error("El ajuste deja stock disponible negativo");
      }
      break;
    case "ajuste_transito":
      stockEnTransito += cantidad;
      if (stockEnTransito < 0) {
        throw new Error("El ajuste deja stock en transito negativo");
      }
      break;
  }

  return { stockDisponible, stockEnTransito };
}

export async function syncProductStatus(
  tx: TransactionClient,
  productoId: string,
  inventario?: Pick<Inventario, "stockDisponible" | "stockEnTransito">
) {
  const [producto, currentInventory] = await Promise.all([
    tx.producto.findUnique({
      where: { id: productoId },
      select: { archivadoAt: true },
    }),
    inventario
      ? Promise.resolve(inventario)
      : tx.inventario.findUnique({
          where: { productoId },
          select: { stockDisponible: true, stockEnTransito: true },
        }),
  ]);

  if (!producto || !currentInventory) return null;

  const estado = deriveProductStatus(currentInventory, producto.archivadoAt);
  return tx.producto.update({
    where: { id: productoId },
    data: { estado },
  });
}

export async function createInventoryMovement(
  tx: TransactionClient,
  input: MovementInput
) {
  assertValidMovement(input.tipo, input.cantidad, input.allowZero);

  const inventario = await tx.inventario.findUnique({
    where: { productoId: input.productoId },
  });

  if (!inventario) {
    throw new Error("Inventario no encontrado para el producto");
  }

  const next = nextStock(inventario, input.tipo, input.cantidad);

  const updated = await tx.inventario.update({
    where: { id: inventario.id },
    data: {
      stockDisponible: next.stockDisponible,
      stockEnTransito: next.stockEnTransito,
    },
  });

  await tx.inventarioMovimiento.create({
    data: {
      inventarioId: inventario.id,
      productoId: input.productoId,
      containerId: input.containerId ?? null,
      tipo: input.tipo,
      cantidad: input.cantidad,
      stockDisponibleAntes: inventario.stockDisponible,
      stockDisponibleDespues: updated.stockDisponible,
      stockEnTransitoAntes: inventario.stockEnTransito,
      stockEnTransitoDespues: updated.stockEnTransito,
      nota: input.nota?.trim() || null,
    },
  });

  await syncProductStatus(tx, input.productoId, updated);

  return updated;
}

export async function confirmContainerTransitStock(
  tx: TransactionClient,
  containerId: string,
  nota?: string | null
) {
  const productos = await tx.producto.findMany({
    where: {
      containerId,
      archivadoAt: null,
      inventario: { stockEnTransito: { gt: 0 } },
    },
    select: {
      id: true,
      inventario: {
        select: { stockEnTransito: true },
      },
    },
  });

  for (const producto of productos) {
    const cantidad = producto.inventario?.stockEnTransito ?? 0;
    if (cantidad <= 0) continue;

    await createInventoryMovement(tx, {
      productoId: producto.id,
      tipo: "confirmacion_transito",
      cantidad,
      containerId,
      nota: nota ?? "Confirmacion por descarga de container",
    });
  }

  return productos.length;
}
