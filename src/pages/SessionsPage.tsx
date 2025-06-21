import React, { useEffect, useMemo } from 'react';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { useCcusage } from '@/renderer/hooks/useCcusage';
import { Alert, AlertDescription } from '@/components/ui/alert';
import { Loader2, FolderOpen, DollarSign, Hash } from 'lucide-react';
import { ChartConfig, ChartContainer, ChartTooltip, ChartTooltipContent } from '@/components/ui/chart';
import { Bar, BarChart, CartesianGrid, XAxis, YAxis, LabelList } from 'recharts';

const chartConfig = {
  cost: {
    label: "Cost",
    color: "var(--chart-1)",
  },
} satisfies ChartConfig;

export function SessionsPage() {
  const { data: ccusageData, loading, error, runCommand } = useCcusage();

  useEffect(() => {
    runCommand('session');
  }, [runCommand]);

  const chartData = useMemo(() => {
    if (!ccusageData?.sessions) return [];
    
    return ccusageData.sessions
      .map((session: any) => {
        // Extract project name from sessionId
        const pathParts = session.sessionId.split('-');
        const projectName = pathParts[pathParts.length - 1] || 'Unknown';
        
        return {
          project: projectName,
          cost: session.totalCost,
          fullPath: session.sessionId,
          lastActivity: session.lastActivity,
        };
      })
      .sort((a: any, b: any) => b.cost - a.cost) // Sort by cost descending
      .slice(0, 10); // Show top 10 projects
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
        <div className="flex items-center space-x-2">
          <Loader2 className="h-6 w-6 animate-spin" />
          <p>Loading session data...</p>
        </div>
      </div>
    );
  }

  if (error) {
    return (
      <div className="container mx-auto p-6">
        <Alert variant="destructive">
          <AlertDescription>Error loading session data: {error}</AlertDescription>
        </Alert>
      </div>
    );
  }

  return (
    <div className="space-y-6">
      <div>
        <h1 className="text-3xl font-bold tracking-tight">Sessions</h1>
        <p className="text-muted-foreground">Usage breakdown by project</p>
      </div>

      <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-3">
        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Total Projects</CardTitle>
            <FolderOpen className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">
              {ccusageData?.sessions?.length || 0}
            </div>
            <p className="text-xs text-muted-foreground">
              Active project sessions
            </p>
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Total Cost</CardTitle>
            <DollarSign className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">
              {ccusageData?.totals ? formatCost(ccusageData.totals.totalCost) : '$0.00'}
            </div>
            <p className="text-xs text-muted-foreground">
              Across all projects
            </p>
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Total Tokens</CardTitle>
            <Hash className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">
              {ccusageData?.totals ? formatTokens(ccusageData.totals.totalTokens) : '0'}
            </div>
            <p className="text-xs text-muted-foreground">
              All token types combined
            </p>
          </CardContent>
        </Card>
      </div>

      <Card>
        <CardHeader>
          <CardTitle>Cost by Project</CardTitle>
          <CardDescription>Top 10 projects by total cost</CardDescription>
        </CardHeader>
        <CardContent>
          <ChartContainer config={chartConfig}>
            <BarChart
              accessibilityLayer
              data={chartData}
              layout="vertical"
              margin={{
                right: 30,
              }}
            >
              <CartesianGrid horizontal={false} />
              <YAxis
                dataKey="project"
                type="category"
                tickLine={false}
                tickMargin={10}
                axisLine={false}
                tickFormatter={(value) => value}
                hide
              />
              <XAxis dataKey="cost" type="number" hide />
              <ChartTooltip
                cursor={false}
                content={<ChartTooltipContent indicator="line" />}
              />
              <Bar
                dataKey="cost"
                layout="vertical"
                fill="var(--color-cost)"
                radius={4}
              >
                <LabelList
                  dataKey="project"
                  position="insideLeft"
                  offset={8}
                  className="fill-white"
                  fontSize={12}
                />
                <LabelList
                  dataKey="cost"
                  position="right"
                  offset={8}
                  className="fill-foreground"
                  fontSize={12}
                  formatter={(value: number) => formatCost(value)}
                />
              </Bar>
            </BarChart>
          </ChartContainer>
        </CardContent>
      </Card>

      <Card>
        <CardHeader>
          <CardTitle>All Sessions</CardTitle>
          <CardDescription>Detailed breakdown of all project sessions</CardDescription>
        </CardHeader>
        <CardContent>
          <div className="space-y-4">
            {ccusageData?.sessions?.map((session: any, index: number) => {
              const pathParts = session.sessionId.split('-');
              const projectName = pathParts[pathParts.length - 1] || 'Unknown';
              
              return (
                <div key={index} className="flex items-center justify-between border-b pb-4 last:border-0">
                  <div className="space-y-1">
                    <p className="text-sm font-medium">{projectName}</p>
                    <p className="text-xs text-muted-foreground">{session.sessionId}</p>
                    <div className="flex gap-4 text-xs text-muted-foreground">
                      <span>Last active: {session.lastActivity}</span>
                      <span>Models: {session.modelsUsed.join(', ')}</span>
                    </div>
                  </div>
                  <div className="text-right">
                    <p className="text-sm font-medium">{formatCost(session.totalCost)}</p>
                    <p className="text-xs text-muted-foreground">{formatTokens(session.totalTokens)} tokens</p>
                  </div>
                </div>
              );
            })}
          </div>
        </CardContent>
      </Card>
    </div>
  );
}