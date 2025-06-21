import React, { useMemo } from "react";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { ChartConfig, ChartContainer, ChartTooltip, ChartTooltipContent } from "@/components/ui/chart";
import { Bar, BarChart, CartesianGrid, XAxis, YAxis, LabelList } from "recharts";

const chartConfig = {
  cost: {
    label: "Cost",
    color: "var(--chart-1)",
  },
} satisfies ChartConfig;

interface DailyUsageChartProps {
  data: Array<{
    date: string;
    cost: number;
  }>;
  title?: string;
  description?: string;
  height?: number;
}

export function DailyUsageChart({ 
  data, 
  title = "Daily Cost Trend",
  description = "Cost over time",
  height = 300
}: DailyUsageChartProps) {
  const formatCost = (value: number) => {
    return `$${value.toFixed(2)}`;
  };

  // Fill in missing days with zero values
  const filledData = useMemo(() => {
    if (!data || data.length === 0) return [];
    
    // Sort data by date
    const sortedData = [...data].sort((a, b) => a.date.localeCompare(b.date));
    
    // Get the date range
    const startDate = new Date(sortedData[0].date);
    const endDate = new Date(sortedData[sortedData.length - 1].date);
    
    // Create a map of existing data
    const dataMap = new Map(sortedData.map(d => [d.date, d.cost]));
    
    // Fill in all days
    const filled = [];
    const currentDate = new Date(startDate);
    
    while (currentDate <= endDate) {
      const dateStr = currentDate.toISOString().substring(0, 10);
      filled.push({
        date: dateStr,
        cost: dataMap.get(dateStr) || 0
      });
      currentDate.setDate(currentDate.getDate() + 1);
    }
    
    return filled;
  }, [data]);

  return (
    <Card>
      <CardHeader>
        <CardTitle>{title}</CardTitle>
        <CardDescription>{description}</CardDescription>
      </CardHeader>
      <CardContent className="pt-6">
        <ChartContainer config={chartConfig} className={`h-[${height}px] w-full`}>
          <BarChart 
            accessibilityLayer
            data={filledData}
            margin={{ top: 20, left: 12, right: 12 }}
          >
            <CartesianGrid vertical={false} />
            <XAxis 
              dataKey="date" 
              tickLine={false}
              axisLine={false}
              tickMargin={8}
              tickFormatter={(value) => {
                const date = new Date(value);
                return date.toLocaleDateString("en-US", { month: "short", day: "numeric" });
              }}
            />
            <YAxis 
              tickLine={false}
              axisLine={false}
              tickFormatter={(value) => `$${value}`}
            />
            <ChartTooltip
              cursor={false}
              content={<ChartTooltipContent />}
            />
            <Bar
              dataKey="cost"
              fill="var(--color-cost)"
              radius={[4, 4, 0, 0]}
            >
              <LabelList
                position="top"
                offset={12}
                className="fill-foreground"
                fontSize={12}
                formatter={(value: number) => value === 0 ? "" : formatCost(value)}
              />
            </Bar>
          </BarChart>
        </ChartContainer>
      </CardContent>
    </Card>
  );
}