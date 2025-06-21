import { useState, useCallback, useEffect } from "react";
import { dataManager } from "@/renderer/lib/dataManager";

type CommandType = 'daily' | 'monthly' | 'session' | 'blocks';

interface UseCcusageOptions {
  autoRefresh?: boolean;
  refreshInterval?: number;
  ttl?: number;
}

export function useCcusage(options: UseCcusageOptions = {}) {
  const {
    autoRefresh = false,
    refreshInterval = 5 * 60 * 1000, // 5 minutes
    ttl = 5 * 60 * 1000, // 5 minutes cache TTL
  } = options;

  const [data, setData] = useState<any>(null);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [fromCache, setFromCache] = useState(false);
  const [cacheAge, setCacheAge] = useState<string>('');
  const [currentCommand, setCurrentCommand] = useState<CommandType | null>(null);

  const runCommand = useCallback(async (command: string, forceRefresh = false) => {
    // Extract base command from the full command
    const commandParts = command.split(' ');
    const baseCommand = commandParts[0];
    const commandType = baseCommand as CommandType;

    setLoading(true);
    setError(null);
    setCurrentCommand(commandType);
    
    try {
      // Check if this is a special command that bypasses cache (like blocks --active)
      const shouldBypassCache = command.includes('--active') || command.includes('-a');
      
      if (shouldBypassCache) {
        // For active blocks, always fetch fresh data directly
        const freshData = await window.ccusageApi.runCommand(command);
        console.log(`useCcusage: ${command} data:`, freshData);
        setData(freshData);
        setFromCache(false);
        setCacheAge('');
        return freshData;
      }
      
      // For regular commands, use the data manager with caching
      const result = await dataManager.getData(commandType, { 
        force: forceRefresh,
        ttl 
      });
      
      console.log(`useCcusage: ${command} data:`, result.data);
      setData(result.data);
      setFromCache(result.fromCache);
      
      // Format cache age
      if (result.age !== null) {
        const status = dataManager.getCacheStatus(commandType, ttl);
        setCacheAge(status.ageFormatted);
      } else {
        setCacheAge('');
      }
      
      if (result.error && !result.data) {
        setError(result.error);
      }
      
      return result.data;
    } catch (err) {
      const errorMessage = err instanceof Error ? err.message : "Unknown error";
      setError(errorMessage);
      throw err;
    } finally {
      setLoading(false);
    }
  }, [ttl]);

  const refresh = useCallback(async () => {
    if (currentCommand) {
      return runCommand(currentCommand, true);
    }
  }, [currentCommand, runCommand]);

  // Set up auto-refresh if enabled
  useEffect(() => {
    if (autoRefresh && currentCommand) {
      dataManager.startBackgroundRefresh(currentCommand, refreshInterval);
      
      return () => {
        dataManager.stopBackgroundRefresh(currentCommand);
      };
    }
  }, [autoRefresh, currentCommand, refreshInterval]);

  // Clean up on unmount
  useEffect(() => {
    return () => {
      if (currentCommand) {
        dataManager.stopBackgroundRefresh(currentCommand);
      }
    };
  }, []);

  return {
    data,
    loading,
    error,
    runCommand,
    refresh,
    fromCache,
    cacheAge,
  };
}