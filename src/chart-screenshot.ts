import puppeteer from "puppeteer-core";
import { getChromeExecutablePath } from "./utils/browser-path";

// Simple memory cache for screenshots
const screenshotCache: Record<string, { buffer: Buffer; timestamp: number }> = {};
const CACHE_TTL = 3 * 60 * 1000; // 3 minutes cache lifetime

export async function getTradingViewScreenshot(symbol: string): Promise<Buffer | null> {
  const sym = symbol.toUpperCase();
  const cached = screenshotCache[sym];
  if (cached && Date.now() - cached.timestamp < CACHE_TTL) {
    console.log(`[Screenshot Cache] Serving cached PNG for ${sym}`);
    return cached.buffer;
  }

  console.log(`[Puppeteer] Launching headless browser to capture chart for ${sym}...`);
  
  const executablePath = getChromeExecutablePath();
  console.log(`[Puppeteer] Using executable path: ${executablePath || "default"}`);

  // Puppeteer launch with standard sandbox disabling flags to run reliably in containers
  const browser = await puppeteer.launch({
    headless: true,
    executablePath: executablePath || undefined,
    args: [
      "--no-sandbox",
      "--disable-setuid-sandbox",
      "--disable-dev-shm-usage",
      "--disable-gpu",
      "--disable-web-security"
    ]
  });

  try {
    const page = await browser.newPage();
    
    // Set a professional high-resolution viewport (aspect ratio matching 16:9 or similar)
    await page.setViewport({
      width: 1200,
      height: 675,
      deviceScaleFactor: 2 // deviceScaleFactor: 2 produces double-sharp (2400x1350) high-res output
    });

    // Load the local chart-embed page
    const embedUrl = `http://localhost:3000/chart-embed/${sym}`;
    console.log(`[Puppeteer] Navigating to ${embedUrl}`);
    
    await page.goto(embedUrl, {
      waitUntil: "networkidle2",
      timeout: 25000
    });

    // Wait until the TradingView widget iframe exists
    console.log(`[Puppeteer] Waiting for TradingView widget to load...`);
    await page.waitForSelector("iframe", { timeout: 15000 });

    // Allow additional time for WebSocket data streams to populate and candlesticks to animate
    await new Promise((resolve) => setTimeout(resolve, 3500));

    // Capture the entire viewport screenshot as a high-quality PNG
    console.log(`[Puppeteer] Capturing high-resolution viewport screenshot...`);
    const buffer = await page.screenshot({ type: "png" });

    // Save to memory cache
    screenshotCache[sym] = {
      buffer: buffer as Buffer,
      timestamp: Date.now()
    };

    return buffer as Buffer;
  } catch (error) {
    console.error(`[Puppeteer] Error generating screenshot for ${sym}:`, error);
    return null;
  } finally {
    await browser.close();
    console.log(`[Puppeteer] Headless browser closed for ${sym}`);
  }
}
