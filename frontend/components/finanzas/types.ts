export type TipoPago =
  | "suscripcion"
  | "gasto_unico"
  | "servicio_puntual"
  | "reembolso_ajuste";

export type EstadoPago = "pagado" | "pendiente" | "fallido" | "reembolsado";

export type EstadoSuscripcion = "activa" | "pausada" | "cancelada";

export type CategoriaFinanzas =
  | "tecnologia"
  | "marketing"
  | "logistica"
  | "administracion"
  | "disenio"
  | "finanzas";

export type DuenioTarjeta =
  | "galie"
  | "alejandro"
  | "felipe"
  | "juan_jose"
  | "lorenzo";

export type SuscripcionResumen = {
  id: string;
  nombre: string;
  categoria: CategoriaFinanzas | null;
  estado: EstadoSuscripcion;
  fechaAdquisicion: string | null;
  fechaRenovacion: string | null;
  _count?: { pagos: number };
};

export type Pago = {
  id: string;
  nombre: string;
  tipoPago: TipoPago;
  monto: string | null;
  montoPagadoNum: string | number | null;
  fechaPago: string | null;
  estadoPago: EstadoPago;
  categorias: CategoriaFinanzas[];
  factura: string | null;
  tarjeta: string | null;
  duenioTarjeta: DuenioTarjeta | null;
  suscripcionId: string | null;
  suscripcion: {
    id: string;
    nombre: string;
    estado: EstadoSuscripcion;
    fechaRenovacion: string | null;
  } | null;
};

export type ResumenFinanciero = {
  totalPagadoMes: number;
  totalSuscripciones: number;
  costoSuscripcionesMes: number;
  pagosPendientes: number;
  proximasRenovaciones: Array<{
    id: string;
    nombre: string;
    categoria: CategoriaFinanzas | null;
    fechaRenovacion: string | null;
  }>;
};

export type ResultadoCostoImportacion = {
  cif: number;
  montoArancel: number;
  baseIva: number;
  montoIva: number;
  totalImpuestos: number;
  totalImportado: number;
  costoUnitario?: number;
  factorMultiplicador: number;
};
