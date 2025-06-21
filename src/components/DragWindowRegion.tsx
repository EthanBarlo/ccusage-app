import React, { type ReactNode } from "react";
import ccusageIcon from "@/assets/ccusage-icon.svg";

interface DragWindowRegionProps {
  title?: ReactNode;
}

export default function DragWindowRegion({ title }: DragWindowRegionProps) {
  return (
    <div className="bg-sidebar flex w-screen items-center justify-center border-b draglayer">
      {title && (
        <div className="bg-sidebar text-sidebar-foreground/70 p-2 text-xs whitespace-nowrap select-none flex items-center gap-1.5">
          <img src={ccusageIcon} alt="Icon" className="w-4 h-4" />
          {title}
        </div>
      )}
    </div>
  );
}
