import { ipcMain } from "electron";
import { exec } from "child_process";
import { promisify } from "util";
import { CUSTOM_CCUSAGE_COMMAND_KEY } from "../settings/settings-listeners";

const execAsync = promisify(exec);

export function addCcusageEventListeners() {
  ipcMain.handle("run-ccusage", async (_, command: string) => {
    try {
      // Get custom command if set
      const customCommand = global.appSettings?.[CUSTOM_CCUSAGE_COMMAND_KEY];
      const baseCommand = customCommand || "npx ccusage@latest";
      
      const fullCommand = `${baseCommand} ${command} --json`;
      console.log("Executing ccusage command:", fullCommand);
      
      const { stdout, stderr } = await execAsync(fullCommand);
      
      if (stderr) {
        console.error("ccusage stderr:", stderr);
      }
      
      return JSON.parse(stdout);
    } catch (error) {
      console.error("Error running ccusage:", error);
      throw error;
    }
  });
}