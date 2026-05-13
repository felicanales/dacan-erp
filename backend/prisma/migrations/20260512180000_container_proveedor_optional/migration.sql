-- Containers can group products from multiple proveedores.
-- Keep the legacy proveedorId column nullable to preserve existing data while
-- deriving current proveedores from Producto.proveedorId.
ALTER TABLE "Container" ALTER COLUMN "proveedorId" DROP NOT NULL;
