import { app, BrowserWindow, Menu } from "electron";
import path from "path";
import { fileURLToPath } from "url";

// Get the __dirname equivalent for ES modules
const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

let win;

function createWindow() {
  win = new BrowserWindow({
    width: 1200,
    height: 800,
    webPreferences: {
      nodeIntegration: false,
      contextIsolation: true,
      enableRemoteModule: false,
      preload: path.join(__dirname, "preload.js"),
    },
  });

  const startUrl =
    process.env.NODE_ENV === "development"
      ? "http://localhost:5173"
      : `file://${path
          .join(__dirname, "../dist/index.html")
          .replace(/\\/g, "/")}`;

  win.loadURL(startUrl);

  console.log("Loading URL:", startUrl);

  if (process.env.NODE_ENV === "development") {
    win.webContents.openDevTools();
  }

  win.webContents.once("did-finish-load", () => {
    console.log("Electron: Page loaded successfully!");
  });

  win.webContents.on("did-fail-load", (event, errorCode, errorDescription) => {
    console.error("Page failed to load:", errorCode, errorDescription);
  });

  win.on("closed", () => {
    win = null;
  });
}

app.whenReady().then(createWindow);

app.on("window-all-closed", () => {
  if (process.platform !== "darwin") {
    app.quit();
  }
});
