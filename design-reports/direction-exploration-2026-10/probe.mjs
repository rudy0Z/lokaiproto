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
  const r = (el) => el ? Math.round(el.getBoundingClientRect().height) : null;
  const q = (sel) => s.querySelector(sel);
  const conv = q(".conv");
  const body = q(".body");
  return {
    body: r(body), header: r(q(".hd")), airmail: r(q(".airmail")),
    convClient: conv.clientHeight, convScroll: conv.scrollHeight,
    umsg: r(q(".umsg")), z1: r(q(".z1")), z2: r(q(".z2")), foil: r(q(".foil")), steps: r(q(".steps")),
    pin: r(q(".pin")), composer: r(q(".composer")),
    eachStep: [...s.querySelectorAll(".steps li")].map(li => Math.round(li.getBoundingClientRect().height)),
  };
});
console.log(JSON.stringify(m, null, 1));
await browser.close();
