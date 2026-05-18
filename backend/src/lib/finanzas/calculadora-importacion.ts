export type InputCostoImportacion = {
  fob: number;
  flete: number;
  seguro: number;
  arancel?: number;
  iva?: number;
  costosLocales?: number;
  cantidadUnidades?: number;
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

export function calcularCostoImportacion(
  input: InputCostoImportacion
): ResultadoCostoImportacion {
  const { fob, flete, seguro, costosLocales = 0, cantidadUnidades } = input;
  const arancel = input.arancel ?? 0.06;
  const iva = input.iva ?? 0.19;

  const cif = fob + flete + seguro;
  const montoArancel = cif * arancel;
  const baseIva = cif + montoArancel;
  const montoIva = baseIva * iva;
  const totalImpuestos = montoArancel + montoIva;
  const totalImportado = cif + totalImpuestos + costosLocales;
  const costoUnitario =
    cantidadUnidades && cantidadUnidades > 0
      ? totalImportado / cantidadUnidades
      : undefined;
  const factorMultiplicador = fob > 0 ? totalImportado / fob : 0;

  return {
    cif,
    montoArancel,
    baseIva,
    montoIva,
    totalImpuestos,
    totalImportado,
    costoUnitario,
    factorMultiplicador,
  };
}
