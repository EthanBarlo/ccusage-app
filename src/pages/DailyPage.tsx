import React, { useEffect, useMemo } from "react";
import { useCcusage } from "@/renderer/hooks/useCcusage";
import { Button } from "@/components/ui/button";
import {
  RefreshCw,
  Database,
  DollarSign,
  Activity,
  Calendar,
} from "lucide-react";
import { DailyUsageChart } from "@/renderer/components/DailyUsageChart";
import { StatCard } from "@/renderer/components/StatCard";
import { subDays, format } from "date-fns";

export default function DailyPage() {
  const {
    data: ccusageData,
    loading,
    error,
    runCommand,
    refresh,
    fromCache,
    cacheAge,
  } = useCcusage({ autoRefresh: true });

  useEffect(() => {
    // Fetch only the last 14 days
    const endDate = new Date();
    const startDate = subDays(endDate, 14);
    
    const startDateStr = format(startDate, 'yyyyMMdd');
    const endDateStr = format(endDate, 'yyyyMMdd');
    
    runCommand(`daily --since ${startDateStr} --until ${endDateStr}`);
  }, [runCommand]);

  const todayData = useMemo(() => {
    if (!ccusageData?.daily) return null;
    const today = format(new Date(), 'yyyy-MM-dd');
    // Only return data if it's actually from today
    return ccusageData.daily.find((d: any) => d.date === today) || null;
  }, [ccusageData]);

  const chartData = useMemo(() => {
    if (!ccusageData?.daily) return [];

    // Create a map of existing data
    const dataMap = new Map<string, number>();
    ccusageData.daily.forEach((day: any) => {
      dataMap.set(day.date, day.totalCost);
    });

    // Generate last 14 days
    const data = [];
    const today = new Date();

    for (let i = 13; i >= 0; i--) {
      const date = subDays(today, i);
      const dateStr = format(date, "yyyy-MM-dd");
      data.push({
        date: dateStr,
        cost: dataMap.get(dateStr) || 0,
      });
    }

    return data;
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
      <div className="flex h-full items-center justify-center">
        <p>Loading daily data...</p>
      </div>
    );
  }

  // Debug: Show raw data structure
  if (!ccusageData) {
    return (
      <div className="flex h-full items-center justify-center">
        <p>No data received from ccusage</p>
      </div>
    );
  }

  if (error) {
    return (
      <div className="flex h-full items-center justify-center">
        <p className="text-red-500">Error: {error}</p>
      </div>
    );
  }

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-3xl font-bold tracking-tight">Daily Usage</h1>
          <p className="text-muted-foreground">
            View your Claude Code usage statistics by day
          </p>
        </div>
        <div className="flex items-center gap-2">
          {fromCache && (
            <div className="text-muted-foreground flex items-center gap-1 text-sm">
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
            <RefreshCw
              className={`mr-2 h-4 w-4 ${loading ? "animate-spin" : ""}`}
            />
            Refresh
          </Button>
        </div>
      </div>

      <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-3">
        <StatCard
          title="Today's Cost"
          description={format(new Date(), 'MMM d, yyyy')}
          icon={<DollarSign className="text-muted-foreground h-4 w-4" />}
        >
          <div className="text-2xl font-bold">
            {todayData ? formatCost(todayData.totalCost) : "$0.00"}
          </div>
        </StatCard>

        <StatCard
          title="Today's Tokens"
          description={todayData ? "Tokens used today" : "No usage today"}
          icon={<Activity className="text-muted-foreground h-4 w-4" />}
        >
          <div className="text-2xl font-bold">
            {todayData ? formatTokens(todayData.totalTokens) : "0"}
          </div>
        </StatCard>

        <StatCard
          title="This Week Total"
          description="Last 7 days total"
          icon={<Calendar className="text-muted-foreground h-4 w-4" />}
        >
          <div className="text-2xl font-bold">
            {formatCost(
              chartData.slice(-7).reduce((sum, day) => sum + day.cost, 0),
            )}
          </div>
        </StatCard>
      </div>

      <DailyUsageChart
        data={chartData}
        title="Daily Cost Trend"
        description="Cost over the last 14 days"
      />
    </div>
  );
}
