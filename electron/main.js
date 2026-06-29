const { app, BrowserWindow, Menu, shell } = require("electron");
const path = require("path");
const { spawn, fork } = require("child_process");
const http = require("http");

let serverProcess = null;
let mainWindow = null;
const PORT = 3000;

const loadingHtml = `
  <!DOCTYPE html>
  <html>
    <head>
      <title>Crypto Publisher</title>
      <style>
        body {
          margin: 0;
          background: #09090b;
          color: #f4f4f5;
          font-family: -apple-system, BlinkMacSystemFont, "Segoe UI", Roboto, sans-serif;
          display: flex;
          flex-direction: column;
          align-items: center;
          justify-content: center;
          height: 100vh;
          overflow: hidden;
          user-select: none;
        }
        .container {
          text-align: center;
        }
        .logo-glow {
          position: absolute;
          width: 300px;
          height: 300px;
          background: radial-gradient(circle, rgba(139, 92, 246, 0.15) 0%, rgba(0,0,0,0) 70%);
          z-index: 1;
        }
        .spinner {
          position: relative;
          z-index: 2;
          width: 56px;
          height: 56px;
          border: 4px solid #18181b;
          border-top: 4px solid #a78bfa;
          border-radius: 50%;
          animation: spin 0.8s cubic-bezier(0.4, 0, 0.2, 1) infinite;
          margin: 0 auto 28px auto;
          box-shadow: 0 0 20px rgba(139, 92, 246, 0.2);
        }
        @keyframes spin {
          0% { transform: rotate(0deg); }
          100% { transform: rotate(360deg); }
        }
        h1 {
          position: relative;
          z-index: 2;
          font-size: 24px;
          font-weight: 600;
          margin: 0 0 10px 0;
          letter-spacing: -0.5px;
          background: linear-gradient(to right, #ffffff, #d8b4fe);
          -webkit-background-clip: text;
          -webkit-text-fill-color: transparent;
        }
        p {
          position: relative;
          z-index: 2;
          font-size: 14px;
          color: #a1a1aa;
          margin: 0;
          letter-spacing: 0.2px;
        }
      </style>
    </head>
    <body>
      <div class="logo-glow"></div>
      <div class="container">
        <div class="spinner"></div>
        <h1>Crypto Publisher</h1>
        <p>Starting background server & blockchain engines...</p>
      </div>
    </body>
  </html>
`;

function startBackgroundServer() {
  const isDev = !app.isPackaged;
  
  if (isDev) {
    console.log("[Electron] Starting Express server in development mode...");
    // Run server.ts using tsx directly
    serverProcess = spawn("npx", ["tsx", "server.ts"], {
      shell: true,
      env: { ...process.env, NODE_ENV: "development", PORT: PORT },
      stdio: "inherit"
    });
  } else {
    console.log("[Electron] Starting Express server in production mode...");
    // Use the compiled version dist/server.cjs
    const serverPath = path.join(app.getAppPath(), "dist", "server.cjs");
    serverProcess = fork(serverPath, [], {
      env: { ...process.env, NODE_ENV: "production", PORT: PORT, ELECTRON_USER_DATA: app.getPath("userData") }
    });
  }

  serverProcess.on("error", (err) => {
    console.error("[Electron] Failed to start server process:", err);
  });

  serverProcess.on("exit", (code, signal) => {
    console.log(`[Electron] Server process exited (code: ${code}, signal: ${signal})`);
  });
}

function checkServerReady(callback) {
  const req = http.get(`http://localhost:${PORT}/api/health`, (res) => {
    if (res.statusCode === 200) {
      callback(true);
    } else {
      setTimeout(() => checkServerReady(callback), 150);
    }
  });
  
  req.on("error", () => {
    // If /api/health is not ready or server is starting up, retry
    setTimeout(() => checkServerReady(callback), 150);
  });
}

function createWindow() {
  mainWindow = new BrowserWindow({
    width: 1280,
    height: 800,
    minWidth: 1024,
    minHeight: 720,
    title: "Crypto Publisher",
    backgroundColor: "#09090b",
    icon: path.join(__dirname, process.platform === "win32" ? "icon.ico" : "icon.png"),
    webPreferences: {
      preload: path.join(__dirname, "preload.js"),
      contextIsolation: true,
      nodeIntegration: false,
    },
  });

  // Display the professional loading splash screen inside the main window
  mainWindow.loadURL("data:text/html;charset=utf-8," + encodeURIComponent(loadingHtml));

  // Build minimal professional app menu
  createApplicationMenu();

  // Handle external links (open in user's default browser instead of Electron)
  mainWindow.webContents.setWindowOpenHandler(({ url }) => {
    if (url.startsWith("http://localhost") || url.startsWith("https://localhost")) {
      return { action: "allow" };
    }
    shell.openExternal(url);
    return { action: "deny" };
  });

  // Check if server is ready, then load the local server URL
  checkServerReady(() => {
    console.log("[Electron] Server is ready! Loading app...");
    mainWindow.loadURL(`http://localhost:${PORT}`);
  });

  mainWindow.on("closed", () => {
    mainWindow = null;
  });
}

function createApplicationMenu() {
  const isDev = !app.isPackaged;
  
  const template = [
    {
      label: "File",
      submenu: [
        { label: "Reload Server Connection", click: () => {
          if (mainWindow) mainWindow.loadURL(`http://localhost:${PORT}`);
        }},
        { type: "separator" },
        { role: "quit" }
      ]
    },
    {
      label: "Edit",
      submenu: [
        { role: "undo" },
        { role: "redo" },
        { type: "separator" },
        { role: "cut" },
        { role: "copy" },
        { role: "paste" },
        { role: "selectAll" }
      ]
    },
    {
      label: "View",
      submenu: [
        { role: "reload" },
        { role: "forceReload" },
        isDev ? { role: "toggleDevTools" } : { label: "Developer Tools", click: () => {
          mainWindow.webContents.toggleDevTools();
        }},
        { type: "separator" },
        { role: "resetZoom" },
        { role: "zoomIn" },
        { role: "zoomOut" },
        { type: "separator" },
        { role: "togglefullscreen" }
      ]
    },
    {
      label: "Help",
      submenu: [
        {
          label: "Documentation",
          click: async () => {
            await shell.openExternal("https://blurt.blog");
          }
        }
      ]
    }
  ];

  const menu = Menu.buildFromTemplate(template);
  Menu.setApplicationMenu(menu);
}

// Clean up child process when Electron closes
function killServerProcess() {
  if (serverProcess) {
    console.log("[Electron] Terminating background server process...");
    try {
      if (process.platform === "win32") {
        // On Windows, taskkill ensures the process tree is killed
        spawn("taskkill", ["/pid", serverProcess.pid, "/f", "/t"]);
      } else {
        serverProcess.kill();
      }
    } catch (e) {
      console.error("[Electron] Error killing server process:", e);
    }
    serverProcess = null;
  }
}

app.on("ready", () => {
  startBackgroundServer();
  createWindow();
});

app.on("window-all-closed", () => {
  killServerProcess();
  if (process.platform !== "darwin") {
    app.quit();
  }
});

app.on("quit", () => {
  killServerProcess();
});

app.on("activate", () => {
  if (mainWindow === null) {
    createWindow();
  }
});
