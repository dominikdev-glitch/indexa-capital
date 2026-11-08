import { chromium } from "playwright";

const browser = await chromium.launch({ headless: true });
const page = await browser.newPage({
  viewport: { width: 1200, height: 630 },
  deviceScaleFactor: 1,
});
await page.goto("file:///workspace/.grok/og-card.html", { waitUntil: "load" });
await page.evaluate(async () => {
  await document.fonts.ready;
});
const metrics = await page.evaluate(() => {
  const box = (id) => {
    const r = document.getElementById(id).getBoundingClientRect();
    return { x: r.x, y: r.y, w: r.width, h: r.height };
  };
  return {
    title: box("title"),
    tag: box("tag"),
    rule: box("rule"),
    fonts: [...document.fonts].map((f) => `${f.family} ${f.weight} ${f.status}`),
  };
});
console.log(JSON.stringify(metrics, null, 2));
await page.screenshot({ path: "/workspace/.grok/og-raw.png", type: "png" });

const icon = await browser.newPage({
  viewport: { width: 128, height: 48 },
  deviceScaleFactor: 2,
});
await icon.goto("file:///workspace/.grok/favicon-preview.html", { waitUntil: "load" });
await icon.screenshot({ path: "/workspace/.grok/favicon-preview.png", type: "png" });
await browser.close();
