import React, { useEffect, useMemo } from "react";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { useCcusage } from "@/renderer/hooks/useCcusage";
import { ChartConfig, ChartContainer, ChartTooltip, ChartTooltipContent } from "@/components/ui/chart";
import { Area, AreaChart, CartesianGrid, XAxis, YAxis, ReferenceLine } from "recharts";
import { AlertCircle, TrendingUp, RefreshCw, Database } from "lucide-react";
import { Alert, AlertDescription } from "@/components/ui/alert";
import { Button } from "@/components/ui/button";
import { BlocksUsageCard } from "@/renderer/components/BlocksUsageCard";
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
  blocks: {
    label: "Blocks",
    color: "var(--chart-1)",
  },
} satisfies ChartConfig;

const BLOCKS_PER_PERIOD = 50;
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

  useEffect(() => {
    runCommand("blocks");
  }, [runCommand]);

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

  const currentBlockData = useMemo(() => {
    if (!ccusageData?.blocks) return null;
    // Get the most recent non-gap block
    const nonGapBlocks = ccusageData.blocks.filter((block: any) => !block.isGap);
    if (nonGapBlocks.length > 0) {
      return nonGapBlocks[nonGapBlocks.length - 1];
    }
    return null;
  }, [ccusageData]);

  // Calculate blocks used in current billing period
  const blocksInCurrentPeriod = useMemo(() => {
    if (!ccusageData?.blocks) return 0;
    
    return ccusageData.blocks.filter((block: any) => {
      if (block.isGap) return false;
      const blockDate = parseISO(block.startTime);
      return blockDate >= periodStart && blockDate < periodEnd;
    }).length;
  }, [ccusageData, periodStart, periodEnd]);

  const blocksRemaining = BLOCKS_PER_PERIOD - blocksInCurrentPeriod;
  const blocksUsagePercentage = (blocksInCurrentPeriod / BLOCKS_PER_PERIOD) * 100;

  // Calculate average blocks per day and projection
  const { averageBlocksPerDay, projectedTotalBlocks, willExceedLimit } = useMemo(() => {
    if (!ccusageData?.blocks || blocksInCurrentPeriod === 0) {
      return { averageBlocksPerDay: 0, projectedTotalBlocks: 0, willExceedLimit: false };
    }

    const now = new Date();
    const daysElapsed = Math.max(1, differenceInDays(now, periodStart) + 1);
    const daysInPeriod = differenceInDays(periodEnd, periodStart);
    
    const averageBlocksPerDay = blocksInCurrentPeriod / daysElapsed;
    const projectedTotalBlocks = Math.round(averageBlocksPerDay * daysInPeriod);
    const willExceedLimit = projectedTotalBlocks > BLOCKS_PER_PERIOD;

    return { averageBlocksPerDay, projectedTotalBlocks, willExceedLimit };
  }, [ccusageData, blocksInCurrentPeriod, periodStart, periodEnd]);

  const chartData = useMemo(() => {
    // If no data, return minimal chart data
    if (!ccusageData?.blocks) {
      return [{
        date: periodStart.toISOString(),
        blocks: 0,
      }, {
        date: periodEnd.toISOString(),
        blocks: 0,
      }];
    }
    
    // Get blocks from current billing period
    const periodBlocks = ccusageData.blocks.filter((block: any) => {
      if (block.isGap) return false;
      const blockDate = parseISO(block.startTime);
      return blockDate >= periodStart && blockDate < periodEnd;
    }).sort((a: any, b: any) => parseISO(a.startTime).getTime() - parseISO(b.startTime).getTime());
    
    // Create a map of blocks per day
    const blocksByDay = new Map<string, number>();
    periodBlocks.forEach((block: any) => {
      const date = format(parseISO(block.startTime), 'yyyy-MM-dd');
      blocksByDay.set(date, (blocksByDay.get(date) || 0) + 1);
    });
    
    // Generate data for every day in the period using date-fns
    const days = eachDayOfInterval({ start: periodStart, end: periodEnd });
    let cumulativeCount = 0;
    
    const dailyData = days.map(day => {
      const dateStr = format(day, 'yyyy-MM-dd');
      const blocksToday = blocksByDay.get(dateStr) || 0;
      cumulativeCount += blocksToday;
      
      return {
        date: day.toISOString(),
        blocks: cumulativeCount,
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

  const formatBlockTime = (dateString: string) => {
    return format(parseISO(dateString), "MMM d, h:mm a");
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
      <div className="flex justify-between items-center">
        <div>
          <h1 className="text-3xl font-bold tracking-tight">5-Hour Blocks</h1>
          <p className="text-muted-foreground">View your Claude Code usage in 5-hour billing windows</p>
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
        <BlocksUsageCard blocksData={ccusageData} />

        <StatCard
          title="Usage Rate"
          description="Blocks per day average"
          icon={<TrendingUp className="h-4 w-4 text-muted-foreground" />}
        >
          <div className="text-2xl font-bold">
            {averageBlocksPerDay.toFixed(1)}
          </div>
          <p className="text-xs text-muted-foreground mt-1">
            Projected: {projectedTotalBlocks} blocks total
          </p>
        </StatCard>
      </div>

      {willExceedLimit && (
        <Alert variant="destructive">
          <AlertCircle className="h-4 w-4" />
          <AlertDescription>
            At your current usage rate, you're projected to use {projectedTotalBlocks} blocks 
            by the end of this billing period, exceeding your {BLOCKS_PER_PERIOD} block limit.
          </AlertDescription>
        </Alert>
      )}

      <Card>
        <CardHeader>
          <CardTitle>Block Usage - Current Billing Period</CardTitle>
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
                  domain={[0, BLOCKS_PER_PERIOD]}
                  ticks={[0, 10, 20, 30, 40, 50]}
                />
                <ChartTooltip
                  cursor={false}
                  content={<ChartTooltipContent hideLabel />}
                />
                <defs>
                  <linearGradient id="blockGradient" x1="0" y1="0" x2="0" y2="1">
                    <stop offset="5%" stopColor="var(--color-blocks)" stopOpacity={0.4}/>
                    <stop offset="95%" stopColor="var(--color-blocks)" stopOpacity={0.1}/>
                  </linearGradient>
                </defs>
                <Area
                  dataKey="blocks"
                  type="stepAfter"
                  fill="var(--color-blocks)"
                  fillOpacity={0.3}
                  stroke="var(--color-blocks)"
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