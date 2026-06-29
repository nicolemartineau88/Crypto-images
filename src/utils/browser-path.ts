import fs from "fs";
import path from "path";

export function getChromeExecutablePath(): string | undefined {
  const platform = process.platform;
  
  if (platform === "win32") {
    const programFiles = process.env.PROGRAMFILES || "C:\\Program Files";
    const programFilesX86 = process.env["PROGRAMFILES(X86)"] || "C:\\Program Files (x86)";
    const localAppData = process.env.LOCALAPPDATA || path.join(process.env.USERPROFILE || "C:\\Users\\Default", "AppData\\Local");
    
    const winPaths = [
      path.join(programFiles, "Google\\Chrome\\Application\\chrome.exe"),
      path.join(programFilesX86, "Google\\Chrome\\Application\\chrome.exe"),
      path.join(localAppData, "Google\\Chrome\\Application\\chrome.exe"),
      path.join(programFiles, "Microsoft\\Edge\\Application\\msedge.exe"),
      path.join(programFilesX86, "Microsoft\\Edge\\Application\\msedge.exe"),
    ];

    for (const p of winPaths) {
      if (fs.existsSync(p)) {
        return p;
      }
    }
  } else if (platform === "darwin") {
    const macPaths = [
      "/Applications/Google Chrome.app/Contents/MacOS/Google Chrome",
      "/Applications/Microsoft Edge.app/Contents/MacOS/Microsoft Edge",
      "/Applications/Chromium.app/Contents/MacOS/Chromium",
    ];
    for (const p of macPaths) {
      if (fs.existsSync(p)) {
        return p;
      }
    }
  } else {
    // Linux
    const linuxPaths = [
      "/usr/bin/google-chrome",
      "/usr/bin/chromium",
      "/usr/bin/chromium-browser",
      "/usr/bin/chrome"
    ];
    for (const p of linuxPaths) {
      if (fs.existsSync(p)) {
        return p;
      }
    }
  }
  
  return undefined;
}
