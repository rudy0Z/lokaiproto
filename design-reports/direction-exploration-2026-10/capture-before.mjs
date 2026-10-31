/* Capture "before" screenshots of the running LokAI mobile app (Vellum, as-built). */
import path from "node:path";
import { fileURLToPath } from "node:url";
import { createRequire } from "node:module";

const SKILL = "D:/Downloads/app-designer/App Designer/app-designer";
const { chromium } = createRequire(path.join(SKILL, "package.json"))("playwright-core");

const OUT = path.join(path.dirname(fileURLToPath(import.meta.url)), "shots", "before");
import fs from "node:fs";
fs.mkdirSync(OUT, { recursive: true });

const CHROME = "C:/Program Files/Google/Chrome/Application/chrome.exe";
const BASE = "http://localhost:5174/#/mobile";

const browser = await chromium.launch({ executablePath: CHROME, headless: true });
const page = await browser.newPage({ viewport: { width: 390, height: 844 }, deviceScaleFactor: 3 });

const settle = (ms) => new Promise((r) => setTimeout(r, ms));

async function shot(url, name, { preWait = 1600, action } = {}) {
  await page.goto(`${BASE}${url}`, { waitUntil: "networkidle" });
  await settle(preWait);
  if (action) await action();
  await page.screenshot({ path: path.join(OUT, `${name}.png`) });
  console.log("shot", name);
}

// 1. Front door (empty state)
await shot("/home", "before-01-home-empty", { preWait: 2400 });

// 2. Mid-use conversation: run a prepared chip input, let the working beat + answer land
await shot("/home", "before-02-home-conversation", {
  preWait: 2400,
  action: async () => {
    const chip = page.locator(".lokai-chip", { hasText: /mixer|refund|damaged/i }).first();
    await chip.click();
    await settle(11000); // narrated working beat (~4.2s) + answer render
  },
});

// 3. Case overview (intake)
await shot("/case/consumer", "before-03-case-intake");

// 4. Verify stage — evidence locker + verification gate
await shot("/case/consumer?stage=verify", "before-04-case-verify");

// 5. Packet stage — notice paper object
await shot("/case/consumer?stage=packet", "before-05-case-packet");

// 6. Stop state — limitation expiry (the most designed screen)
await shot("/case/consumer?stage=failure&failure=statute_expiry", "before-06-stop-limitation", { preWait: 2600 });

await browser.close();
console.log("done ->", OUT);
