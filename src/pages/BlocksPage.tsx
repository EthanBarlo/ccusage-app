import React, { useEffect, useMemo } from "react";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { useCcusage } from "@/renderer/hooks/useCcusage";
import { ChartConfig, ChartContainer, ChartTooltip, ChartTooltipContent } from "@/components/ui/chart";
import { Line, LineChart, CartesianGrid, XAxis, YAxis, LabelList } from "recharts";

const chartConfig = {
  cost: {
    label: "Cost",
    color: "var(--chart-1)",
  },
} satisfies ChartConfig;

export default function BlocksPage() {
  const { data: ccusageData, loading, error, runCommand } = useCcusage();

  useEffect(() => {
    runCommand("blocks");
  }, [runCommand]);

  const currentBlockData = useMemo(() => {
    if (!ccusageData?.blocks) return null;
    // Get the most recent non-gap block
    const nonGapBlocks = ccusageData.blocks.filter((block: any) => !block.isGap);
    if (nonGapBlocks.length > 0) {
      return nonGapBlocks[nonGapBlocks.length - 1];
    }
    return null;
  }, [ccusageData]);

  const chartData = useMemo(() => {
    if (!ccusageData?.blocks) return [];
    // Get last 10 non-gap blocks for the chart
    const nonGapBlocks = ccusageData.blocks.filter((block: any) => !block.isGap);
    return nonGapBlocks.slice(-10).map((block: any) => ({
      blockStart: block.startTime,
      cost: block.costUSD,
    }));
  }, [ccusageData]);

  const formatCost = (value: number) => {
    return `$${value.toFixed(2)}`;
  };

  const formatTokens = (value: number) => {
    if (value >= 1000000) {
      return `${(value / 1000000).toFixed(1)}M`;
    } else if (value >= 1000) {
      return `${(value / 1000).toFixed(1)}K`;
    }
    return value.toString();
  };

  const formatBlockTime = (dateString: string) => {
    const date = new Date(dateString);
    return date.toLocaleString("en-US", { 
      month: "short", 
      day: "numeric",
      hour: "numeric",
      minute: "2-digit"
    });
  };

  if (loading) {
    return (
      <div className="flex items-center justify-center h-full">
        <p>Loading blocks data...</p>
      </div>
    );
  }

  if (error) {
    return (
      <div className="flex items-center justify-center h-full">
        <p className="text-red-500">Error: {error}</p>
      </div>
    );
  }

  return (
    <div className="space-y-6">
      <div>
        <h1 className="text-3xl font-bold tracking-tight">5-Hour Blocks</h1>
        <p className="text-muted-foreground">View your Claude Code usage in 5-hour billing windows</p>
      </div>

      <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-3">
        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">
              Current Block Cost
              {currentBlockData?.isActive && (
                <span className="ml-2 inline-flex items-center rounded-full bg-green-100 px-2 py-0.5 text-xs font-medium text-green-800">
                  Active
                </span>
              )}
            </CardTitle>
            <svg
              xmlns="http://www.w3.org/2000/svg"
              viewBox="0 0 24 24"
              fill="none"
              stroke="currentColor"
              strokeLinecap="round"
              strokeLinejoin="round"
              strokeWidth="2"
              className="h-4 w-4 text-muted-foreground"
            >
              <path d="M12 2v20M17 5H9.5a3.5 3.5 0 0 0 0 7h5a3.5 3.5 0 0 1 0 7H6" />
            </svg>
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">
              {currentBlockData ? formatCost(currentBlockData.costUSD) : "$0.00"}
            </div>
            <p className="text-xs text-muted-foreground">
              {currentBlockData ? formatBlockTime(currentBlockData.startTime) : "No data"}
            </p>
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Current Block Tokens</CardTitle>
            <svg
              xmlns="http://www.w3.org/2000/svg"
              viewBox="0 0 24 24"
              fill="none"
              stroke="currentColor"
              strokeLinecap="round"
              strokeLinejoin="round"
              strokeWidth="2"
              className="h-4 w-4 text-muted-foreground"
            >
              <path d="M22 12h-4l-3 9L9 3l-3 9H2" />
            </svg>
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">
              {currentBlockData ? formatTokens(currentBlockData.totalTokens) : "0"}
            </div>
            <p className="text-xs text-muted-foreground">
              Tokens used in current block
            </p>
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Blocks This Month</CardTitle>
            <svg
              xmlns="http://www.w3.org/2000/svg"
              viewBox="0 0 24 24"
              fill="none"
              stroke="currentColor"
              strokeLinecap="round"
              strokeLinejoin="round"
              strokeWidth="2"
              className="h-4 w-4 text-muted-foreground"
            >
              <rect width="18" height="18" x="3" y="4" rx="2" ry="2" />
              <line x1="16" x2="16" y1="2" y2="6" />
              <line x1="8" x2="8" y1="2" y2="6" />
              <line x1="3" x2="21" y1="10" y2="10" />
            </svg>
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">
              {ccusageData?.blocks
                ? ccusageData.blocks.filter((block: any) => {
                    if (block.isGap) return false;
                    const blockMonth = new Date(block.startTime).toISOString().substring(0, 7);
                    const currentMonth = new Date().toISOString().substring(0, 7);
                    return blockMonth === currentMonth;
                  }).length
                : 0}
            </div>
            <p className="text-xs text-muted-foreground">
              Active blocks in {new Date().toLocaleDateString("en-US", { month: "long" })}
            </p>
          </CardContent>
        </Card>
      </div>

      <Card>
        <CardHeader>
          <CardTitle>Block Cost Trend</CardTitle>
          <CardDescription>Cost per 5-hour block over time</CardDescription>
        </CardHeader>
        <CardContent className="pt-6">
          <ChartContainer config={chartConfig} className="h-[300px] w-full">
            <LineChart 
              accessibilityLayer
              data={chartData}
              margin={{ top: 20, left: 12, right: 60 }}
            >
              <CartesianGrid vertical={false} />
              <XAxis 
                dataKey="blockStart" 
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
                content={<ChartTooltipContent indicator="line" />}
              />
              <Line
                dataKey="cost"
                type="natural"
                stroke="var(--color-cost)"
                strokeWidth={2}
                dot={{
                  fill: "var(--color-cost)",
                }}
                activeDot={{
                  r: 6,
                }}
              >
                <LabelList
                  position="top"
                  offset={12}
                  className="fill-foreground"
                  fontSize={12}
                  formatter={(value: number) => formatCost(value)}
                />
              </Line>
            </LineChart>
          </ChartContainer>
        </CardContent>
      </Card>
    </div>
  );
}