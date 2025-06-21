import React, { useEffect, useMemo } from "react";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { useCcusage } from "@/renderer/hooks/useCcusage";
import { ChartConfig, ChartContainer, ChartTooltip, ChartTooltipContent } from "@/components/ui/chart";
import { Line, LineChart, CartesianGrid, XAxis, YAxis, LabelList } from "recharts";
import { Button } from "@/components/ui/button";
import { RefreshCw, Database, DollarSign, Activity, CreditCard } from "lucide-react";
import { StatCard } from "@/renderer/components/StatCard";

const chartConfig = {
  cost: {
    label: "Cost",
    color: "var(--chart-1)",
  },
} satisfies ChartConfig;

export default function MonthlyPage() {
  const { 
    data: ccusageData, 
    loading, 
    error, 
    runCommand, 
    refresh,
    fromCache,
    cacheAge
  } = useCcusage({ autoRefresh: true });

  useEffect(() => {
    runCommand("monthly");
  }, [runCommand]);

  const currentMonthData = useMemo(() => {
    if (!ccusageData?.monthly) return null;
    const currentMonth = new Date().toISOString().substring(0, 7);
    return ccusageData.monthly.find((m: any) => m.month === currentMonth);
  }, [ccusageData]);

  const chartData = useMemo(() => {
    if (!ccusageData?.monthly) return [];
    return ccusageData.monthly.map((month: any) => ({
      month: month.month,
      cost: month.totalCost,
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

  if (loading && !ccusageData) {
    return (
      <div className="flex items-center justify-center h-full">
        <p>Loading monthly data...</p>
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
      <div className="flex justify-between items-center">
        <div>
          <h1 className="text-3xl font-bold tracking-tight">Monthly Usage</h1>
          <p className="text-muted-foreground">View your Claude Code usage statistics by month</p>
        </div>
        <div className="flex items-center gap-2">
          {fromCache && (
            <div className="flex items-center gap-1 text-sm text-muted-foreground">
              <Database className="h-4 w-4" />
              <span>Cached {cacheAge}</span>
            </div>
          )}
          <Button
            onClick={refresh}
            disabled={loading}
            size="sm"
            variant="outline"
          >
            <RefreshCw className={`h-4 w-4 mr-2 ${loading ? 'animate-spin' : ''}`} />
            Refresh
          </Button>
        </div>
      </div>

      <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-3">
        <StatCard
          title="This Month's Cost"
          description={currentMonthData?.month || "No data"}
          icon={<DollarSign className="h-4 w-4 text-muted-foreground" />}
        >
          <div className="text-2xl font-bold">
            {currentMonthData ? formatCost(currentMonthData.totalCost) : "$0.00"}
          </div>
        </StatCard>

        <StatCard
          title="This Month's Tokens"
          description="Total tokens used"
          icon={<Activity className="h-4 w-4 text-muted-foreground" />}
        >
          <div className="text-2xl font-bold">
            {currentMonthData ? formatTokens(currentMonthData.totalTokens) : "0"}
          </div>
        </StatCard>

        <StatCard
          title="Total Cost"
          description="All time total"
          icon={<CreditCard className="h-4 w-4 text-muted-foreground" />}
        >
          <div className="text-2xl font-bold">
            {ccusageData?.totals ? formatCost(ccusageData.totals.totalCost) : "$0.00"}
          </div>
        </StatCard>
      </div>

      <Card>
        <CardHeader>
          <CardTitle>Monthly Cost Trend</CardTitle>
          <CardDescription>Cost over time</CardDescription>
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
                dataKey="month" 
                tickLine={false}
                axisLine={false}
                tickMargin={8}
                tickFormatter={(value) => {
                  const date = new Date(value + "-01");
                  return date.toLocaleDateString("en-US", { month: "short", year: "numeric" });
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