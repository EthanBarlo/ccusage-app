import { useState, useCallback } from "react";

export function useCcusage() {
  const [data, setData] = useState<any>(null);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const runCommand = useCallback(async (command: string) => {
    setLoading(true);
    setError(null);
    
    try {
      const result = await window.ccusageApi.runCommand(command);
      setData(result);
      return result;
    } catch (err) {
      const errorMessage = err instanceof Error ? err.message : "Unknown error";
      setError(errorMessage);
      throw err;
    } finally {
      setLoading(false);
    }
  }, []);

  return {
    data,
    loading,
    error,
    runCommand,
  };
}