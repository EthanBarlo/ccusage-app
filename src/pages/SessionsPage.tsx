import React, { useEffect, useMemo, useState } from 'react';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { useCcusage } from '@/renderer/hooks/useCcusage';
import { Alert, AlertDescription } from '@/components/ui/alert';
import { Loader2, FolderOpen, DollarSign, Hash, RefreshCw, Database, Pencil, Check, X } from 'lucide-react';
import { ChartConfig, ChartContainer, ChartTooltip, ChartTooltipContent } from '@/components/ui/chart';
import { Bar, BarChart, CartesianGrid, XAxis, YAxis, LabelList } from 'recharts';
import { Button } from '@/components/ui/button';
import { StatCard } from '@/renderer/components/StatCard';
import { Input } from '@/components/ui/input';
import { sessionNames } from '@/renderer/lib/sessionNames';

const chartConfig = {
  cost: {
    label: "Cost",
    color: "var(--chart-1)",
  },
} satisfies ChartConfig;

export function SessionsPage() {
  const { 
    data: ccusageData, 
    loading, 
    error, 
    runCommand,
    refresh,
    fromCache,
    cacheAge
  } = useCcusage({ autoRefresh: true });

  const [editingSession, setEditingSession] = useState<string | null>(null);
  const [editingName, setEditingName] = useState('');

  useEffect(() => {
    runCommand('session');
  }, [runCommand]);

  const chartData = useMemo(() => {
    if (!ccusageData?.sessions) return [];
    
    return ccusageData.sessions
      .map((session: any) => {
        const projectName = sessionNames.getDisplayName(session.sessionId);
        
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

  const startEditing = (sessionId: string) => {
    const currentName = sessionNames.getDisplayName(sessionId);
    setEditingSession(sessionId);
    setEditingName(currentName);
  };

  const saveEdit = () => {
    if (editingSession && editingName.trim()) {
      sessionNames.setName(editingSession, editingName);
      setEditingSession(null);
      setEditingName('');
      // Force re-render
      runCommand('session');
    }
  };

  const cancelEdit = () => {
    setEditingSession(null);
    setEditingName('');
  };

  const handleKeyPress = (e: React.KeyboardEvent) => {
    if (e.key === 'Enter') {
      saveEdit();
    } else if (e.key === 'Escape') {
      cancelEdit();
    }
  };

  if (loading && !ccusageData) {
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
      <div className="flex justify-between items-center">
        <div>
          <h1 className="text-3xl font-bold tracking-tight">Sessions</h1>
          <p className="text-muted-foreground">Usage breakdown by project</p>
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
          title="Total Projects"
          description="Active project sessions"
          icon={<FolderOpen className="h-4 w-4 text-muted-foreground" />}
        >
          <div className="text-2xl font-bold">
            {ccusageData?.sessions?.length || 0}
          </div>
        </StatCard>

        <StatCard
          title="Total Cost"
          description="Across all projects"
          icon={<DollarSign className="h-4 w-4 text-muted-foreground" />}
        >
          <div className="text-2xl font-bold">
            {ccusageData?.totals ? formatCost(ccusageData.totals.totalCost) : '$0.00'}
          </div>
        </StatCard>

        <StatCard
          title="Total Tokens"
          description="All token types combined"
          icon={<Hash className="h-4 w-4 text-muted-foreground" />}
        >
          <div className="text-2xl font-bold">
            {ccusageData?.totals ? formatTokens(ccusageData.totals.totalTokens) : '0'}
          </div>
        </StatCard>
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
              const displayName = sessionNames.getDisplayName(session.sessionId);
              const isEditing = editingSession === session.sessionId;
              
              return (
                <div key={index} className="flex items-center justify-between border-b pb-4 last:border-0 group">
                  <div className="space-y-1 flex-1">
                    <div className="flex items-center gap-2">
                      {isEditing ? (
                        <>
                          <Input
                            value={editingName}
                            onChange={(e) => setEditingName(e.target.value)}
                            onKeyDown={handleKeyPress}
                            className="h-6 text-sm font-medium max-w-xs"
                            autoFocus
                          />
                          <Button
                            size="sm"
                            variant="ghost"
                            onClick={saveEdit}
                            className="h-6 w-6 p-0"
                          >
                            <Check className="h-3 w-3" />
                          </Button>
                          <Button
                            size="sm"
                            variant="ghost"
                            onClick={cancelEdit}
                            className="h-6 w-6 p-0"
                          >
                            <X className="h-3 w-3" />
                          </Button>
                        </>
                      ) : (
                        <>
                          <p className="text-sm font-medium">{displayName}</p>
                          <Button
                            size="sm"
                            variant="ghost"
                            onClick={() => startEditing(session.sessionId)}
                            className="h-6 w-6 p-0 opacity-0 group-hover:opacity-100 transition-opacity"
                          >
                            <Pencil className="h-3 w-3" />
                          </Button>
                        </>
                      )}
                    </div>
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