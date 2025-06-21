import { Separator } from "@/components/ui/separator"
import { SidebarTrigger } from "@/components/ui/sidebar"
import DragWindowRegion from "@/components/DragWindowRegion"
import ToggleTheme from "@/components/ToggleTheme"

export function SiteHeader() {
  return (
    <>
      <DragWindowRegion title="Claude Code Tracker" />
      <header className="sticky top-0 z-10 flex h-14 items-center border-b bg-background px-4">
        <SidebarTrigger />
        <Separator orientation="vertical" className="mx-2 h-4" />
        <h1 className="flex-1 text-base font-medium">Dashboard</h1>
        <ToggleTheme />
      </header>
    </>
  )
}
