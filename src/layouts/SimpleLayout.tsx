import React, { useState } from "react";
import DragWindowRegion from "@/components/DragWindowRegion";
import ToggleTheme from "@/components/ToggleTheme";
import { NavMain } from "@/components/nav-main";
import { Button } from "@/components/ui/button";
import { 
  IconMenu2, 
  IconX,
  IconChartBar,
  IconClock,
  IconDashboard,
  IconCalendar,
  IconBoxMultiple,
  IconSettings
} from "@tabler/icons-react";

const navItems = [
  {
    title: "Dashboard",
    url: "#",
    icon: IconDashboard,
    isActive: true,
  },
  {
    title: "Daily Usage",
    url: "#daily",
    icon: IconCalendar,
  },
  {
    title: "Monthly Usage",
    url: "#monthly",
    icon: IconChartBar,
  },
  {
    title: "Sessions",
    url: "#sessions",
    icon: IconClock,
  },
  {
    title: "5-Hour Blocks",
    url: "#blocks",
    icon: IconBoxMultiple,
  },
];

export default function SimpleLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  const [sidebarOpen, setSidebarOpen] = useState(true);

  return (
    <div className="flex h-screen w-full overflow-hidden">
      {/* Sidebar */}
      <div
        className={`${
          sidebarOpen ? "w-64" : "w-0"
        } transition-all duration-300 overflow-hidden border-r bg-background`}
      >
        <div className="flex h-full w-64 flex-col">
          <div className="flex h-14 items-center border-b px-4">
            <IconChartBar className="mr-2 h-5 w-5" />
            <span className="font-semibold">Claude Code Tracker</span>
          </div>
          <nav className="flex-1 p-4">
            <NavMain items={navItems} />
          </nav>
          <div className="border-t p-4">
            <Button variant="ghost" className="w-full justify-start" asChild>
              <a href="#settings">
                <IconSettings className="mr-2 h-4 w-4" />
                Settings
              </a>
            </Button>
          </div>
        </div>
      </div>

      {/* Main Content */}
      <div className="flex flex-1 flex-col">
        <DragWindowRegion title="Claude Code Tracker" />
        <header className="flex h-14 items-center border-b bg-background px-4">
          <Button
            variant="ghost"
            size="icon"
            onClick={() => setSidebarOpen(!sidebarOpen)}
          >
            {sidebarOpen ? <IconX /> : <IconMenu2 />}
          </Button>
          <h1 className="ml-4 flex-1 text-base font-medium">Dashboard</h1>
          <ToggleTheme />
        </header>
        <main className="flex-1 overflow-auto p-6">
          {children}
        </main>
      </div>
    </div>
  );
}