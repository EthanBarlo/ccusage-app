import { nativeTheme } from "electron";
import { ipcMain } from "electron";
import {
  THEME_MODE_CURRENT_CHANNEL,
  THEME_MODE_DARK_CHANNEL,
  THEME_MODE_LIGHT_CHANNEL,
  THEME_MODE_SYSTEM_CHANNEL,
  THEME_MODE_TOGGLE_CHANNEL,
  THEME_MODE_IS_DARK_CHANNEL,
} from "./theme-channels";

export function addThemeEventListeners() {
  ipcMain.handle(THEME_MODE_CURRENT_CHANNEL, () => nativeTheme.themeSource);
  ipcMain.handle(THEME_MODE_IS_DARK_CHANNEL, () => nativeTheme.shouldUseDarkColors);
  ipcMain.handle(THEME_MODE_TOGGLE_CHANNEL, () => {
    if (nativeTheme.shouldUseDarkColors) {
      nativeTheme.themeSource = "light";
    } else {
      nativeTheme.themeSource = "dark";
    }
    return nativeTheme.shouldUseDarkColors;
  });
  ipcMain.handle(
    THEME_MODE_DARK_CHANNEL,
    () => (nativeTheme.themeSource = "dark"),
  );
  ipcMain.handle(
    THEME_MODE_LIGHT_CHANNEL,
    () => (nativeTheme.themeSource = "light"),
  );
  ipcMain.handle(THEME_MODE_SYSTEM_CHANNEL, () => {
    nativeTheme.themeSource = "system";
    return nativeTheme.shouldUseDarkColors;
  });

  // Listen for system theme changes
  nativeTheme.on('updated', () => {
    // When system theme changes and we're in system mode, update the DOM
    if (nativeTheme.themeSource === 'system') {
      const isDark = nativeTheme.shouldUseDarkColors;
      // We'll need to send this to all windows
      const { BrowserWindow } = require('electron');
      BrowserWindow.getAllWindows().forEach(window => {
        window.webContents.send('theme-updated', isDark);
      });
    }
  });
}
