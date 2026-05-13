"use client";

import { useState } from "react";
import { ImageIcon } from "lucide-react";
import { cn } from "@/lib/utils";
import { getCoverImage } from "./producto-utils";

type ProductGalleryProps = {
  fotos: string[];
  fotoPortada: string | null;
  nombre: string;
};

export function ProductGallery({ fotos, fotoPortada, nombre }: ProductGalleryProps) {
  const [selected, setSelected] = useState(() => getCoverImage(fotos, fotoPortada));
  const currentImage = selected && fotos.includes(selected) ? selected : getCoverImage(fotos, fotoPortada);

  return (
    <div className="space-y-3">
      <div className="flex aspect-[4/3] items-center justify-center overflow-hidden rounded-lg border border-gray-200 bg-gray-50">
        {currentImage ? (
          <img src={currentImage} alt={nombre} className="h-full w-full object-cover" />
        ) : (
          <div className="flex flex-col items-center text-gray-400">
            <ImageIcon className="h-10 w-10" />
            <span className="mt-2 text-sm">Sin imagen</span>
          </div>
        )}
      </div>

      {fotos.length > 1 && (
        <div className="grid grid-cols-5 gap-2">
          {fotos.map((foto, index) => (
            <button
              key={foto}
              type="button"
              onClick={() => setSelected(foto)}
              className={cn(
                "aspect-square overflow-hidden rounded-md border bg-gray-50",
                currentImage === foto ? "border-blue-500 ring-2 ring-blue-100" : "border-gray-200"
              )}
              aria-label={`Ver imagen ${index + 1}`}
            >
              <img
                src={foto}
                alt={`${nombre} ${index + 1}`}
                className="h-full w-full object-cover"
              />
            </button>
          ))}
        </div>
      )}
    </div>
  );
}
