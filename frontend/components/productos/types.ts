export type ProductoEstado =
  | "disponible"
  | "agotado"
  | "en_transito"
  | "descontinuado";

export type CategoriaOption = {
  id: string;
  nombre: string;
};

export type ProveedorOption = {
  id: string;
  nombre: string;
  pais: string;
};

export type ContainerOption = {
  id: string;
  numero: string;
  estado: string;
};

export type ProductoOptions = {
  categorias: CategoriaOption[];
  proveedores: ProveedorOption[];
  containers: ContainerOption[];
};

export type ProductoFormValues = {
  sku: string;
  nombre: string;
  descripcion: string;
  categoriaId: string;
  precioCosto: string;
  precioB2B: string;
  precioB2C: string;
  stockActual: string;
  stockMinimo: string;
  proveedorId: string;
  containerId: string;
  fotos: string[];
  fotoPortada: string;
  estado: ProductoEstado;
  notas: string;
};
