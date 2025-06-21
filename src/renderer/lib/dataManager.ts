import { storage } from './storage';

interface RefreshOptions {
  force?: boolean;
  ttl?: number;
}

interface DataResult<T> {
  data: T | null;
  fromCache: boolean;
  age: number | null;
  loading: boolean;
  error: string | null;
}

// Identifier keys for each command type
const IDENTIFIER_KEYS = {
  daily: 'date',
  monthly: 'month',
  session: 'sessionId',
  blocks: 'id',
} as const;

type CommandType = keyof typeof IDENTIFIER_KEYS;

export class DataManager {
  private static instance: DataManager;
  private refreshTimers: Map<CommandType, NodeJS.Timeout> = new Map();
  private loadingStates: Map<CommandType, boolean> = new Map();

  private constructor() {}

  static getInstance(): DataManager {
    if (!DataManager.instance) {
      DataManager.instance = new DataManager();
    }
    return DataManager.instance;
  }

  /**
   * Get data for a command, using cache if available
   */
  async getData<T>(
    command: CommandType,
    options: RefreshOptions = {}
  ): Promise<DataResult<T>> {
    const { force = false, ttl = 5 * 60 * 1000 } = options;

    // Check if we're currently loading this data
    if (!force && this.loadingStates.get(command)) {
      // Wait a bit and return cached data if available
      const cached = storage.get(command, Infinity);
      return {
        data: cached as T,
        fromCache: true,
        age: storage.getAge(command),
        loading: true,
        error: null,
      };
    }

    // Check cache first
    if (!force) {
      const cached = storage.get(command, ttl);
      if (cached !== null) {
        console.log(`DataManager: Using cached data for ${command}:`, cached);
        return {
          data: cached as T,
          fromCache: true,
          age: storage.getAge(command),
          loading: false,
          error: null,
        };
      }
    }

    // Fetch fresh data
    try {
      this.loadingStates.set(command, true);
      const freshData = await this.fetchFreshData(command);
      
      console.log(`DataManager: Fetched fresh data for ${command}:`, freshData);
      
      // For daily command, if we get an array directly, wrap it in the expected structure
      let dataToStore = freshData;
      if (command === 'daily' && Array.isArray(freshData)) {
        dataToStore = { daily: freshData };
      } else if (command === 'monthly' && Array.isArray(freshData)) {
        dataToStore = { monthly: freshData };
      } else if (command === 'session' && Array.isArray(freshData)) {
        dataToStore = { sessions: freshData };
      } else if (command === 'blocks' && Array.isArray(freshData)) {
        dataToStore = { blocks: freshData };
      }
      
      // Store the full response object in cache
      storage.set(command, dataToStore);

      return {
        data: dataToStore as T,
        fromCache: false,
        age: 0,
        loading: false,
        error: null,
      };
    } catch (error) {
      // If fetch fails, try to return stale cache
      const staleData = storage.get(command, Infinity);
      return {
        data: staleData as T,
        fromCache: true,
        age: storage.getAge(command),
        loading: false,
        error: error instanceof Error ? error.message : 'Unknown error',
      };
    } finally {
      this.loadingStates.set(command, false);
    }
  }

  /**
   * Fetch fresh data from ccusage
   */
  private async fetchFreshData(command: CommandType): Promise<any> {
    const result = await window.ccusageApi.runCommand(command);
    return result;
  }

  /**
   * Start background refresh for a command
   */
  startBackgroundRefresh(
    command: CommandType,
    intervalMs: number = 5 * 60 * 1000 // 5 minutes
  ): void {
    // Clear existing timer
    this.stopBackgroundRefresh(command);

    // Set up new timer
    const timer = setInterval(async () => {
      try {
        await this.getData(command, { force: true });
      } catch (error) {
        console.error(`Background refresh failed for ${command}:`, error);
      }
    }, intervalMs);

    this.refreshTimers.set(command, timer);
  }

  /**
   * Stop background refresh for a command
   */
  stopBackgroundRefresh(command: CommandType): void {
    const timer = this.refreshTimers.get(command);
    if (timer) {
      clearInterval(timer);
      this.refreshTimers.delete(command);
    }
  }

  /**
   * Stop all background refreshes
   */
  stopAllBackgroundRefreshes(): void {
    this.refreshTimers.forEach((timer) => clearInterval(timer));
    this.refreshTimers.clear();
  }

  /**
   * Manually refresh data for a command
   */
  async refresh(command: CommandType): Promise<DataResult<any>> {
    return this.getData(command, { force: true });
  }

  /**
   * Clear cache for a command or all commands
   */
  clearCache(command?: CommandType): void {
    storage.clear(command);
  }

  /**
   * Get cache status for a command
   */
  getCacheStatus(command: CommandType, ttl: number = 5 * 60 * 1000): {
    hasCache: boolean;
    isValid: boolean;
    age: number | null;
    ageFormatted: string;
  } {
    const age = storage.getAge(command);
    const hasCache = age !== null;
    const isValid = storage.isValid(command, ttl);

    let ageFormatted = 'No cache';
    if (age !== null) {
      const seconds = Math.floor(age / 1000);
      const minutes = Math.floor(seconds / 60);
      const hours = Math.floor(minutes / 60);

      if (hours > 0) {
        ageFormatted = `${hours}h ${minutes % 60}m ago`;
      } else if (minutes > 0) {
        ageFormatted = `${minutes}m ${seconds % 60}s ago`;
      } else {
        ageFormatted = `${seconds}s ago`;
      }
    }

    return {
      hasCache,
      isValid,
      age,
      ageFormatted,
    };
  }
}

export const dataManager = DataManager.getInstance();