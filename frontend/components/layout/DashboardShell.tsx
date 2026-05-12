"use client";

import { useState } from "react";
import type { ReactNode } from "react";
import { usePathname } from "next/navigation";
import { Header } from "@/components/layout/Header";
import { Sidebar } from "@/components/layout/Sidebar";
import { cn } from "@/lib/utils";

type DashboardShellProps = {
  children: ReactNode;
  userName: string;
};

export function DashboardShell({ children, userName }: DashboardShellProps) {
  const pathname = usePathname();
  const [showMobileSidebar, setShowMobileSidebar] = useState(pathname === "/dashboard");

  return (
    <div className="min-h-screen bg-notion-bg">
      <Header
        userName={userName}
        showBackToSidebar={!showMobileSidebar}
        onBackToSidebar={() => setShowMobileSidebar(true)}
      />

      <div className="md:flex md:min-h-[calc(100vh-3.5rem)]">
        <div className={cn(showMobileSidebar ? "block" : "hidden", "md:block")}>
          <Sidebar onNavigate={() => setShowMobileSidebar(false)} />
        </div>

        <main
          className={cn(
            "min-w-0 flex-1 bg-notion-bg px-4 py-5 sm:px-6 md:block md:px-8 md:py-8",
            showMobileSidebar ? "hidden" : "block"
          )}
        >
          {children}
        </main>
      </div>
    </div>
  );
}
