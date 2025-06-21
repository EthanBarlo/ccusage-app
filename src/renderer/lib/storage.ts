interface CacheEntry<T> {
  data: T;
  timestamp: number;
  identifier?: string;
}

interface StorageSchema {
  daily: CacheEntry<any>;
  monthly: CacheEntry<any>;
  session: CacheEntry<any>;
  blocks: CacheEntry<any>;
}

const STORAGE_KEY = 'ccusage_cache';
const DEFAULT_CACHE_TTL = 5 * 60 * 1000; // 5 minutes

export class StorageService {
  private static instance: StorageService;

  private constructor() {}

  static getInstance(): StorageService {
    if (!StorageService.instance) {
      StorageService.instance = new StorageService();
    }
    return StorageService.instance;
  }

  private getStorage(): Partial<StorageSchema> {
    const stored = localStorage.getItem(STORAGE_KEY);
    if (!stored) return {};
    try {
      return JSON.parse(stored);
    } catch {
      return {};
    }
  }

  private setStorage(data: Partial<StorageSchema>): void {
    localStorage.setItem(STORAGE_KEY, JSON.stringify(data));
  }

  /**
   * Get cached data for a specific command
   */
  get<K extends keyof StorageSchema>(
    command: K,
    ttl: number = DEFAULT_CACHE_TTL
  ): StorageSchema[K]['data'] | null {
    const storage = this.getStorage();
    const entry = storage[command];
    
    if (!entry) return null;
    
    const now = Date.now();
    const age = now - entry.timestamp;
    
    if (age > ttl) {
      // Cache expired
      return null;
    }
    
    return entry.data;
  }

  /**
   * Set cached data for a specific command
   */
  set<K extends keyof StorageSchema>(
    command: K,
    data: StorageSchema[K]['data']
  ): void {
    const storage = this.getStorage();
    storage[command] = {
      data,
      timestamp: Date.now(),
    };
    this.setStorage(storage);
  }


  /**
   * Clear cache for a specific command or all cache
   */
  clear(command?: keyof StorageSchema): void {
    if (command) {
      const storage = this.getStorage();
      delete storage[command];
      this.setStorage(storage);
    } else {
      localStorage.removeItem(STORAGE_KEY);
    }
  }

  /**
   * Get cache age for a specific command
   */
  getAge(command: keyof StorageSchema): number | null {
    const storage = this.getStorage();
    const entry = storage[command];
    
    if (!entry) return null;
    
    return Date.now() - entry.timestamp;
  }

  /**
   * Check if cache is valid (not expired)
   */
  isValid(command: keyof StorageSchema, ttl: number = DEFAULT_CACHE_TTL): boolean {
    const age = this.getAge(command);
    return age !== null && age <= ttl;
  }
}

export const storage = StorageService.getInstance();