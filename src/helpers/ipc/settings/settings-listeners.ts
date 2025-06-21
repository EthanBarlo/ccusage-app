import { ipcMain } from "electron";

export const CUSTOM_CCUSAGE_COMMAND_KEY = "custom_ccusage_command";

// Global type declaration
declare global {
  var appSettings: Record<string, any> | undefined;
}

export function addSettingsEventListeners() {
  ipcMain.handle("get-setting", async (_, key: string) => {
    // For now, we'll use a simple in-memory store that syncs with renderer
    // In the future, this could be replaced with electron-store
    return global.appSettings?.[key] || null;
  });

  ipcMain.handle("set-setting", async (_, key: string, value: any) => {
    if (!global.appSettings) {
      global.appSettings = {};
    }
    global.appSettings[key] = value;
    return true;
  });
}