// Locally-defined enums matching backend/prisma/schema.prisma
// These replace the @prisma/client import since the frontend
// does not have @prisma/client as a dependency.

export enum UserRole {
  admin = "admin",
  operaciones = "operaciones",
  comercial = "comercial",
  readonly = "readonly",
}

export enum ProductoEstado {
  disponible = "disponible",
  agotado = "agotado",
  en_transito = "en_transito",
  descontinuado = "descontinuado",
}

export enum ContainerEstado {
  en_preparacion = "en_preparacion",
  en_transito = "en_transito",
  en_aduana = "en_aduana",
  liberado = "liberado",
  descargado = "descargado",
}

export enum PedidoEstado {
  borrador = "borrador",
  confirmado = "confirmado",
  en_preparacion = "en_preparacion",
  despachado = "despachado",
  entregado = "entregado",
  cancelado = "cancelado",
}

export enum TipoCliente {
  b2b = "b2b",
  b2c = "b2c",
}

export enum EstadoRelacionB2B {
  prospecto = "prospecto",
  activo = "activo",
  inactivo = "inactivo",
}

export enum TareaEstado {
  pendiente = "pendiente",
  en_progreso = "en_progreso",
  completada = "completada",
  cancelada = "cancelada",
}

export enum TareaPrioridad {
  alta = "alta",
  media = "media",
  baja = "baja",
}
