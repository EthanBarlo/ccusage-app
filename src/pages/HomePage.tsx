import React from "react";
import { SectionCards } from "@/components/section-cards";
import { ChartAreaInteractive } from "@/components/chart-area-interactive";
import { DataTable } from "@/components/data-table";
import data from "@/app/dashboard/data.json";

export default function HomePage() {
  return (
    <>
      <SectionCards />
      {/* <div className="px-4 lg:px-6">
        <ChartAreaInteractive />
      </div>
      <DataTable data={data} /> */}
    </>
  );
}
