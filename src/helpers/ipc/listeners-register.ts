import { BrowserWindow } from "electron";
import { addThemeEventListeners } from "./theme/theme-listeners";
import { addWindowEventListeners } from "./window/window-listeners";
import { addCcusageEventListeners } from "./ccusage/ccusage-listeners";
import { addSettingsEventListeners } from "./settings/settings-listeners";

export default function registerListeners(mainWindow: BrowserWindow) {
  addWindowEventListeners(mainWindow);
  addThemeEventListeners();
  addCcusageEventListeners();
  addSettingsEventListeners();
}
