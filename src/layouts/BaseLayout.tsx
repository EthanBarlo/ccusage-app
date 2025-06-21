import React from "react";
import { AppSidebar } from "@/components/app-sidebar";
import { SidebarProvider, SidebarTrigger } from "@/components/ui/sidebar";
import DragWindowRegion from "@/components/DragWindowRegion";

export default function BaseLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return (
    <div className="flex h-screen w-screen flex-col overflow-hidden">
      <DragWindowRegion title="Claude Code Tracker" />
      <SidebarProvider defaultOpen={true}>
        <div className="flex flex-1 overflow-hidden relative min-h-0">
          <AppSidebar />
          <div className="flex flex-1 flex-col overflow-hidden">
            <main className="flex-1 overflow-auto p-4 pt-8 md:p-6 md:pt-10 relative">
              <div className="absolute top-1 left-1 z-10">
                <SidebarTrigger />
              </div>
              {children}
            </main>
          </div>
        </div>
      </SidebarProvider>
    </div>
  );
}
