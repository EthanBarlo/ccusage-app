import * as React from "react";
import {
  IconChartBar,
  IconClock,
  IconDashboard,
  IconCalendar,
  IconHelp,
  IconSettings,
  IconBoxMultiple,
  IconActivity,
} from "@tabler/icons-react";

import { NavMain } from "@/components/nav-main";
import { NavSecondary } from "@/components/nav-secondary";
import {
  Sidebar,
  SidebarContent,
  SidebarFooter,
  SidebarHeader,
  SidebarMenu,
  SidebarMenuButton,
  SidebarMenuItem,
} from "@/components/ui/sidebar";
import ccusageIcon from "@/assets/ccusage-icon.svg";

const data = {
  navMain: [
    {
      title: "Dashboard",
      url: "/",
      icon: IconDashboard,
      isActive: true,
    },
    {
      title: "Active Session",
      url: "/active",
      icon: IconActivity,
    },
    {
      title: "Daily Usage",
      url: "/daily",
      icon: IconCalendar,
    },
    {
      title: "Monthly Usage",
      url: "/monthly",
      icon: IconChartBar,
    },
    {
      title: "Sessions",
      url: "/sessions",
      icon: IconClock,
    },
    {
      title: "5-Hour Blocks",
      url: "/blocks",
      icon: IconBoxMultiple,
    },
  ],
  navSecondary: [
    {
      title: "Settings",
      url: "/settings",
      icon: IconSettings,
    },
  ],
};

export function AppSidebar({ ...props }: React.ComponentProps<typeof Sidebar>) {
  return (
    <Sidebar collapsible="icon" {...props}>
      <SidebarHeader>
        <div className="flex items-center gap-2 px-2 py-1.5">
          <img src={ccusageIcon} alt="Ccusage" className="size-6" />
          <span className="text-base font-semibold group-data-[collapsible=icon]:hidden">
            Ccusage
          </span>
        </div>
      </SidebarHeader>
      <SidebarContent>
        <NavMain items={data.navMain} />
      </SidebarContent>
      <SidebarFooter>
        <NavSecondary items={data.navSecondary} />
      </SidebarFooter>
    </Sidebar>
  );
}
