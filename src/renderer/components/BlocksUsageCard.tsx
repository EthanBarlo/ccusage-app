import React, { useMemo } from "react";
import { Progress } from "@/components/ui/progress";
import { Package } from "lucide-react";
import { parseISO, differenceInDays, addMonths, subMonths } from "date-fns";
import { StatCard } from "./StatCard";

const BLOCKS_PER_PERIOD = 50;
const BILLING_DATE_KEY = "billing_date";

interface BlocksUsageCardProps {
  blocksData: any;
}

export function BlocksUsageCard({ blocksData }: BlocksUsageCardProps) {
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

  // Calculate blocks used in current billing period
  const blocksInCurrentPeriod = useMemo(() => {
    if (!blocksData?.blocks) return 0;
    
    return blocksData.blocks.filter((block: any) => {
      if (block.isGap) return false;
      const blockDate = parseISO(block.startTime);
      return blockDate >= periodStart && blockDate < periodEnd;
    }).length;
  }, [blocksData, periodStart, periodEnd]);

  const blocksRemaining = BLOCKS_PER_PERIOD - blocksInCurrentPeriod;
  const blocksUsagePercentage = (blocksInCurrentPeriod / BLOCKS_PER_PERIOD) * 100;

  return (
    <StatCard
      title="Blocks Used"
      description={`${blocksRemaining} blocks remaining`}
      icon={<Package className="h-4 w-4 text-muted-foreground" />}
    >
      <div className="text-2xl font-bold">
        {blocksInCurrentPeriod} / {BLOCKS_PER_PERIOD}
      </div>
      <Progress value={blocksUsagePercentage} className="mt-2 mb-1" />
    </StatCard>
  );
}