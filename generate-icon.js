import puppeteer from "puppeteer";
import fs from "fs";
import path from "path";

const svgIcon = `
<svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 512 512" width="512" height="512">
  <defs>
    <linearGradient id="bgGrad" x1="0%" y1="0%" x2="100%" y2="100%">
      <stop offset="0%" stop-color="#18181b" />
      <stop offset="50%" stop-color="#09090b" />
      <stop offset="100%" stop-color="#020202" />
    </linearGradient>
    <linearGradient id="emblemGrad" x1="0%" y1="0%" x2="100%" y2="100%">
      <stop offset="0%" stop-color="#c084fc" />
      <stop offset="50%" stop-color="#a78bfa" />
      <stop offset="100%" stop-color="#7c3aed" />
    </linearGradient>
    <linearGradient id="glowGrad" x1="0%" y1="0%" x2="100%" y2="100%">
      <stop offset="0%" stop-color="#22d3ee" />
      <stop offset="100%" stop-color="#3b82f6" />
    </linearGradient>
    <filter id="glow" x="-25%" y="-25%" width="150%" height="150%">
      <feGaussianBlur stdDeviation="15" result="blur" />
      <feComposite in="SourceGraphic" in2="blur" operator="over" />
    </filter>
  </defs>

  <!-- Background rounded square -->
  <rect x="16" y="16" width="480" height="480" rx="100" fill="url(#bgGrad)" stroke="#27272a" stroke-width="6" />

  <!-- Glowing orbit line -->
  <circle cx="256" cy="256" r="150" fill="none" stroke="url(#glowGrad)" stroke-width="3" stroke-opacity="0.3" stroke-dasharray="8 12" filter="url(#glow)" />

  <!-- Blockchain node connection lines -->
  <line x1="256" y1="100" x2="110" y2="290" stroke="#a78bfa" stroke-width="4" stroke-opacity="0.5" />
  <line x1="256" y1="100" x2="402" y2="290" stroke="#a78bfa" stroke-width="4" stroke-opacity="0.5" />
  <line x1="110" y1="290" x2="256" y2="412" stroke="#22d3ee" stroke-width="4" stroke-opacity="0.5" />
  <line x1="402" y1="290" x2="256" y2="412" stroke="#22d3ee" stroke-width="4" stroke-opacity="0.5" />

  <!-- Blockchain Nodes (Circles) -->
  <circle cx="256" cy="100" r="18" fill="#c084fc" filter="url(#glow)" />
  <circle cx="110" cy="290" r="18" fill="#22d3ee" filter="url(#glow)" />
  <circle cx="402" cy="290" r="18" fill="#3b82f6" filter="url(#glow)" />
  <circle cx="256" cy="412" r="18" fill="#7c3aed" filter="url(#glow)" />

  <!-- Central Crypto/Publishing Symbol (Stylized document and lightning bolt/quill) -->
  <g transform="translate(196, 186)" filter="url(#softShadow)">
    <!-- Document base -->
    <rect x="20" y="15" width="80" height="110" rx="10" fill="url(#emblemGrad)" stroke="#ffffff" stroke-width="4" />
    <!-- Document lines -->
    <line x1="38" y1="45" x2="82" y2="45" stroke="#ffffff" stroke-width="5" stroke-linecap="round" />
    <line x1="38" y1="68" x2="82" y2="68" stroke="#ffffff" stroke-width="5" stroke-linecap="round" />
    <line x1="38" y1="91" x2="65" y2="91" stroke="#ffffff" stroke-width="5" stroke-linecap="round" />
    
    <!-- Decorative coin overlay -->
    <circle cx="90" cy="95" r="26" fill="#fbbf24" stroke="#ffffff" stroke-width="3" />
    <!-- "B" symbol for Blurt/Blockchain -->
    <text x="90" y="103" fill="#ffffff" font-family="-apple-system, BlinkMacSystemFont, sans-serif" font-size="24" font-weight="900" text-anchor="middle">B</text>
  </g>
</svg>
`;

async function generate() {
  console.log("Launching Puppeteer browser to render SVG logo...");
  const browser = await puppeteer.launch({
    headless: true,
    args: [
      "--no-sandbox",
      "--disable-setuid-sandbox",
      "--disable-dev-shm-usage",
      "--disable-gpu"
    ]
  });

  try {
    const page = await browser.newPage();
    await page.setViewport({
      width: 256,
      height: 256,
      deviceScaleFactor: 1
    });

    const htmlContent = `
      <html>
        <head>
          <style>
            html, body {
              margin: 0;
              padding: 0;
              width: 100%;
              height: 100%;
              overflow: hidden;
              background: transparent;
            }
            svg {
              width: 100%;
              height: 100%;
              display: block;
            }
          </style>
        </head>
        <body>
          ${svgIcon}
        </body>
      </html>
    `;

    await page.setContent(htmlContent, { waitUntil: "load" });
    const pngBuffer = await page.screenshot({ type: "png", omitBackground: true });
    
    // Ensure the directories exist
    const electronDir = path.join(process.cwd(), "electron");
    if (!fs.existsSync(electronDir)) {
      fs.mkdirSync(electronDir);
    }
    
    fs.writeFileSync(path.join(electronDir, "icon.png"), pngBuffer);
    fs.writeFileSync(path.join(process.cwd(), "icon.png"), pngBuffer);
    console.log("Successfully generated application icons at /electron/icon.png and /icon.png!");
  } catch (err) {
    console.error("Failed to generate icon:", err);
  } finally {
    await browser.close();
  }
}

generate();
