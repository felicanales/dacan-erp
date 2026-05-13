"use client";

import { UserButton } from "@clerk/nextjs";
import { ChevronLeft } from "lucide-react";

type HeaderProps = {
  userName: string;
  showBackToSidebar: boolean;
  onBackToSidebar: () => void;
};

export function Header({ userName, showBackToSidebar, onBackToSidebar }: HeaderProps) {
  return (
    <header className="sticky top-0 z-40 flex min-h-14 shrink-0 items-center justify-between gap-3 border-b border-gray-200 bg-white px-4 py-3 sm:px-6 md:px-8">
      <div className="flex min-w-0 items-center gap-2">
        {showBackToSidebar && (
          <button
            type="button"
            onClick={onBackToSidebar}
            className="flex size-9 shrink-0 items-center justify-center rounded-full border border-gray-200 bg-gray-50 text-gray-500 transition-colors hover:bg-gray-100 hover:text-gray-900 md:hidden"
            aria-label="Abrir menú"
          >
            <ChevronLeft className="h-5 w-5" />
          </button>
        )}
        <div className="flex min-w-0 items-center gap-2 rounded-full border border-gray-200 bg-gray-50 px-3 py-2 md:border-0 md:bg-transparent md:px-0 md:py-0">
          <span className="flex size-7 shrink-0 items-center justify-center rounded-full bg-gray-100 text-xs font-semibold text-gray-500 md:hidden">
            D
          </span>
          <p className="min-w-0 truncate text-sm font-medium text-gray-900 md:text-gray-500">
            <span className="md:hidden">Dacan Global Trade</span>
            <span className="hidden md:inline">
              Bienvenido, <span className="font-medium text-gray-900">{userName}</span>
            </span>
          </p>
        </div>
      </div>

      <div className="shrink-0">
        <UserButton appearance={{ elements: { avatarBox: { width: 46, height: 46 } } }} />
      </div>
    </header>
  );
}
