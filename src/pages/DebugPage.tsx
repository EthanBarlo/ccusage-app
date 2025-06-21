import React, { useEffect } from "react";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { useCcusage } from "@/renderer/hooks/useCcusage";

export default function DebugPage() {
  const { data: ccusageData, loading, error, runCommand } = useCcusage();

  useEffect(() => {
    // Fetch initial data
    runCommand("daily");
  }, [runCommand]);

  return (
    <>
      {/* ccusage Data Display */}
      <div className="mt-6 px-4 lg:px-6">
        <Card>
          <CardHeader>
            <CardTitle>Debug: Raw ccusage Data</CardTitle>
            <div className="flex gap-2">
              <Button
                onClick={() => runCommand("daily")}
                disabled={loading}
                size="sm"
              >
                Daily
              </Button>
              <Button
                onClick={() => runCommand("monthly")}
                disabled={loading}
                size="sm"
              >
                Monthly
              </Button>
              <Button
                onClick={() => runCommand("session")}
                disabled={loading}
                size="sm"
              >
                Session
              </Button>
              <Button
                onClick={() => runCommand("blocks")}
                disabled={loading}
                size="sm"
              >
                Blocks
              </Button>
            </div>
          </CardHeader>
          <CardContent>
            {loading && <p>Loading...</p>}
            {error && <p className="text-red-500">Error: {error}</p>}
            {ccusageData && (
              <pre className="bg-muted max-h-96 overflow-auto rounded-md p-4">
                {JSON.stringify(ccusageData, null, 2)}
              </pre>
            )}
          </CardContent>
        </Card>
      </div>
    </>
  );
}