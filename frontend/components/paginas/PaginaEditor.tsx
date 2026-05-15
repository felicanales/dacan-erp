"use client";

import { EditorContent, useEditor } from "@tiptap/react";
import { BubbleMenu } from "@tiptap/react/menus";
import StarterKit from "@tiptap/starter-kit";
import Placeholder from "@tiptap/extension-placeholder";
import Underline from "@tiptap/extension-underline";
import { useCallback, useEffect, useRef, useState } from "react";
import Link from "next/link";
import { useRouter } from "next/navigation";
import {
  Bold,
  Check,
  ChevronLeft,
  Code,
  Italic,
  Loader2,
  MoreHorizontal,
  Strikethrough,
  Trash2,
  Underline as UnderlineIcon,
} from "lucide-react";

type JSONContent = Record<string, unknown>;

type Props = {
  id: string;
  initialTitulo: string;
  initialIcono: string | null;
  initialContenido: JSONContent | null;
};

type SaveState = "saved" | "saving" | "dirty" | "error";

export function PaginaEditor({ id, initialTitulo, initialContenido }: Props) {
  const router = useRouter();
  const [titulo, setTitulo] = useState(initialTitulo || "Sin título");
  const [saveState, setSaveState] = useState<SaveState>("saved");
  const [showDelete, setShowDelete] = useState(false);
  const [showActions, setShowActions] = useState(false);
  const [deletingPage, setDeletingPage] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const saveTimer = useRef<ReturnType<typeof setTimeout> | null>(null);
  const latestRef = useRef({ titulo });

  useEffect(() => {
    latestRef.current = { titulo };
  }, [titulo]);

  const editor = useEditor({
    immediatelyRender: false,
    extensions: [
      StarterKit,
      Underline,
      Placeholder.configure({ placeholder: "Empieza a escribir..." }),
    ],
    content: initialContenido ?? undefined,
    onUpdate: () => {
      setSaveState("dirty");
      scheduleSave();
    },
    editorProps: {
      attributes: {
        class: "tiptap",
        spellcheck: "true",
      },
    },
  });

  const saveNow = useCallback(async () => {
    if (!editor) return;

    const { titulo: currentTitle } = latestRef.current;
    setSaveState("saving");
    setError(null);

    try {
      const res = await fetch(`/api/paginas/${id}`, {
        method: "PUT",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          titulo: currentTitle.trim() || "Sin título",
          contenido: editor.getJSON(),
        }),
      });

      if (!res.ok) {
        const data = await res.json().catch(() => null);
        throw new Error(data?.error ?? `Error ${res.status}`);
      }

      setSaveState("saved");
    } catch (err) {
      setSaveState("error");
      setError(err instanceof Error ? err.message : "No se pudo guardar");
    }
  }, [editor, id]);

  const scheduleSave = useCallback(() => {
    if (saveTimer.current) clearTimeout(saveTimer.current);
    saveTimer.current = setTimeout(() => {
      void saveNow();
    }, 900);
  }, [saveNow]);

  useEffect(() => {
    return () => {
      if (saveTimer.current) clearTimeout(saveTimer.current);
    };
  }, []);

  function handleTituloChange(e: React.ChangeEvent<HTMLTextAreaElement>) {
    setTitulo(e.target.value);
    setSaveState("dirty");
    scheduleSave();
    autoResize(e.currentTarget);
  }

  function autoResize(el: HTMLTextAreaElement) {
    el.style.height = "auto";
    el.style.height = `${el.scrollHeight}px`;
  }

  async function handleDelete() {
    setDeletingPage(true);
    setError(null);

    try {
      const res = await fetch(`/api/paginas/${id}`, { method: "DELETE" });
      if (!res.ok) {
        const data = await res.json().catch(() => null);
        throw new Error(data?.error ?? `Error ${res.status}`);
      }

      router.push("/paginas");
      router.refresh();
    } catch (err) {
      setError(err instanceof Error ? err.message : "No se pudo eliminar");
      setDeletingPage(false);
    }
  }

  if (!editor) return null;

  return (
    <div className="min-h-screen bg-white text-gray-950">
      <header className="sticky top-0 z-20 border-b border-gray-100 bg-white/95 backdrop-blur">
        <div className="mx-auto flex h-12 w-full max-w-4xl items-center justify-between px-4 sm:px-6">
          <Link
            href="/paginas"
            className="inline-flex h-8 items-center gap-1 rounded-md px-2 text-sm text-gray-500 transition-colors hover:bg-gray-50 hover:text-gray-900"
          >
            <ChevronLeft className="h-4 w-4" />
            Páginas
          </Link>

          <div className="flex items-center gap-2">
            <SaveIndicator state={saveState} error={error} />
            <div className="relative">
              <button
                type="button"
                onClick={() => setShowActions((value) => !value)}
                className="flex h-8 w-8 items-center justify-center rounded-md text-gray-500 transition-colors hover:bg-gray-50 hover:text-gray-900"
                title="Más acciones"
              >
                <MoreHorizontal className="h-4 w-4" />
              </button>
              {showActions && (
                <div className="absolute right-0 top-9 z-30 w-44 rounded-lg border border-gray-200 bg-white py-1 shadow-lg">
                  <button
                    type="button"
                    onClick={() => {
                      setShowActions(false);
                      setShowDelete(true);
                    }}
                    className="flex w-full items-center gap-2 px-3 py-2 text-left text-sm text-red-600 hover:bg-red-50"
                  >
                    <Trash2 className="h-4 w-4 text-red-400" />
                    Eliminar
                  </button>
                </div>
              )}
            </div>
          </div>
        </div>
      </header>

      <main className="mx-auto w-full max-w-3xl px-5 pb-24 pt-12 sm:px-8 md:pt-14">
        <textarea
          value={titulo}
          onChange={handleTituloChange}
          ref={(el) => {
            if (el) autoResize(el);
          }}
          placeholder="Sin título"
          rows={1}
          className="mb-8 min-h-12 w-full resize-none border-0 bg-transparent text-4xl font-semibold leading-tight text-gray-950 outline-none placeholder:text-gray-300 sm:text-5xl"
        />

        <SelectionMenu editor={editor} />
        <EditorContent editor={editor} className="mt-10 min-h-[52vh]" />
      </main>

      {showDelete && (
        <div
          className="fixed inset-0 z-50 flex items-center justify-center bg-black/35"
          onClick={() => {
            if (!deletingPage) setShowDelete(false);
          }}
        >
          <div
            className="mx-4 w-full max-w-sm rounded-lg bg-white p-6 shadow-xl"
            onClick={(event) => event.stopPropagation()}
          >
            <h3 className="mb-2 text-base font-semibold text-gray-900">Eliminar página</h3>
            <p className="mb-5 text-sm text-gray-500">
              Se eliminará "{titulo || "Sin título"}". Esta acción no se puede deshacer.
            </p>
            {error && <p className="mb-4 text-sm text-red-600">{error}</p>}
            <div className="flex justify-end gap-3">
              <button
                type="button"
                onClick={() => setShowDelete(false)}
                disabled={deletingPage}
                className="rounded-lg border border-gray-200 px-4 py-2 text-sm text-gray-700 transition-colors hover:bg-gray-50 disabled:opacity-60"
              >
                Cancelar
              </button>
              <button
                type="button"
                onClick={handleDelete}
                disabled={deletingPage}
                className="inline-flex items-center gap-2 rounded-lg bg-red-600 px-4 py-2 text-sm text-white transition-colors hover:bg-red-700 disabled:opacity-60"
              >
                {deletingPage && <Loader2 className="h-3.5 w-3.5 animate-spin" />}
                Eliminar
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}

function SelectionMenu({ editor }: { editor: NonNullable<ReturnType<typeof useEditor>> }) {
  return (
    <BubbleMenu
      editor={editor}
      updateDelay={80}
      shouldShow={({ editor: currentEditor, state }) => {
        return currentEditor.isFocused && !state.selection.empty;
      }}
      className="flex items-center gap-0.5 rounded-lg border border-gray-200 bg-white p-1 shadow-lg"
    >
      <MenuButton
        onClick={() => editor.chain().focus().toggleBold().run()}
        active={editor.isActive("bold")}
        title="Negrita"
      >
        <Bold className="h-4 w-4" />
      </MenuButton>
      <MenuButton
        onClick={() => editor.chain().focus().toggleItalic().run()}
        active={editor.isActive("italic")}
        title="Cursiva"
      >
        <Italic className="h-4 w-4" />
      </MenuButton>
      <MenuButton
        onClick={() => editor.chain().focus().toggleUnderline().run()}
        active={editor.isActive("underline")}
        title="Subrayado"
      >
        <UnderlineIcon className="h-4 w-4" />
      </MenuButton>
      <MenuButton
        onClick={() => editor.chain().focus().toggleStrike().run()}
        active={editor.isActive("strike")}
        title="Tachado"
      >
        <Strikethrough className="h-4 w-4" />
      </MenuButton>
      <div className="mx-1 h-5 w-px bg-gray-200" />
      <MenuButton
        onClick={() => editor.chain().focus().toggleCode().run()}
        active={editor.isActive("code")}
        title="Código"
      >
        <Code className="h-4 w-4" />
      </MenuButton>
    </BubbleMenu>
  );
}

function SaveIndicator({ state, error }: { state: SaveState; error: string | null }) {
  if (state === "saving") {
    return (
      <span className="inline-flex items-center gap-1.5 rounded-full bg-gray-50 px-2.5 py-1 text-xs text-gray-500">
        <Loader2 className="h-3 w-3 animate-spin" />
        Guardando
      </span>
    );
  }

  if (state === "error") {
    return (
      <span className="inline-flex max-w-[160px] items-center truncate rounded-full bg-red-50 px-2.5 py-1 text-xs text-red-600">
        {error ?? "Error"}
      </span>
    );
  }

  if (state === "dirty") {
    return <span className="rounded-full bg-gray-50 px-2.5 py-1 text-xs text-gray-400">Sin guardar</span>;
  }

  return (
    <span className="inline-flex items-center gap-1.5 rounded-full bg-emerald-50 px-2.5 py-1 text-xs text-emerald-700">
      <Check className="h-3 w-3" />
      Guardado
    </span>
  );
}

function MenuButton({
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
        "flex h-8 w-8 flex-none items-center justify-center rounded-md transition-colors",
        active
          ? "bg-gray-900 text-white"
          : "text-gray-500 hover:bg-gray-100 hover:text-gray-950",
      ].join(" ")}
    >
      {children}
    </button>
  );
}
