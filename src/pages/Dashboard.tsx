import React, { useEffect, useMemo } from "react";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { useCcusage } from "@/renderer/hooks/useCcusage";
import { Button } from "@/components/ui/button";
import { RefreshCw, Database, TrendingUp, Calendar } from "lucide-react";
import { BlocksUsageCard } from "@/renderer/components/BlocksUsageCard";
import { DailyUsageChart } from "@/renderer/components/DailyUsageChart";

const BILLING_DATE_KEY = "billing_date";

export default function Dashboard() {
  const { 
    data: dailyData, 
    loading: dailyLoading, 
    error: dailyError, 
    runCommand: runDailyCommand, 
    refresh: refreshDaily,
    fromCache: dailyFromCache,
    cacheAge: dailyCacheAge
  } = useCcusage({ autoRefresh: true });

  const { 
    data: blocksData, 
    loading: blocksLoading, 
    error: blocksError, 
    runCommand: runBlocksCommand,
  } = useCcusage({ autoRefresh: true });

  useEffect(() => {
    // Fetch all needed data
    runDailyCommand("daily");
    runBlocksCommand("blocks");
  }, [runDailyCommand, runBlocksCommand]);

  // Get billing period dates
  const billingPeriod = useMemo(() => {
    const savedDate = localStorage.getItem(BILLING_DATE_KEY) || "1";
    const billingDay = parseInt(savedDate);
    const now = new Date();
    const currentYear = now.getFullYear();
    const currentMonth = now.getMonth();
    const currentDay = now.getDate();
    
    let startDate: Date;
    let endDate: Date;
    
    if (currentDay >= billingDay) {
      // We're past the billing day this month
      startDate = new Date(currentYear, currentMonth, billingDay);
      endDate = new Date(currentYear, currentMonth + 1, billingDay - 1);
    } else {
      // We haven't reached the billing day yet this month
      startDate = new Date(currentYear, currentMonth - 1, billingDay);
      endDate = new Date(currentYear, currentMonth, billingDay - 1);
    }
    
    return { startDate, endDate, daysRemaining: Math.ceil((endDate.getTime() - now.getTime()) / (1000 * 60 * 60 * 24)) };
  }, []);

  // Calculate cost this billing period
  const costThisPeriod = useMemo(() => {
    if (!dailyData?.daily) return 0;
    
    const startDateStr = billingPeriod.startDate.toISOString().substring(0, 10);
    const endDateStr = new Date().toISOString().substring(0, 10);
    
    return dailyData.daily
      .filter((day: any) => day.date >= startDateStr && day.date <= endDateStr)
      .reduce((sum: number, day: any) => sum + day.totalCost, 0);
  }, [dailyData, billingPeriod]);



  // Get chart data for the current billing period including days with no usage
  const chartData = useMemo(() => {
    const data = [];
    const today = new Date();
    const startDate = new Date(billingPeriod.startDate);
    const endDate = today > billingPeriod.endDate ? billingPeriod.endDate : today;
    
    // Create entries for each day in the billing period up to today
    const currentDate = new Date(startDate);
    while (currentDate <= endDate) {
      const dateStr = currentDate.toISOString().substring(0, 10);
      
      // Find if we have data for this day
      const dayData = dailyData?.daily?.find((d: any) => d.date === dateStr);
      
      data.push({
        date: dateStr,
        cost: dayData ? dayData.totalCost : 0,
      });
      
      // Move to next day
      currentDate.setDate(currentDate.getDate() + 1);
    }
    
    return data;
  }, [dailyData, billingPeriod]);

  const formatCost = (value: number) => {
    return `$${value.toFixed(2)}`;
  };

  const formatDate = (date: Date) => {
    return date.toLocaleDateString("en-US", { month: "short", day: "numeric" });
  };

  const loading = dailyLoading || blocksLoading;
  const error = dailyError || blocksError;

  if (loading && !dailyData) {
    return (
      <div className="flex items-center justify-center h-full">
        <p>Loading dashboard data...</p>
      </div>
    );
  }

  if (error && !dailyData) {
    return (
      <div className="flex items-center justify-center h-full">
        <p className="text-red-500">Error: {error}</p>
      </div>
    );
  }

  return (
    <div className="space-y-6 p-6">
      <div className="flex justify-between items-start">
        <div>
          <h1 className="text-3xl font-bold tracking-tight">Dashboard</h1>
          <p className="text-muted-foreground">
            Billing period: {formatDate(billingPeriod.startDate)} - {formatDate(billingPeriod.endDate)}
          </p>
        </div>
        <div className="flex items-center gap-2">
          {dailyFromCache && (
            <div className="flex items-center gap-1 text-sm text-muted-foreground">
              <Database className="h-4 w-4" />
              <span>Cached {dailyCacheAge}</span>
            </div>
          )}
          <Button
            onClick={() => {
              refreshDaily();
              runBlocksCommand("blocks");
            }}
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
        {/* Cost This Billing Period */}
        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Cost This Period</CardTitle>
            <Calendar className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">{formatCost(costThisPeriod)}</div>
            <p className="text-xs text-muted-foreground">
              {billingPeriod.daysRemaining} days remaining
            </p>
          </CardContent>
        </Card>

        {/* Blocks Used */}
        <BlocksUsageCard blocksData={blocksData} />

        {/* Average Daily Cost */}
        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Average Daily Cost</CardTitle>
            <TrendingUp className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">
              {(() => {
                const daysInPeriod = Math.ceil((billingPeriod.endDate.getTime() - billingPeriod.startDate.getTime()) / (1000 * 60 * 60 * 24));
                const daysPassed = daysInPeriod - billingPeriod.daysRemaining;
                return daysPassed > 0 ? formatCost(costThisPeriod / daysPassed) : "$0.00";
              })()}
            </div>
            <p className="text-xs text-muted-foreground">
              Based on {Math.ceil((billingPeriod.endDate.getTime() - billingPeriod.startDate.getTime()) / (1000 * 60 * 60 * 24)) - billingPeriod.daysRemaining} days
            </p>
          </CardContent>
        </Card>
      </div>

      {/* Daily Usage Chart */}
      <DailyUsageChart 
        data={chartData}
        title="Daily Usage Trend"
        description="Your daily cost for the current billing period"
      />

    </div>
  );
}