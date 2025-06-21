import React from "react";
import { AppSidebar } from "@/components/app-sidebar";
import {
  SidebarProvider,
  SidebarTrigger,
  useSidebar,
} from "@/components/ui/sidebar";
import DragWindowRegion from "@/components/DragWindowRegion";

function SidebarWithToggle() {
  const { state } = useSidebar();

  return (
    <>
      <AppSidebar />
      <div
        className={`absolute top-2 z-50 transition-all duration-200 ${
          state === "expanded" ? "left-43" : "left-13"
        }`}
      >
        <SidebarTrigger />
      </div>
    </>
  );
}

export default function BaseLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return (
    <div className="flex h-screen w-screen flex-col overflow-hidden">
      <DragWindowRegion title="Ccusage" />
      <SidebarProvider defaultOpen={true}>
        <div className="relative flex min-h-0 flex-1 overflow-hidden">
          <SidebarWithToggle />
          <div className="flex flex-1 flex-col overflow-hidden">
            <main className="flex-1 overflow-auto p-6 pt-4 pl-10">
              {children}
            </main>
          </div>
        </div>
      </SidebarProvider>
    </div>
  );
}
