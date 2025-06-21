const SESSION_NAMES_KEY = 'ccusage_session_names';

export class SessionNamesService {
  private static instance: SessionNamesService;

  private constructor() {}

  static getInstance(): SessionNamesService {
    if (!SessionNamesService.instance) {
      SessionNamesService.instance = new SessionNamesService();
    }
    return SessionNamesService.instance;
  }

  private getNames(): Record<string, string> {
    const stored = localStorage.getItem(SESSION_NAMES_KEY);
    if (!stored) return {};
    try {
      return JSON.parse(stored);
    } catch {
      return {};
    }
  }

  private setNames(names: Record<string, string>): void {
    localStorage.setItem(SESSION_NAMES_KEY, JSON.stringify(names));
  }

  /**
   * Get custom name for a session
   */
  getName(sessionId: string): string | null {
    const names = this.getNames();
    return names[sessionId] || null;
  }

  /**
   * Set custom name for a session
   */
  setName(sessionId: string, name: string): void {
    const names = this.getNames();
    if (name.trim()) {
      names[sessionId] = name.trim();
    } else {
      delete names[sessionId];
    }
    this.setNames(names);
  }

  /**
   * Delete custom name for a session
   */
  deleteName(sessionId: string): void {
    const names = this.getNames();
    delete names[sessionId];
    this.setNames(names);
  }

  /**
   * Get display name for a session (custom name or extracted from path)
   */
  getDisplayName(sessionId: string): string {
    const customName = this.getName(sessionId);
    if (customName) return customName;
    
    // Extract from path - get the last segment after the last hyphen
    const pathParts = sessionId.split('-');
    return pathParts[pathParts.length - 1] || 'Unknown';
  }
}

export const sessionNames = SessionNamesService.getInstance();