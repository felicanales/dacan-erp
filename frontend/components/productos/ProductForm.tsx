"use client";

import { useRef, useState } from "react";
import { useRouter } from "next/navigation";
import { ImageIcon, Loader2, Star, Trash2, UploadCloud } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { Textarea } from "@/components/ui/textarea";
import type { ProductoFormValues, ProductoOptions, ProductoEstado } from "./types";
import { PRODUCTO_ESTADO_LABELS } from "./producto-utils";

const NONE_VALUE = "__none";
const MAX_IMAGES = 6;
const MAX_IMAGE_SIZE = 2_000_000;

const inputClass =
  "h-9 w-full border-gray-200 bg-white text-sm text-gray-900 placeholder:text-gray-400 focus-visible:ring-1 focus-visible:ring-blue-500";
const labelClass = "text-sm font-medium text-gray-900";
const panelClass = "space-y-4 rounded-lg border border-gray-200 bg-white p-4 sm:p-5";

const ESTADOS: ProductoEstado[] = [
  "disponible",
  "agotado",
  "en_transito",
  "descontinuado",
];

type ProductFormProps = {
  options: ProductoOptions;
  defaultValues?: Partial<ProductoFormValues>;
  productoId?: string;
};

function fileToDataUrl(file: File) {
  return new Promise<string>((resolve, reject) => {
    const reader = new FileReader();
    reader.onload = () => {
      if (typeof reader.result === "string") {
        resolve(reader.result);
      } else {
        reject(new Error("No se pudo leer la imagen"));
      }
    };
    reader.onerror = () => reject(new Error("No se pudo leer la imagen"));
    reader.readAsDataURL(file);
  });
}

