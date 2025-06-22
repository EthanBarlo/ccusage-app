import React, { useMemo } from "react";
import { Progress } from "@/components/ui/progress";
import { Package } from "lucide-react";
import { parseISO, addMonths, subMonths } from "date-fns";
import { StatCard } from "./StatCard";

const SESSIONS_PER_PERIOD = 50;
const BILLING_DATE_KEY = "billing_date";

interface SessionsUsageCardProps {
  blocksData: any;
}

export function SessionsUsageCard({ blocksData }: SessionsUsageCardProps) {
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

  // Calculate sessions used in current billing period
  const sessionsInCurrentPeriod = useMemo(() => {
    if (!blocksData?.blocks) return 0;
    
    return blocksData.blocks.filter((block: any) => {
      if (block.isGap) return false;
      const blockDate = parseISO(block.startTime);
      return blockDate >= periodStart && blockDate < periodEnd;
    }).length;
  }, [blocksData, periodStart, periodEnd]);

  const sessionsRemaining = SESSIONS_PER_PERIOD - sessionsInCurrentPeriod;
  const sessionsUsagePercentage = (sessionsInCurrentPeriod / SESSIONS_PER_PERIOD) * 100;

  return (
    <StatCard
      title="Sessions Used"
      description={`${sessionsRemaining} sessions remaining`}
      icon={<Package className="h-4 w-4 text-muted-foreground" />}
    >
      <div className="text-2xl font-bold">
        {sessionsInCurrentPeriod} / {SESSIONS_PER_PERIOD}
      </div>
      <Progress value={sessionsUsagePercentage} className="mt-2 mb-1" />
    </StatCard>
  );
}