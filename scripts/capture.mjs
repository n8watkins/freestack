#!/usr/bin/env node
// Capture README/marketing screenshots against the local dev server with
// Playwright. Drives the real UI: hero shot, and the COMPARE table populated
// with a few well-known services.
//
// Usage: node scripts/capture.mjs [baseURL]
import { chromium } from "playwright";
import fs from "node:fs";
import path from "node:path";
import { fileURLToPath } from "node:url";

const ROOT = path.resolve(path.dirname(fileURLToPath(import.meta.url)), "..");
const BASE = process.argv[2] || "http://localhost:7693";
const OUT = path.join(ROOT, "assets");
fs.mkdirSync(OUT, { recursive: true });

const browser = await chromium.launch();
const ctx = await browser.newContext({
  viewport: { width: 1440, height: 900 },
  deviceScaleFactor: 2,
});
const page = await ctx.newPage();

console.log(`→ ${BASE}`);
await page.goto(BASE, { waitUntil: "load", timeout: 60000 });
await page.waitForTimeout(1500); // let entrance animations settle

// 1) Hero / full landing shot.
await page.screenshot({ path: path.join(OUT, "hero.png") });
console.log("captured hero.png");

// 2) Build a comparison: filter to a category with rich facets, add 4 cards.
const search = page.locator('input[type="search"]');
await search.click();
await search.type("hosting", { delay: 20 });
await page.waitForTimeout(600);

// Click the "Compare" button on the first 4 cards.
let added = 0;
const addButtons = page.locator("article button", { hasText: "Compare" });
const n = Math.min(4, await addButtons.count());
for (let i = 0; i < n; i++) {
  // Re-query each time: the list reflows as cards become "Added".
  const fresh = page
    .locator("article button")
    .filter({ hasText: "Compare" })
    .first();
  if (await fresh.count()) {
    await fresh.scrollIntoViewIfNeeded().catch(() => {});
    await fresh.click().catch(() => {});
    added++;
    await page.waitForTimeout(200);
  }
}
console.log(`added ${added} services to compare`);

// Clear the search so the page is clean behind the modal.
await search.fill("");
await page.waitForTimeout(400);

// Open the compare modal via the tray's Compare button.
const trayCompare = page.getByRole("button", { name: /^Compare/ }).last();
await trayCompare.click();
await page.waitForTimeout(900);
await page.screenshot({ path: path.join(OUT, "compare.png") });
console.log("captured compare.png");

// Close modal for a clean directory shot.
await page.keyboard.press("Escape");
await page.waitForTimeout(400);

// 3) Directory grid shot: scroll to the cards.
await page.evaluate(() => {
  document.getElementById("browse")?.scrollIntoView();
  window.scrollBy(0, 220);
});
await page.waitForTimeout(700);
await page.screenshot({ path: path.join(OUT, "directory.png") });
console.log("captured directory.png");

// 4) Mobile hero.
const mpage = await ctx.newPage();
await mpage.setViewportSize({ width: 390, height: 844 });
await mpage.goto(BASE, { waitUntil: "load" });
await mpage.waitForTimeout(1200);
await mpage.screenshot({ path: path.join(OUT, "mobile.png") });
console.log("captured mobile.png");

await browser.close();
console.log("done");
