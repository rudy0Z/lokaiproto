import path from "node:path";
import { createRequire } from "node:module";
const SKILL = "D:/Downloads/app-designer/App Designer/app-designer";
const { chromium } = createRequire(path.join(SKILL, "package.json"))("playwright-core");
const browser = await chromium.launch({ executablePath: "C:/Program Files/Google/Chrome/Application/chrome.exe", headless: true });
const page = await browser.newPage({ viewport: { width: 1400, height: 1000 } });
await page.goto("file:///D:/portfolio%20porjects/Lokaifm-main/design-reports/direction-exploration-2026-10/mockup-a.html", { waitUntil: "networkidle" });
await page.evaluate(async () => { await document.fonts.ready; });
const m = await page.evaluate(() => {
  const s = document.querySelector('.screen[data-name="A2-core-light"]');
  const q = (sel) => s.querySelector(sel);
  const foil = q(".foil");
  const info = (el) => { const r = el.getBoundingClientRect(); return { h: Math.round(r.height), w: Math.round(r.width) }; };
  return {
    header: info(q(".hd")), h1lines: Math.round(q(".hd h1").getBoundingClientRect().height),
    foil: info(foil), postmark: info(q(".postmark")), cites: info(q(".cites")),
    act: info(q(".cites .act")), refs: info(q(".cites .refs")), verify: info(q(".cites .verify")),
    barcode: info(q(".barcode")),
    steps: info(q(".steps")), cta: info(q(".cta")), door: info(q(".door")),
  };
});
console.log(JSON.stringify(m, null, 1));
await browser.close();
