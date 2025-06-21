import React, { useEffect, useMemo, useState } from "react";
import {
  Card,
  CardContent,
  CardDescription,
  CardFooter,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";
import { useCcusage } from "@/renderer/hooks/useCcusage";
import { Alert, AlertDescription } from "@/components/ui/alert";
import {
  Loader2,
  FolderOpen,
  DollarSign,
  Hash,
  RefreshCw,
  Database,
  Pencil,
  Check,
  X,
  Calendar,
  Coins,
} from "lucide-react";
import {
  ChartConfig,
  ChartContainer,
  ChartTooltip,
  ChartTooltipContent,
} from "@/components/ui/chart";
import {
  Bar,
  BarChart,
  CartesianGrid,
  XAxis,
  YAxis,
  LabelList,
} from "recharts";
import { Button } from "@/components/ui/button";
import { StatCard } from "@/renderer/components/StatCard";
import { Input } from "@/components/ui/input";
import { sessionNames } from "@/renderer/lib/sessionNames";
import { formatDistanceToNow, parseISO } from "date-fns";

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
    cacheAge,
  } = useCcusage({ autoRefresh: true });

  const [editingSession, setEditingSession] = useState<string | null>(null);
  const [editingName, setEditingName] = useState("");

  useEffect(() => {
    runCommand("session");
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

  // Sort sessions by last activity for the cards view
  const sortedSessions = useMemo(() => {
    if (!ccusageData?.sessions) return [];

    return [...ccusageData.sessions].sort((a: any, b: any) => {
      // Sort by lastActivity date in descending order (most recent first)
      return (
        new Date(b.lastActivity).getTime() - new Date(a.lastActivity).getTime()
      );
    });
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
      setEditingName("");
      // Force re-render
      runCommand("session");
    }
  };

  const cancelEdit = () => {
    setEditingSession(null);
    setEditingName("");
  };

  const handleKeyPress = (e: React.KeyboardEvent) => {
    if (e.key === "Enter") {
      saveEdit();
    } else if (e.key === "Escape") {
      cancelEdit();
    }
  };

  if (loading && !ccusageData) {
    return (
      <div className="flex h-full items-center justify-center">
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
          <AlertDescription>
            Error loading session data: {error}
          </AlertDescription>
        </Alert>
      </div>
    );
  }

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-3xl font-bold tracking-tight">Projects</h1>
          <p className="text-muted-foreground">Usage breakdown by project</p>
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
          <div className="flex items-center justify-between">
            <div>
              <CardTitle>All Projects</CardTitle>
              <CardDescription>
                Detailed breakdown of all projects
              </CardDescription>
            </div>
            <div className="text-muted-foreground text-sm">
              {ccusageData?.sessions?.length || 0} projects
            </div>
          </div>
        </CardHeader>
        <CardContent>
          <div className="grid grid-cols-1 gap-4 md:grid-cols-2 xl:grid-cols-3">
            {sortedSessions.map((session: any, index: number) => {
              const displayName = sessionNames.getDisplayName(
                session.sessionId,
              );
              const isEditing = editingSession === session.sessionId;

              return (
                <Card
                  key={index}
                  className="group relative gap-0 overflow-hidden"
                >
                  <CardHeader>
                    <div className="flex items-start justify-between gap-2">
                      {isEditing ? (
                        <div className="flex flex-1 items-center gap-2">
                          <Input
                            value={editingName}
                            onChange={(e) => setEditingName(e.target.value)}
                            onKeyDown={handleKeyPress}
                            className="h-8 text-sm font-semibold"
                            autoFocus
                          />
                          <Button
                            size="sm"
                            variant="ghost"
                            onClick={saveEdit}
                            className="h-8 w-8 p-0"
                          >
                            <Check className="h-4 w-4" />
                          </Button>
                          <Button
                            size="sm"
                            variant="ghost"
                            onClick={cancelEdit}
                            className="h-8 w-8 p-0"
                          >
                            <X className="h-4 w-4" />
                          </Button>
                        </div>
                      ) : (
                        <>
                          <h3 className="flex-1 text-lg leading-none font-semibold tracking-tight">
                            {displayName}
                          </h3>
                          <Button
                            size="sm"
                            variant="ghost"
                            onClick={() => startEditing(session.sessionId)}
                            className="h-8 w-8 -translate-y-2 p-0 opacity-0 transition-opacity group-hover:opacity-100"
                          >
                            <Pencil className="h-4 w-4" />
                          </Button>
                        </>
                      )}
                    </div>
                  </CardHeader>
                  <CardContent>
                    <div>
                      <div className="flex items-center justify-between">
                        <div className="text-muted-foreground flex items-center gap-2 text-sm">
                          <DollarSign className="h-4 w-4" />
                          <span>Cost</span>
                        </div>
                        <span className="font-semibold">
                          {formatCost(session.totalCost)}
                        </span>
                      </div>

                      <div className="flex items-center justify-between">
                        <div className="text-muted-foreground flex items-center gap-2 text-sm">
                          <Coins className="h-4 w-4" />
                          <span>Tokens</span>
                        </div>
                        <span className="font-semibold">
                          {formatTokens(session.totalTokens)}
                        </span>
                      </div>

                      <div className="flex items-center justify-between">
                        <div className="text-muted-foreground flex items-center gap-2 text-sm">
                          <Calendar className="h-4 w-4" />
                          <span>Last used</span>
                        </div>
                        <span className="text-sm">
                          {(() => {
                            const date = parseISO(session.lastActivity);
                            const now = new Date();
                            const diffInDays = Math.floor(
                              (now.getTime() - date.getTime()) /
                                (1000 * 60 * 60 * 24),
                            );

                            if (diffInDays === 0) {
                              return "Today";
                            } else if (diffInDays === 1) {
                              return "Yesterday";
                            } else {
                              return formatDistanceToNow(date, {
                                addSuffix: true,
                              });
                            }
                          })()}
                        </span>
                      </div>
                    </div>
                  </CardContent>
                  <CardFooter className="pt-2">
                    <p
                      className="text-muted-foreground truncate text-xs"
                      title={session.sessionId}
                    >
                      {session.sessionId}
                    </p>
                  </CardFooter>
                </Card>
              );
            })}
          </div>
        </CardContent>
      </Card>
    </div>
  );
}
