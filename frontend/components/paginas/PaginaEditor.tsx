"use client";

import { useEditor, EditorContent } from "@tiptap/react";
import StarterKit from "@tiptap/starter-kit";
import Placeholder from "@tiptap/extension-placeholder";
import { useCallback, useEffect, useRef, useState } from "react";
import Link from "next/link";
import { useRouter } from "next/navigation";
import {
  ChevronLeft, Check, Loader2, Trash2,
  Bold, Italic, Underline as UnderlineIcon, Strikethrough,
  Heading1, Heading2, Heading3, List, ListOrdered, Quote,
  Code, Code2, Minus,
} from "lucide-react";

type JSONContent = Record<string, unknown>;

type Props = {
  id: string;
  initialTitulo: string;
  initialIcono: string | null;
  initialContenido: JSONContent | null;
};

export function PaginaEditor({ id, initialTitulo, initialIcono, initialContenido }: Props) {
  const router = useRouter();
  const [titulo, setTitulo] = useState(initialTitulo || "Sin título");
  const [icono, setIcono] = useState(initialIcono || "");
  const [guardando, setGuardando] = useState(false);
  const [guardado, setGuardado] = useState(true);
  const [showDelete, setShowDelete] = useState(false);
  const [deletingPage, setDeletingPage] = useState(false);
  const saveTimer = useRef<ReturnType<typeof setTimeout> | null>(null);
  const latestRef = useRef({ titulo, icono });

  useEffect(() => {
    latestRef.current = { titulo, icono };
  }, [titulo, icono]);

  const editor = useEditor({
    immediatelyRender: false,
    extensions: [
      StarterKit,
      Placeholder.configure({ placeholder: "Escribe algo aquí..." }),
    ],
    content: initialContenido ?? undefined,
    onUpdate: () => {
      setGuardado(false);
      scheduleSave();
    },
    editorProps: {
      attributes: { class: "tiptap" },
    },
  });

  const scheduleSave = useCallback(() => {
    if (saveTimer.current) clearTimeout(saveTimer.current);
    saveTimer.current = setTimeout(async () => {
      if (!editor) return;
      const { titulo: t, icono: ic } = latestRef.current;
      setGuardando(true);
      try {
        await fetch(`/api/paginas/${id}`, {
          method: "PUT",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify({
            titulo: t || "Sin título",
            icono: ic || null,
            contenido: editor.getJSON(),
          }),
        });
        setGuardado(true);
      } catch {
        // silently ignore, usuario puede seguir editando
      } finally {
        setGuardando(false);
      }
    }, 1000);
  }, [editor, id]);

  function handleTituloChange(e: React.ChangeEvent<HTMLTextAreaElement>) {
    setTitulo(e.target.value);
    setGuardado(false);
    scheduleSave();
    autoResize(e.currentTarget);
  }

  function handleIconoChange(e: React.ChangeEvent<HTMLInputElement>) {
    const val = e.target.value.slice(-2); // solo el último emoji
    setIcono(val);
    setGuardado(false);
    scheduleSave();
  }

  function autoResize(el: HTMLTextAreaElement) {
    el.style.height = "auto";
    el.style.height = el.scrollHeight + "px";
  }

  async function handleDelete() {
    setDeletingPage(true);
    try {
      await fetch(`/api/paginas/${id}`, { method: "DELETE" });
      router.push("/paginas");
      router.refresh();
    } catch {
      setDeletingPage(false);
    }
  }

  if (!editor) return null;

  return (
    <div className="flex min-h-screen flex-col">
      {/* Barra superior */}
      <div className="sticky top-0 z-20 flex items-center justify-between border-b border-gray-200 bg-white/90 px-6 py-2.5 backdrop-blur-sm">
        <Link
          href="/paginas"
          className="inline-flex items-center gap-1 text-sm text-gray-500 transition-colors hover:text-gray-900"
        >
          <ChevronLeft className="h-4 w-4" />
          Páginas
        </Link>

        <div className="flex items-center gap-4">
          <span className="flex items-center gap-1.5 text-xs text-gray-400">
            {guardando ? (
              <>
                <Loader2 className="h-3 w-3 animate-spin" />
                Guardando...
              </>
            ) : guardado ? (
              <>
                <Check className="h-3 w-3 text-emerald-500" />
                Guardado
              </>
            ) : null}
          </span>

          <button
            onClick={() => setShowDelete(true)}
            className="inline-flex items-center gap-1.5 rounded-md px-2.5 py-1.5 text-xs text-gray-500 transition-colors hover:bg-red-50 hover:text-red-600"
          >
            <Trash2 className="h-3.5 w-3.5" />
            Eliminar
          </button>
        </div>
      </div>

      {/* Contenido de la página */}
      <div className="mx-auto w-full max-w-3xl flex-1 px-6 py-10 md:px-12">
        {/* Ícono */}
        <div className="mb-3">
          <input
            type="text"
            value={icono}
            onChange={handleIconoChange}
            placeholder="+"
            className="w-14 rounded-lg border border-dashed border-gray-200 bg-transparent text-center text-3xl leading-none text-gray-400 focus:border-gray-300 focus:outline-none hover:border-gray-300 transition-colors py-1"
            title="Agrega un emoji como ícono"
          />
        </div>

        {/* Título */}
        <textarea
          value={titulo}
          onChange={handleTituloChange}
          ref={(el) => { if (el) autoResize(el); }}
          placeholder="Sin título"
          rows={1}
          className="mb-8 w-full resize-none border-0 bg-transparent text-4xl font-bold leading-tight text-gray-900 placeholder:text-gray-300 focus:outline-none"
        />

        {/* Toolbar de formato */}
        <div className="mb-4 flex flex-wrap items-center gap-0.5 rounded-lg border border-gray-200 bg-gray-50 p-1.5">
          <ToolbarButton
            onClick={() => editor.chain().focus().toggleHeading({ level: 1 }).run()}
            active={editor.isActive("heading", { level: 1 })}
            title="Título 1"
          >
            <Heading1 className="h-4 w-4" />
          </ToolbarButton>
          <ToolbarButton
            onClick={() => editor.chain().focus().toggleHeading({ level: 2 }).run()}
            active={editor.isActive("heading", { level: 2 })}
            title="Título 2"
          >
            <Heading2 className="h-4 w-4" />
          </ToolbarButton>
          <ToolbarButton
            onClick={() => editor.chain().focus().toggleHeading({ level: 3 }).run()}
            active={editor.isActive("heading", { level: 3 })}
            title="Título 3"
          >
            <Heading3 className="h-4 w-4" />
          </ToolbarButton>

          <div className="mx-1 h-5 w-px bg-gray-300" />

          <ToolbarButton
            onClick={() => editor.chain().focus().toggleBold().run()}
            active={editor.isActive("bold")}
            title="Negrita"
          >
            <Bold className="h-4 w-4" />
          </ToolbarButton>
          <ToolbarButton
            onClick={() => editor.chain().focus().toggleItalic().run()}
            active={editor.isActive("italic")}
            title="Cursiva"
          >
            <Italic className="h-4 w-4" />
          </ToolbarButton>
          <ToolbarButton
            onClick={() => editor.chain().focus().toggleUnderline().run()}
            active={editor.isActive("underline")}
            title="Subrayado"
          >
            <UnderlineIcon className="h-4 w-4" />
          </ToolbarButton>
          <ToolbarButton
            onClick={() => editor.chain().focus().toggleStrike().run()}
            active={editor.isActive("strike")}
            title="Tachado"
          >
            <Strikethrough className="h-4 w-4" />
          </ToolbarButton>
          <ToolbarButton
            onClick={() => editor.chain().focus().toggleCode().run()}
            active={editor.isActive("code")}
            title="Código inline"
          >
            <Code className="h-4 w-4" />
          </ToolbarButton>

          <div className="mx-1 h-5 w-px bg-gray-300" />

          <ToolbarButton
            onClick={() => editor.chain().focus().toggleBulletList().run()}
            active={editor.isActive("bulletList")}
            title="Lista con viñetas"
          >
            <List className="h-4 w-4" />
          </ToolbarButton>
          <ToolbarButton
            onClick={() => editor.chain().focus().toggleOrderedList().run()}
            active={editor.isActive("orderedList")}
            title="Lista numerada"
          >
            <ListOrdered className="h-4 w-4" />
          </ToolbarButton>

          <div className="mx-1 h-5 w-px bg-gray-300" />

          <ToolbarButton
            onClick={() => editor.chain().focus().toggleBlockquote().run()}
            active={editor.isActive("blockquote")}
            title="Cita"
          >
            <Quote className="h-4 w-4" />
          </ToolbarButton>
          <ToolbarButton
            onClick={() => editor.chain().focus().toggleCodeBlock().run()}
            active={editor.isActive("codeBlock")}
            title="Bloque de código"
          >
            <Code2 className="h-4 w-4" />
          </ToolbarButton>
          <ToolbarButton
            onClick={() => editor.chain().focus().setHorizontalRule().run()}
            active={false}
            title="Línea divisoria"
          >
            <Minus className="h-4 w-4" />
          </ToolbarButton>
        </div>

        {/* Editor TipTap */}
        <EditorContent editor={editor} className="min-h-[400px]" />
      </div>

      {/* Modal de confirmación de eliminación */}
      {showDelete && (
        <div
          className="fixed inset-0 z-50 flex items-center justify-center bg-black/40"
          onClick={() => setShowDelete(false)}
        >
          <div
            className="mx-4 w-full max-w-sm rounded-xl bg-white p-6 shadow-xl"
            onClick={(e) => e.stopPropagation()}
          >
            <h3 className="mb-2 text-base font-semibold text-gray-900">
              ¿Eliminar página?
            </h3>
            <p className="mb-5 text-sm text-gray-500">
              Se eliminará &ldquo;{titulo || "Sin título"}&rdquo;. Esta acción no se puede deshacer.
            </p>
            <div className="flex justify-end gap-3">
              <button
                onClick={() => setShowDelete(false)}
                className="rounded-lg border border-gray-200 px-4 py-2 text-sm text-gray-700 transition-colors hover:bg-gray-50"
              >
                Cancelar
              </button>
              <button
                onClick={handleDelete}
                disabled={deletingPage}
                className="inline-flex items-center gap-2 rounded-lg bg-red-600 px-4 py-2 text-sm text-white transition-colors hover:bg-red-700 disabled:opacity-60"
              >
                {deletingPage && <Loader2 className="h-3.5 w-3.5 animate-spin" />}
                Sí, eliminar
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}

function ToolbarButton({
  children,
  onClick,
  active,
  title,
}: {
  children: React.ReactNode;
  onClick: () => void;
  active: boolean;
  title: string;
}) {
  return (
    <button
      type="button"
      onClick={onClick}
      title={title}
      className={[
        "rounded-md p-1.5 transition-colors",
        active
          ? "bg-blue-100 text-blue-700"
          : "text-gray-500 hover:bg-gray-200 hover:text-gray-900",
      ].join(" ")}
    >
      {children}
    </button>
  );
}
