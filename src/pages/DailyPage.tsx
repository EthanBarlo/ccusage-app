import React, { useEffect, useMemo } from "react";
import { useCcusage } from "@/renderer/hooks/useCcusage";
import { Button } from "@/components/ui/button";
import { RefreshCw, Database, DollarSign, Activity, Calendar } from "lucide-react";
import { DailyUsageChart } from "@/renderer/components/DailyUsageChart";
import { StatCard } from "@/renderer/components/StatCard";


export default function DailyPage() {
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
    runCommand("daily");
  }, [runCommand]);

  const todayData = useMemo(() => {
    if (!ccusageData?.daily) return null;
    const today = new Date().toISOString().substring(0, 10);
    // First try to find today's data
    let data = ccusageData.daily.find((d: any) => d.date === today);
    // If no data for today, get the most recent day
    if (!data && ccusageData.daily.length > 0) {
      data = ccusageData.daily[ccusageData.daily.length - 1];
    }
    return data;
  }, [ccusageData]);

  const chartData = useMemo(() => {
    if (!ccusageData?.daily) return [];
    // Get last 7 days of data
    return ccusageData.daily.slice(-7).map((day: any) => ({
      date: day.date,
      cost: day.totalCost,
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

  if (loading) {
    return (
      <div className="flex items-center justify-center h-full">
        <p>Loading daily data...</p>
      </div>
    );
  }
  
  // Debug: Show raw data structure
  if (!ccusageData) {
    return (
      <div className="flex items-center justify-center h-full">
        <p>No data received from ccusage</p>
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
          <h1 className="text-3xl font-bold tracking-tight">Daily Usage</h1>
          <p className="text-muted-foreground">View your Claude Code usage statistics by day</p>
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
          title="Latest Day's Cost"
          description={todayData?.date || "No data available"}
          icon={<DollarSign className="h-4 w-4 text-muted-foreground" />}
        >
          <div className="text-2xl font-bold">
            {todayData ? formatCost(todayData.totalCost) : "$0.00"}
          </div>
        </StatCard>

        <StatCard
          title="Latest Day's Tokens"
          description={todayData?.date ? `Tokens used on ${todayData.date}` : "No data available"}
          icon={<Activity className="h-4 w-4 text-muted-foreground" />}
        >
          <div className="text-2xl font-bold">
            {todayData ? formatTokens(todayData.totalTokens) : "0"}
          </div>
        </StatCard>

        <StatCard
          title="Week Total"
          description="Last 7 days total"
          icon={<Calendar className="h-4 w-4 text-muted-foreground" />}
        >
          <div className="text-2xl font-bold">
            {ccusageData?.daily ? formatCost(
              ccusageData.daily.slice(-7).reduce((sum: number, day: any) => sum + day.totalCost, 0)
            ) : "$0.00"}
          </div>
        </StatCard>
      </div>

      <DailyUsageChart 
        data={chartData}
        title="Daily Cost Trend"
        description="Cost over the last 7 days"
      />
    </div>
  );
}