/* Capture the end-to-end trust walkthrough of the rebuilt LokAI mobile flow. */
import path from "node:path";
import fs from "node:fs";
import { fileURLToPath } from "node:url";
import { createRequire } from "node:module";

const SKILL = "D:/Downloads/app-designer/App Designer/app-designer";
const { chromium } = createRequire(path.join(SKILL, "package.json"))("playwright-core");

const OUT = path.join(path.dirname(fileURLToPath(import.meta.url)), "shots", "after");
fs.mkdirSync(OUT, { recursive: true });

const CHROME = "C:/Program Files/Google/Chrome/Application/chrome.exe";
const BASE = "http://localhost:5173/#/mobile";
const settle = (ms) => new Promise((r) => setTimeout(r, ms));

const browser = await chromium.launch({ executablePath: CHROME, headless: true });
const page = await browser.newPage({ viewport: { width: 390, height: 844 }, deviceScaleFactor: 2 });

async function shot(name) {
  await page.screenshot({ path: path.join(OUT, `${name}.png`) });
  console.log("shot", name);
}

async function go(url, preWait = 2200) {
  await page.goto(`${BASE}${url}`, { waitUntil: "networkidle" });
  /* Hash-only changes never reload the document — force one so module-level
     deep-link detection (?lang=) actually runs. */
  await page.reload({ waitUntil: "networkidle" });
  await settle(preWait);
}

// 1. Empty front door
await go("/home");
await shot("01-home-empty");

// 2. Chip → clarify (matter strip + case log + 3 options)
await page.locator(".lokai-chip", { hasText: /mixer/i }).first().click();
await settle(6000);
await shot("02-clarify");

// 3. Answer the clarify → explain turn with gate trail + Zone 4
await page.locator("button", { hasText: /In the last two years/i }).first().click();
await settle(6500);
await shot("03-answer");

// 4. The receipt as an instrument — open "Why this response?"
const why = page.locator("button", { hasText: /Why this response\?/i }).first();
if (await why.count()) {
  await why.click();
  await settle(700);
  await shot("04-receipt-open");
  await page.locator("button", { hasText: /Hide why/i }).first().click().catch(() => {});
}

// 5. Guardrail stop through TYPED input (T03: criminal → out-of-scope, typed)
const field = page.locator("textarea").first();
await field.fill("Write a criminal complaint accusing the seller of fraud");
await settle(400);
await shot("05a-ask-first-echo");
const sendBtn = () => page.locator("button[aria-label='Send'], button[aria-label='Confirm send']").first();
await sendBtn().click();  // ask-first: ambiguous input arms, echo shows
await settle(500);
await shot("05b-armed");
await sendBtn().click();  // second tap confirms
await settle(4500);
await shot("05-typed-criminal-stop");

// 6. The full-bleed high-risk stop with channels + handover door
await go("/case/consumer?stage=failure&failure=high_risk");
await shot("06-high-risk-stop");

// 7. The handover packet (exit artifact)
await page.locator("button", { hasText: /handover notes/i }).first().click();
await settle(1200);
await shot("07-handover-packet");

// 8. Hindi journey: chip → clarify in Hindi (T13/T14)
await go("/home?lang=hi");
await page.locator(".lokai-chip").first().click();
await settle(5000);
await shot("08-hindi-clarify");
await page.locator("button", { hasText: /पिछले दो साल/i }).first().click();
await settle(6500);
await shot("09-hindi-answer");

// 9. Hindi stop — typed Hindi question the engine cannot match routes to the
//    LOCALIZED boundary stop (T22: never an English refusal mid-Hindi chat)
await page.locator("textarea").first().fill("मैंने जनवरी 2022 में खराब मिक्सर खरीदा। विक्रेता अभी भी रिफंड नहीं दे रहा।");
await settle(400);
const send2 = () => page.locator("button[aria-label='Send'], button[aria-label='Confirm send']").first();
await send2().click();
await settle(500);
await send2().click();
await settle(4500);
await shot("10-hindi-stop");

// 10. Typed Telugu → the honesty stop (T18): a script with no prepared pack
//     resolves to the language stop — never an English answer in disguise.
await go("/home");
const teluguField = page.locator("textarea").first();
await teluguField.fill("నాకు రీఫండ్ కావాలి. విక్రేత ఇవ్వడం లేదు.");
await settle(400);
const send3 = () => page.locator("button[aria-label='Send'], button[aria-label='Confirm send']").first();
await send3().click();
await settle(500);
await send3().click();
await settle(4500);
await shot("11-language-stop");

await browser.close();
console.log("done ->", OUT);
