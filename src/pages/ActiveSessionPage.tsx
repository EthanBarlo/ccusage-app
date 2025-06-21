import React, { useEffect, useMemo, useState } from "react";
import { useCcusage } from "@/renderer/hooks/useCcusage";
import { Button } from "@/components/ui/button";
import {
  RefreshCw,
  Clock,
  TrendingUp,
  DollarSign,
  Zap,
  AlertCircle,
} from "lucide-react";
import { StatCard } from "@/renderer/components/StatCard";
import { Alert, AlertDescription } from "@/components/ui/alert";
import { Progress } from "@/components/ui/progress";

export default function ActiveSessionPage() {
  const {
    data: blocksData,
    loading,
    error,
    runCommand,
    refresh,
  } = useCcusage({ autoRefresh: false });

  const [timeRemaining, setTimeRemaining] = useState<string>("");

  useEffect(() => {
    runCommand("blocks --active");
    
    // Set up auto-refresh every 15 seconds
    const refreshInterval = setInterval(() => {
      runCommand("blocks --active");
    }, 15000);
    
    return () => clearInterval(refreshInterval);
  }, [runCommand]);

  const activeBlock = useMemo(() => {
    if (!blocksData?.blocks) return null;
    return blocksData.blocks.find((block: any) => block.isActive);
  }, [blocksData]);

  // Update countdown timer
  useEffect(() => {
    if (!activeBlock) return;

    const updateTimer = () => {
      const now = new Date();
      const endTime = new Date(activeBlock.endTime);
      const diff = endTime.getTime() - now.getTime();

      if (diff <= 0) {
        setTimeRemaining("Session ended");
        return;
      }

      const hours = Math.floor(diff / (1000 * 60 * 60));
      const minutes = Math.floor((diff % (1000 * 60 * 60)) / (1000 * 60));
      const seconds = Math.floor((diff % (1000 * 60)) / 1000);

      setTimeRemaining(`${hours}h ${minutes}m ${seconds}s`);
    };

    updateTimer();
    const interval = setInterval(updateTimer, 1000);

    return () => clearInterval(interval);
  }, [activeBlock]);

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

  const formatTime = (dateString: string) => {
    const date = new Date(dateString);
    return date.toLocaleTimeString("en-US", {
      hour: "numeric",
      minute: "2-digit",
      hour12: true,
    });
  };

  const formatRate = (value: number) => {
    return value.toFixed(2);
  };

  // Calculate progress percentage
  const progressPercentage = useMemo(() => {
    if (!activeBlock || !activeBlock.projection) return 0;
    const elapsed = activeBlock.projection.remainingMinutes
      ? ((300 - activeBlock.projection.remainingMinutes) / 300) * 100
      : 100;
    return Math.min(100, Math.max(0, elapsed));
  }, [activeBlock]);

  if (loading) {
    return (
      <div className="flex h-full items-center justify-center">
        <p>Loading active session data...</p>
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

  if (!activeBlock) {
    return (
      <div className="space-y-6">
        <div className="flex items-center justify-between">
          <div>
            <h1 className="text-3xl font-bold tracking-tight">
              Active Session
            </h1>
            <p className="text-muted-foreground">
              Monitor your current Claude Code session
            </p>
          </div>
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

        <Alert>
          <AlertCircle className="h-4 w-4" />
          <AlertDescription>
            No active session found. Start using Claude Code to begin a new
            session.
          </AlertDescription>
        </Alert>
      </div>
    );
  }

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-3xl font-bold tracking-tight">Active Session</h1>
          <p className="text-muted-foreground">
            Started at {formatTime(activeBlock.startTime)}
          </p>
        </div>
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

      {/* Session Progress */}
      <div className="space-y-2">
        <div className="flex justify-between text-sm">
          <span>Session Progress</span>
          <span>{timeRemaining}</span>
        </div>
        <Progress value={progressPercentage} className="h-3" />
        <div className="text-muted-foreground flex justify-between text-xs">
          <span>{formatTime(activeBlock.startTime)}</span>
          <span>{formatTime(activeBlock.endTime)}</span>
        </div>
      </div>

      <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-4">
        {/* Current Cost */}
        <StatCard
          title="Current Cost"
          description="This session so far"
          icon={<DollarSign className="text-muted-foreground h-4 w-4" />}
        >
          <div className="text-2xl font-bold">
            {formatCost(activeBlock.costUSD)}
          </div>
        </StatCard>

        {/* Projected Cost */}
        <StatCard
          title="Projected Cost"
          description="By end of session"
          icon={<TrendingUp className="text-muted-foreground h-4 w-4" />}
        >
          <div className="text-2xl font-bold">
            {activeBlock.projection
              ? formatCost(activeBlock.projection.totalCost)
              : "N/A"}
          </div>
        </StatCard>

        {/* Burn Rate */}
        <StatCard
          title="Burn Rate"
          description="Cost per hour"
          icon={<Zap className="text-muted-foreground h-4 w-4" />}
        >
          <div className="text-2xl font-bold">
            {activeBlock.burnRate
              ? formatCost(activeBlock.burnRate.costPerHour)
              : "N/A"}
          </div>
        </StatCard>

        {/* Time Remaining */}
        <StatCard
          title="Time Remaining"
          description="Until session ends"
          icon={<Clock className="text-muted-foreground h-4 w-4" />}
        >
          <div className="text-2xl font-bold">{timeRemaining}</div>
        </StatCard>
      </div>

      <div className="grid gap-4 md:grid-cols-2">
        {/* Token Usage */}
        <StatCard title="Tokens Used" description="Total tokens this session">
          <div className="space-y-2">
            <div className="text-2xl font-bold">
              {formatTokens(activeBlock.totalTokens)}
            </div>
            <div className="space-y-1 text-sm">
              <div className="flex justify-between">
                <span className="text-muted-foreground">Input:</span>
                <span>{formatTokens(activeBlock.tokenCounts.inputTokens)}</span>
              </div>
              <div className="flex justify-between">
                <span className="text-muted-foreground">Output:</span>
                <span>
                  {formatTokens(activeBlock.tokenCounts.outputTokens)}
                </span>
              </div>
              <div className="flex justify-between">
                <span className="text-muted-foreground">Cache Creation:</span>
                <span>
                  {formatTokens(
                    activeBlock.tokenCounts.cacheCreationInputTokens,
                  )}
                </span>
              </div>
              <div className="flex justify-between">
                <span className="text-muted-foreground">Cache Read:</span>
                <span>
                  {formatTokens(activeBlock.tokenCounts.cacheReadInputTokens)}
                </span>
              </div>
            </div>
          </div>
        </StatCard>

        {/* Projection Details */}
        <StatCard title="Projection" description="Based on current usage rate">
          <div className="space-y-2">
            <div className="text-2xl font-bold">
              {activeBlock.projection
                ? formatTokens(activeBlock.projection.totalTokens)
                : "N/A"}{" "}
              tokens
            </div>
            <div className="space-y-1 text-sm">
              <div className="flex justify-between">
                <span className="text-muted-foreground">Tokens/min:</span>
                <span>
                  {activeBlock.burnRate
                    ? formatRate(activeBlock.burnRate.tokensPerMinute)
                    : "N/A"}
                </span>
              </div>
              <div className="flex justify-between">
                <span className="text-muted-foreground">
                  Minutes remaining:
                </span>
                <span>{activeBlock.projection?.remainingMinutes || "N/A"}</span>
              </div>
              <div className="flex justify-between">
                <span className="text-muted-foreground">Total entries:</span>
                <span>{activeBlock.entries}</span>
              </div>
            </div>
          </div>
        </StatCard>
      </div>

      {/* High burn rate warning */}
      {activeBlock.burnRate && activeBlock.burnRate.costPerHour > 50 && (
        <Alert variant="destructive">
          <AlertCircle className="h-4 w-4" />
          <AlertDescription>
            High burn rate detected! You're currently spending{" "}
            {formatCost(activeBlock.burnRate.costPerHour)} per hour.
          </AlertDescription>
        </Alert>
      )}
    </div>
  );
}
