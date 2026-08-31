import { chromium } from "playwright";
import { mkdir } from "node:fs/promises";

const base = process.env.ABEBA_URL ?? "http://127.0.0.1:3000";
const out = process.env.ABEBA_SHOTS ?? "/tmp/abeba-e2e";
await mkdir(out, { recursive: true });

const browser = await chromium.launch({ headless: true });
const page = await browser.newPage({ viewport: { width: 430, height: 900 } });

await page.goto(base, { waitUntil: "networkidle" });
await page.getByRole("link", { name: /send flowers/i }).click();
await page.waitForURL("**/home");
await page.screenshot({ path: `${out}/01-home.png`, fullPage: true });

const sara = page.getByText(/Sara's birthday/i);
if (!(await sara.count())) throw new Error("Sara birthday card missing");

await page.getByRole("link", { name: /see flowers/i }).first().click();
await page.waitForURL("**/shop**");
await page.screenshot({ path: `${out}/02-shop.png`, fullPage: true });

await page.goto(`${base}/shop/bq-blush`, { waitUntil: "networkidle" });
await page.screenshot({ path: `${out}/03-bouquet.png`, fullPage: true });
await page.getByRole("link", { name: /send flowers/i }).click();
await page.waitForURL("**/checkout**");
await page.screenshot({ path: `${out}/04-checkout.png`, fullPage: true });

if (!(await page.getByText("Soft Blush").count())) {
  throw new Error("Checkout missing Soft Blush");
}
if (!(await page.getByText("1,880 ETB").count())) {
  throw new Error("Checkout total missing");
}

await page.locator("#pay-and-send").click();
await page.waitForURL("**/orders/**", { timeout: 10000 });
await page.waitForTimeout(800);
await page.screenshot({ path: `${out}/05-success.png`, fullPage: true });

const body = await page.locator("body").innerText();
if (!/on its way|Order confirmed|Flowers being prepared/i.test(body)) {
  throw new Error(`Unexpected order page: ${body.slice(0, 400)}`);
}

console.log("E2E checkout passed");
console.log("order url", page.url());
await browser.close();
