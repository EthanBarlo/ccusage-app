import { app, BrowserWindow } from "electron";
import { existsSync } from "fs";
import registerListeners from "./helpers/ipc/listeners-register";
// "electron-squirrel-startup" seems broken when packaging with vite
//import started from "electron-squirrel-startup";
import path from "path";
import {
  installExtension,
  REACT_DEVELOPER_TOOLS,
} from "electron-devtools-installer";

const inDevelopment = process.env.NODE_ENV === "development";

function createWindow() {
  const preload = path.join(__dirname, "preload.js");
  const iconPath = path.join(process.cwd(), "build-resources/icon.png");
  
  const mainWindow = new BrowserWindow({
    width: 800,
    height: 600,
    icon: existsSync(iconPath) ? iconPath : undefined,
    webPreferences: {
      devTools: inDevelopment,
      contextIsolation: true,
      nodeIntegration: true,
      nodeIntegrationInSubFrames: false,

      preload: preload,
    },
    titleBarStyle: "hidden",
  });
  registerListeners(mainWindow);

  if (MAIN_WINDOW_VITE_DEV_SERVER_URL) {
    mainWindow.loadURL(MAIN_WINDOW_VITE_DEV_SERVER_URL);
  } else {
    mainWindow.loadFile(
      path.join(__dirname, `../renderer/${MAIN_WINDOW_VITE_NAME}/index.html`),
    );
  }
}

async function installExtensions() {
  try {
    const result = await installExtension(REACT_DEVELOPER_TOOLS);
    console.log(`Extensions installed successfully: ${result.name}`);
  } catch {
    console.error("Failed to install extensions");
  }
}

app.whenReady().then(() => {
  // Set dock icon for macOS
  if (process.platform === "darwin") {
    const iconPath = path.join(process.cwd(), "build-resources/icon.png");
    if (existsSync(iconPath)) {
      try {
        app.dock.setIcon(iconPath);
      } catch (error) {
        console.error('Failed to set dock icon:', error);
      }
    }
  }
  
  createWindow();
  installExtensions();
});

//osX only
app.on("window-all-closed", () => {
  if (process.platform !== "darwin") {
    app.quit();
  }
});

app.on("activate", () => {
  if (BrowserWindow.getAllWindows().length === 0) {
    createWindow();
  }
});
//osX only ends
