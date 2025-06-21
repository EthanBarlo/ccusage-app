import { contextBridge, ipcRenderer } from "electron";

export const settingsContext = {
  getSetting: (key: string) => ipcRenderer.invoke("get-setting", key),
  setSetting: (key: string, value: any) => ipcRenderer.invoke("set-setting", key, value),
};

export function exposeSettingsContext() {
  contextBridge.exposeInMainWorld("settingsApi", settingsContext);
}