import React, { useEffect, useMemo } from "react";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { useCcusage } from "@/renderer/hooks/useCcusage";
import { Button } from "@/components/ui/button";
import { RefreshCw, Database } from "lucide-react";
import { DailyUsageChart } from "@/renderer/components/DailyUsageChart";


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
      <div className="flex justify-between items-start">
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
        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Latest Day's Cost</CardTitle>
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
              {todayData ? formatCost(todayData.totalCost) : "$0.00"}
            </div>
            <p className="text-xs text-muted-foreground">
              {todayData?.date || "No data available"}
            </p>
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Latest Day's Tokens</CardTitle>
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
              {todayData ? formatTokens(todayData.totalTokens) : "0"}
            </div>
            <p className="text-xs text-muted-foreground">
              {todayData?.date ? `Tokens used on ${todayData.date}` : "No data available"}
            </p>
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Week Total</CardTitle>
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
              <rect width="20" height="14" x="2" y="5" rx="2" />
              <path d="M2 10h20" />
            </svg>
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">
              {ccusageData?.daily ? formatCost(
                ccusageData.daily.slice(-7).reduce((sum: number, day: any) => sum + day.totalCost, 0)
              ) : "$0.00"}
            </div>
            <p className="text-xs text-muted-foreground">
              Last 7 days total
            </p>
          </CardContent>
        </Card>
      </div>

      <DailyUsageChart 
        data={chartData}
        title="Daily Cost Trend"
        description="Cost over the last 7 days"
      />
    </div>
  );
}