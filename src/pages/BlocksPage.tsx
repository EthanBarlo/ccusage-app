import React, { useEffect, useMemo } from "react";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { useCcusage } from "@/renderer/hooks/useCcusage";
import { ChartConfig, ChartContainer, ChartTooltip, ChartTooltipContent } from "@/components/ui/chart";
import { Area, AreaChart, CartesianGrid, XAxis, YAxis, ReferenceLine } from "recharts";
import { AlertCircle, TrendingUp, RefreshCw, Database } from "lucide-react";
import { Alert, AlertDescription } from "@/components/ui/alert";
import { Button } from "@/components/ui/button";
import { SessionsUsageCard } from "@/renderer/components/SessionsUsageCard";
import { StatCard } from "@/renderer/components/StatCard";
import { 
  format, 
  startOfMonth, 
  endOfMonth, 
  addMonths, 
  subMonths,
  eachDayOfInterval,
  isAfter,
  isSameDay,
  differenceInDays,
  addDays,
  parseISO
} from "date-fns";

const chartConfig = {
  sessions: {
    label: "Sessions",
    color: "var(--chart-1)",
  },
} satisfies ChartConfig;

const SESSIONS_PER_PERIOD = 50;
const BILLING_DATE_KEY = "billing_date";

export default function BlocksPage() {
  const { 
    data: ccusageData, 
    loading, 
    error, 
    runCommand,
    refresh,
    fromCache,
    cacheAge
  } = useCcusage({ autoRefresh: true });

  // Get billing date from localStorage
  const billingDate = useMemo(() => {
    const saved = localStorage.getItem(BILLING_DATE_KEY);
    return saved ? parseInt(saved) : 1;
  }, []);

  // Calculate current billing period dates
  const { periodStart, periodEnd } = useMemo(() => {
    const now = new Date();
    const currentDay = now.getDate();

    let periodStart: Date;
    let periodEnd: Date;

    if (currentDay >= billingDate) {
      // We're in the current billing period
      periodStart = new Date(now.getFullYear(), now.getMonth(), billingDate);
      periodEnd = addMonths(periodStart, 1);
    } else {
      // We're in the previous month's billing period
      periodEnd = new Date(now.getFullYear(), now.getMonth(), billingDate);
      periodStart = subMonths(periodEnd, 1);
    }

    return { periodStart, periodEnd };
  }, [billingDate]);

  useEffect(() => {
    const startDate = format(periodStart, 'yyyyMMdd');
    const endDate = format(periodEnd, 'yyyyMMdd');
    
    runCommand(`blocks --since ${startDate} --until ${endDate}`);
  }, [runCommand, periodStart, periodEnd]);

  const currentBlockData = useMemo(() => {
    if (!ccusageData?.blocks) return null;
    // Get the most recent non-gap block
    const nonGapBlocks = ccusageData.blocks.filter((block: any) => !block.isGap);
    if (nonGapBlocks.length > 0) {
      return nonGapBlocks[nonGapBlocks.length - 1];
    }
    return null;
  }, [ccusageData]);

  // Calculate sessions used in current billing period
  const sessionsInCurrentPeriod = useMemo(() => {
    if (!ccusageData?.blocks) return 0;
    
    return ccusageData.blocks.filter((block: any) => {
      if (block.isGap) return false;
      const blockDate = parseISO(block.startTime);
      return blockDate >= periodStart && blockDate < periodEnd;
    }).length;
  }, [ccusageData, periodStart, periodEnd]);

  const sessionsRemaining = SESSIONS_PER_PERIOD - sessionsInCurrentPeriod;
  const sessionsUsagePercentage = (sessionsInCurrentPeriod / SESSIONS_PER_PERIOD) * 100;

  // Calculate average sessions per day and projection
  const { averageSessionsPerDay, projectedTotalSessions, willExceedLimit } = useMemo(() => {
    if (!ccusageData?.blocks || sessionsInCurrentPeriod === 0) {
      return { averageSessionsPerDay: 0, projectedTotalSessions: 0, willExceedLimit: false };
    }

    const now = new Date();
    const daysElapsed = Math.max(1, differenceInDays(now, periodStart) + 1);
    const daysInPeriod = differenceInDays(periodEnd, periodStart);
    
    const averageSessionsPerDay = sessionsInCurrentPeriod / daysElapsed;
    const projectedTotalSessions = Math.round(averageSessionsPerDay * daysInPeriod);
    const willExceedLimit = projectedTotalSessions > SESSIONS_PER_PERIOD;

    return { averageSessionsPerDay, projectedTotalSessions, willExceedLimit };
  }, [ccusageData, sessionsInCurrentPeriod, periodStart, periodEnd]);

  const chartData = useMemo(() => {
    // If no data, return minimal chart data
    if (!ccusageData?.blocks) {
      return [{
        date: periodStart.toISOString(),
        sessions: 0,
      }, {
        date: periodEnd.toISOString(),
        sessions: 0,
      }];
    }
    
    // Get sessions from current billing period
    const periodBlocks = ccusageData.blocks.filter((block: any) => {
      if (block.isGap) return false;
      const blockDate = parseISO(block.startTime);
      return blockDate >= periodStart && blockDate < periodEnd;
    }).sort((a: any, b: any) => parseISO(a.startTime).getTime() - parseISO(b.startTime).getTime());
    
    // Create a map of sessions per day
    const sessionsByDay = new Map<string, number>();
    periodBlocks.forEach((block: any) => {
      const date = format(parseISO(block.startTime), 'yyyy-MM-dd');
      sessionsByDay.set(date, (sessionsByDay.get(date) || 0) + 1);
    });
    
    // Generate data for every day in the period using date-fns
    const days = eachDayOfInterval({ start: periodStart, end: periodEnd });
    let cumulativeCount = 0;
    
    const dailyData = days.map(day => {
      const dateStr = format(day, 'yyyy-MM-dd');
      const sessionsToday = sessionsByDay.get(dateStr) || 0;
      cumulativeCount += sessionsToday;
      
      return {
        date: day.toISOString(),
        sessions: cumulativeCount,
      };
    });
    
    return dailyData;
  }, [ccusageData, periodStart, periodEnd]);

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

  const getOrdinalSuffix = (day: number) => {
    if (day > 3 && day < 21) return 'th';
    switch (day % 10) {
      case 1: return 'st';
      case 2: return 'nd';
      case 3: return 'rd';
      default: return 'th';
    }
  };


  if (loading && !ccusageData) {
    return (
      <div className="flex items-center justify-center h-full">
        <p>Loading sessions data...</p>
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
          <h1 className="text-3xl font-bold tracking-tight">Sessions</h1>
          <p className="text-muted-foreground">View your Claude Code usage sessions</p>
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

      <div className="grid gap-4 md:grid-cols-2">
        <SessionsUsageCard blocksData={ccusageData} />

        <StatCard
          title="Usage Rate"
          description="Sessions per day average"
          icon={<TrendingUp className="h-4 w-4 text-muted-foreground" />}
        >
          <div className="text-2xl font-bold">
            {averageSessionsPerDay.toFixed(1)}
          </div>
          <p className="text-xs text-muted-foreground mt-1">
            Projected: {projectedTotalSessions} sessions total
          </p>
        </StatCard>
      </div>

      {willExceedLimit && (
        <Alert variant="destructive">
          <AlertCircle className="h-4 w-4" />
          <AlertDescription>
            At your current usage rate, you're projected to use {projectedTotalSessions} sessions 
            by the end of this billing period, exceeding your {SESSIONS_PER_PERIOD} session limit.
          </AlertDescription>
        </Alert>
      )}

      <Card>
        <CardHeader>
          <CardTitle>Session Usage - Current Billing Period</CardTitle>
          <CardDescription>
            {format(periodStart, 'MM/dd/yyyy')} - {format(periodEnd, 'MM/dd/yyyy')} • Resets on the {billingDate}{getOrdinalSuffix(billingDate)} of each month
          </CardDescription>
        </CardHeader>
        <CardContent>
          {chartData.length > 0 ? (
            <ChartContainer config={chartConfig} className="h-[200px] w-full">
              <AreaChart
                accessibilityLayer
                data={chartData}
                margin={{
                  left: 12,
                  right: 12,
                  top: 12,
                  bottom: 12,
                }}
              >
                <CartesianGrid vertical={false} />
                <XAxis
                  dataKey="date"
                  tickLine={false}
                  axisLine={false}
                  tickMargin={8}
                  interval="preserveStartEnd"
                  minTickGap={50}
                  tickFormatter={(value) => {
                    return format(parseISO(value), "MMM d");
                  }}
                />
                <YAxis
                  tickLine={false}
                  axisLine={false}
                  domain={[0, SESSIONS_PER_PERIOD]}
                  ticks={[0, 10, 20, 30, 40, 50]}
                />
                <ChartTooltip
                  cursor={false}
                  content={<ChartTooltipContent hideLabel />}
                />
                <defs>
                  <linearGradient id="blockGradient" x1="0" y1="0" x2="0" y2="1">
                    <stop offset="5%" stopColor="var(--color-sessions)" stopOpacity={0.4}/>
                    <stop offset="95%" stopColor="var(--color-sessions)" stopOpacity={0.1}/>
                  </linearGradient>
                </defs>
                <Area
                  dataKey="sessions"
                  type="stepAfter"
                  fill="var(--color-sessions)"
                  fillOpacity={0.3}
                  stroke="var(--color-sessions)"
                  strokeWidth={2}
                />
                {/* Add a reference line for today */}
                <ReferenceLine 
                  x={new Date().toISOString()} 
                  stroke="var(--muted-foreground)" 
                  strokeDasharray="3 3"
                  opacity={0.5}
                />
              </AreaChart>
            </ChartContainer>
          ) : (
            <div className="h-[200px] flex items-center justify-center text-muted-foreground">
              No data available for this period
            </div>
          )}
        </CardContent>
      </Card>
    </div>
  );
}