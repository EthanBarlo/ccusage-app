import { ipcMain } from "electron";
import { exec } from "child_process";
import { promisify } from "util";

const execAsync = promisify(exec);

export function addCcusageEventListeners() {
  ipcMain.handle("run-ccusage", async (_, command: string) => {
    try {
      const fullCommand = `npx ccusage@latest ${command} --json`;
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