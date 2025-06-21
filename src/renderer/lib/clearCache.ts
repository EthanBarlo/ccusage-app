// Utility to clear the cache
export function clearAllCache() {
  localStorage.removeItem('ccusage_cache');
  console.log('Cache cleared');
}

// Export to window for easy access in console
if (typeof window !== 'undefined') {
  (window as any).clearAllCache = clearAllCache;
}