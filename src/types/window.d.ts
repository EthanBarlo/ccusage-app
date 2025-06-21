export {};

declare global {
  interface Window {
    windowApi: {
      minimize: () => void;
      maximize: () => void;
      close: () => void;
    };
    themeApi: {
      toggle: () => void;
      system: () => void;
      set: (theme: "light" | "dark" | "system") => void;
      get: () => Promise<"light" | "dark" | "system">;
    };
    ccusageApi: {
      runCommand: (command: string) => Promise<any>;
    };
    settingsApi: {
      getSetting: (key: string) => Promise<any>;
      setSetting: (key: string, value: any) => Promise<boolean>;
    };
  }
}