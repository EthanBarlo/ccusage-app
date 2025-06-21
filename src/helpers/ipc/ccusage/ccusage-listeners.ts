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
      
      // Use shell: true and specify the shell path to ensure proper environment
      const { stdout, stderr } = await execAsync(fullCommand, {
        shell: true,
        env: {
          ...process.env,
          // Ensure PATH includes common locations for npm/npx including homebrew paths
          PATH: `/opt/homebrew/bin:/usr/local/bin:/usr/bin:/bin:/usr/sbin:/sbin:${process.env.PATH || ''}`,
        },
      });
      
      if (stderr) {
        console.error("ccusage stderr:", stderr);
      }
      
      return JSON.parse(stdout);
    } catch (error: any) {
      console.error("Error running ccusage:", error);
      
      // Check if it's a "command not found" error
      if (error.message?.includes("command not found") || error.message?.includes("not found")) {
        const helpMessage = `
ccusage command not found. Please ensure one of the following:

1. You have npm/npx installed and available in your PATH
2. You have ccusage installed globally: npm install -g ccusage
3. Configure a custom command path in Settings

On macOS with Homebrew, npm is typically at /opt/homebrew/bin/npm
On other systems, it's usually at /usr/local/bin/npm

You can set a custom command in Settings > Advanced > Custom ccusage command.
Examples:
- /usr/local/bin/ccusage
- /opt/homebrew/bin/ccusage
- ~/.local/bin/ccusage
        `.trim();
        
        throw new Error(helpMessage);
      }
      
      throw error;
    }
  });
}