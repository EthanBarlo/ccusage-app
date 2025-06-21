import React, { type ReactNode } from "react";

interface DragWindowRegionProps {
  title?: ReactNode;
}

export default function DragWindowRegion({ title }: DragWindowRegionProps) {
  return (
    <div className="bg-sidebar flex w-screen items-center justify-center border-b draglayer">
      {title && (
        <div className="bg-sidebar text-sidebar-foreground/70 p-2 text-xs whitespace-nowrap select-none">
          {title}
        </div>
      )}
    </div>
  );
}