export function ProductForm({ options, defaultValues, productoId }: ProductFormProps) {
  const router = useRouter();
  const fileInputRef = useRef<HTMLInputElement | null>(null);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const [form, setForm] = useState<ProductoFormValues>({
    sku: defaultValues?.sku ?? "",
    nombre: defaultValues?.nombre ?? "",
    descripcion: defaultValues?.descripcion ?? "",
    categoriaId: defaultValues?.categoriaId ?? options.categorias[0]?.id ?? "",
    precioCosto: defaultValues?.precioCosto ?? "",
    precioB2B: defaultValues?.precioB2B ?? "",
    precioB2C: defaultValues?.precioB2C ?? "",
    stockActual: defaultValues?.stockActual ?? "0",
    stockMinimo: defaultValues?.stockMinimo ?? "5",
    proveedorId: defaultValues?.proveedorId ?? "",
    containerId: defaultValues?.containerId ?? "",
    fotos: defaultValues?.fotos ?? [],
    fotoPortada: defaultValues?.fotoPortada ?? defaultValues?.fotos?.[0] ?? "",
    estado: defaultValues?.estado ?? "disponible",
    notas: defaultValues?.notas ?? "",
  });

  function set(field: keyof ProductoFormValues, value: string | string[] | null) {
    setForm((prev) => ({ ...prev, [field]: value ?? "" }));
  }

  async function handleImages(files: FileList | null) {
    if (!files || files.length === 0) return;

    setError(null);
    const selected = Array.from(files);
    const validFiles = selected.filter((file) => file.type.startsWith("image/"));
    const oversized = validFiles.find((file) => file.size > MAX_IMAGE_SIZE);

    if (oversized) {
      setError("Cada imagen debe pesar 2 MB o menos.");
      return;
    }

    if (validFiles.length !== selected.length) {
      setError("Solo se pueden cargar archivos de imagen.");
      return;
    }

    if (form.fotos.length + validFiles.length > MAX_IMAGES) {
      setError(`Puedes cargar hasta ${MAX_IMAGES} imagenes por producto.`);
      return;
    }

    try {
      const dataUrls = await Promise.all(validFiles.map(fileToDataUrl));
      setForm((prev) => {
        const fotos = [...new Set([...prev.fotos, ...dataUrls])].slice(0, MAX_IMAGES);
        return {
          ...prev,
          fotos,
          fotoPortada: prev.fotoPortada || fotos[0] || "",
        };
      });
    } catch (err) {
      setError(err instanceof Error ? err.message : "No se pudieron cargar las imagenes.");
    } finally {
      if (fileInputRef.current) fileInputRef.current.value = "";
    }
  }

  function removeImage(image: string) {
    setForm((prev) => {
      const fotos = prev.fotos.filter((foto) => foto !== image);
      return {
        ...prev,
        fotos,
        fotoPortada: prev.fotoPortada === image ? fotos[0] ?? "" : prev.fotoPortada,
      };
    });
  }

  async function handleSubmit(e: React.FormEvent) {
    e.preventDefault();
    setError(null);
    setLoading(true);

    try {
      const url = productoId ? `/api/productos/${productoId}` : "/api/productos";
      const method = productoId ? "PUT" : "POST";
      const res = await fetch(url, {
        method,
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          ...form,
          precioCosto: Number(form.precioCosto || 0),
          precioB2B: Number(form.precioB2B || 0),
          precioB2C: Number(form.precioB2C || 0),
          stockActual: Number(form.stockActual || 0),
          stockMinimo: Number(form.stockMinimo || 0),
          proveedorId: form.proveedorId || null,
          containerId: form.containerId || null,
          fotoPortada: form.fotoPortada || form.fotos[0] || null,
        }),
      });

      if (!res.ok) {
        const data = await res.json().catch(() => ({}));
        throw new Error(data.error ?? "Error al guardar producto");
      }

      router.push("/productos");
      router.refresh();
    } catch (err) {
      setError(err instanceof Error ? err.message : "Algo salio mal. Intenta de nuevo.");
    } finally {
      setLoading(false);
    }
  }

  return (
    <form onSubmit={handleSubmit} className="space-y-6">
      <section className={panelClass}>
        <h2 className="text-sm font-semibold text-gray-900">Datos del producto</h2>
        <div className="grid grid-cols-1 gap-4 sm:grid-cols-2">
          <div className="space-y-1.5">
            <Label htmlFor="sku" className={labelClass}>
              SKU <span className="text-red-500">*</span>
            </Label>
            <Input
              id="sku"
              className={inputClass}
              value={form.sku}
              onChange={(e) => set("sku", e.target.value)}
              placeholder="Ej: DAC-ALF-001"
              required
            />
          </div>

          <div className="space-y-1.5">
            <Label htmlFor="estado" className={labelClass}>Estado</Label>
            <Select value={form.estado} onValueChange={(value) => set("estado", value as ProductoEstado)}>
              <SelectTrigger id="estado" className={inputClass}>
                <SelectValue />
              </SelectTrigger>
              <SelectContent>
                {ESTADOS.map((estado) => (
                  <SelectItem key={estado} value={estado}>
                    {PRODUCTO_ESTADO_LABELS[estado]}
                  </SelectItem>
                ))}
              </SelectContent>
            </Select>
          </div>

          <div className="space-y-1.5 sm:col-span-2">
            <Label htmlFor="nombre" className={labelClass}>
              Nombre <span className="text-red-500">*</span>
            </Label>
            <Input
              id="nombre"
              className={inputClass}
              value={form.nombre}
              onChange={(e) => set("nombre", e.target.value)}
              placeholder="Ej: Alfombra persa 2x3 m"
              required
            />
          </div>

          <div className="space-y-1.5 sm:col-span-2">
            <Label htmlFor="descripcion" className={labelClass}>Descripcion</Label>
            <Textarea
              id="descripcion"
              rows={4}
              className="resize-none border-gray-200 bg-white text-sm text-gray-900 placeholder:text-gray-400 focus-visible:ring-1 focus-visible:ring-blue-500"
              value={form.descripcion}
              onChange={(e) => set("descripcion", e.target.value)}
              placeholder="Materiales, medidas, origen, detalles comerciales."
            />
          </div>
        </div>
      </section>

      <section className={panelClass}>
        <h2 className="text-sm font-semibold text-gray-900">Categoria, proveedor y container</h2>
        <div className="grid grid-cols-1 gap-4 sm:grid-cols-3">
          <div className="space-y-1.5">
            <Label htmlFor="categoriaId" className={labelClass}>
              Categoria <span className="text-red-500">*</span>
            </Label>
            <Select value={form.categoriaId} onValueChange={(value) => set("categoriaId", value)}>
              <SelectTrigger id="categoriaId" className={inputClass}>
                <SelectValue placeholder="Seleccionar" />
              </SelectTrigger>
              <SelectContent>
                {options.categorias.map((categoria) => (
                  <SelectItem key={categoria.id} value={categoria.id}>
                    {categoria.nombre}
                  </SelectItem>
                ))}
              </SelectContent>
            </Select>
          </div>

          <div className="space-y-1.5">
            <Label htmlFor="proveedorId" className={labelClass}>Proveedor</Label>
            <Select
              value={form.proveedorId || NONE_VALUE}
              onValueChange={(value) => set("proveedorId", value === NONE_VALUE ? "" : value)}
            >
              <SelectTrigger id="proveedorId" className={inputClass}>
                <SelectValue />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value={NONE_VALUE}>Sin proveedor</SelectItem>
                {options.proveedores.map((proveedor) => (
                  <SelectItem key={proveedor.id} value={proveedor.id}>
                    {proveedor.nombre} / {proveedor.pais}
                  </SelectItem>
                ))}
              </SelectContent>
            </Select>
          </div>

          <div className="space-y-1.5">
            <Label htmlFor="containerId" className={labelClass}>Container opcional</Label>
            <Select
              value={form.containerId || NONE_VALUE}
              onValueChange={(value) => set("containerId", value === NONE_VALUE ? "" : value)}
            >
              <SelectTrigger id="containerId" className={inputClass}>
                <SelectValue />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value={NONE_VALUE}>Sin container</SelectItem>
                {options.containers.map((container) => (
                  <SelectItem key={container.id} value={container.id}>
                    {container.numero}
                  </SelectItem>
                ))}
              </SelectContent>
            </Select>
          </div>
        </div>
      </section>

      <section className={panelClass}>
        <h2 className="text-sm font-semibold text-gray-900">Stock y precios</h2>
        <div className="grid grid-cols-1 gap-4 sm:grid-cols-5">
          <div className="space-y-1.5">
            <Label htmlFor="stockActual" className={labelClass}>Stock actual</Label>
            <Input
              id="stockActual"
              type="number"
              min={0}
              className={inputClass}
              value={form.stockActual}
              onChange={(e) => set("stockActual", e.target.value)}
            />
          </div>
          <div className="space-y-1.5">
            <Label htmlFor="stockMinimo" className={labelClass}>Stock minimo</Label>
            <Input
              id="stockMinimo"
              type="number"
              min={0}
              className={inputClass}
              value={form.stockMinimo}
              onChange={(e) => set("stockMinimo", e.target.value)}
            />
          </div>
          <div className="space-y-1.5">
            <Label htmlFor="precioCosto" className={labelClass}>
              Costo USD <span className="text-red-500">*</span>
            </Label>
            <Input
              id="precioCosto"
              type="number"
              min={0}
              step="0.01"
              className={inputClass}
              value={form.precioCosto}
              onChange={(e) => set("precioCosto", e.target.value)}
              required
            />
          </div>
          <div className="space-y-1.5">
            <Label htmlFor="precioB2B" className={labelClass}>
              Precio B2B <span className="text-red-500">*</span>
            </Label>
            <Input
              id="precioB2B"
              type="number"
              min={0}
              className={inputClass}
              value={form.precioB2B}
              onChange={(e) => set("precioB2B", e.target.value)}
              required
            />
          </div>
          <div className="space-y-1.5">
            <Label htmlFor="precioB2C" className={labelClass}>
              Precio B2C <span className="text-red-500">*</span>
            </Label>
            <Input
              id="precioB2C"
              type="number"
              min={0}
              className={inputClass}
              value={form.precioB2C}
              onChange={(e) => set("precioB2C", e.target.value)}
              required
            />
          </div>
        </div>
      </section>

      <section className={panelClass}>
        <div className="flex flex-col gap-3 sm:flex-row sm:items-start sm:justify-between">
          <div>
            <h2 className="text-sm font-semibold text-gray-900">Imagenes del producto</h2>
            <p className="mt-1 text-xs text-gray-500">
              Hasta {MAX_IMAGES} imagenes. La portada se usa en el catalogo.
            </p>
          </div>
          <Button
            type="button"
            variant="outline"
            className="h-9 border-gray-200 text-sm text-gray-900"
            onClick={() => fileInputRef.current?.click()}
          >
            <UploadCloud className="mr-2 h-4 w-4" />
            Cargar imagenes
          </Button>
          <input
            ref={fileInputRef}
            type="file"
            accept="image/*"
            multiple
            className="hidden"
            onChange={(e) => void handleImages(e.target.files)}
          />
        </div>

        {form.fotos.length === 0 ? (
          <div className="flex min-h-40 flex-col items-center justify-center rounded-lg border border-dashed border-gray-200 bg-gray-50 px-4 text-center">
            <ImageIcon className="h-8 w-8 text-gray-400" />
            <p className="mt-2 text-sm font-medium text-gray-900">Sin imagenes cargadas</p>
            <p className="mt-1 text-xs text-gray-500">Puedes agregarlas ahora o editar el producto despues.</p>
          </div>
        ) : (
          <div className="grid grid-cols-2 gap-3 sm:grid-cols-3">
            {form.fotos.map((foto, index) => {
              const isCover = form.fotoPortada === foto;
              return (
                <div key={foto} className="overflow-hidden rounded-lg border border-gray-200 bg-white">
                  <div className="relative aspect-[4/3] bg-gray-50">
                    <img
                      src={foto}
                      alt={`Imagen ${index + 1} de ${form.nombre || "producto"}`}
                      className="h-full w-full object-cover"
                    />
                    {isCover && (
                      <span className="absolute left-2 top-2 rounded-full border border-amber-200 bg-amber-50 px-2 py-0.5 text-xs font-medium text-amber-700">
                        Portada
                      </span>
                    )}
                  </div>
                  <div className="flex items-center justify-between gap-2 p-2">
                    <Button
                      type="button"
                      variant="ghost"
                      size="sm"
                      className="h-8 text-xs text-gray-600"
                      onClick={() => set("fotoPortada", foto)}
                    >
                      <Star className="mr-1 h-3.5 w-3.5" />
                      Portada
                    </Button>
                    <Button
                      type="button"
                      variant="ghost"
                      size="icon-sm"
                      className="text-red-600 hover:bg-red-50 hover:text-red-700"
                      onClick={() => removeImage(foto)}
                      aria-label="Eliminar imagen"
                    >
                      <Trash2 className="h-4 w-4" />
                    </Button>
                  </div>
                </div>
              );
            })}
          </div>
        )}
      </section>

      <section className={panelClass}>
        <h2 className="text-sm font-semibold text-gray-900">Notas internas</h2>
        <Textarea
          rows={4}
          className="resize-none border-gray-200 bg-white text-sm text-gray-900 placeholder:text-gray-400 focus-visible:ring-1 focus-visible:ring-blue-500"
          value={form.notas}
          onChange={(e) => set("notas", e.target.value)}
          placeholder="Observaciones de compra, margen, despacho o calidad."
        />
      </section>

      {error && (
        <p className="rounded-md border border-red-200 bg-red-50 px-4 py-3 text-xs text-red-600">
          {error}
        </p>
      )}

      <div className="flex flex-col gap-3 sm:flex-row sm:items-center">
        <Button
          type="submit"
          disabled={loading || options.categorias.length === 0}
          className="h-9 w-full bg-blue-500 text-sm text-white hover:bg-blue-600 sm:w-auto"
        >
          {loading && <Loader2 className="mr-2 h-4 w-4 animate-spin" />}
          {loading ? "Guardando..." : productoId ? "Guardar cambios" : "Crear producto"}
        </Button>
        <Button
          type="button"
          variant="outline"
          className="h-9 w-full border-gray-200 text-sm text-gray-900 sm:w-auto"
          onClick={() => router.back()}
          disabled={loading}
        >
          Cancelar
        </Button>
      </div>
    </form>
  );
}
