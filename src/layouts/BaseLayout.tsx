import React from "react";
import { AppSidebar } from "@/components/app-sidebar";
import { SiteHeader } from "@/components/site-header";
import { SidebarProvider } from "@/components/ui/sidebar";
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
            <SiteHeader />
            <main className="flex-1 overflow-auto p-4 md:p-6">
              {children}
            </main>
          </div>
        </div>
      </SidebarProvider>
    </div>
  );
}
