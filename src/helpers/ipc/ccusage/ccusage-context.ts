import { contextBridge, ipcRenderer } from "electron";

export function exposeCcusageContext() {
  contextBridge.exposeInMainWorld("ccusageApi", {
    runCommand: (command: string) => ipcRenderer.invoke("run-ccusage", command),
  });
}