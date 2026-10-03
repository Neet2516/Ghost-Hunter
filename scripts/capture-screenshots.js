import puppeteer from 'puppeteer-core';
import path from 'node:path';
import { fileURLToPath } from 'node:url';

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);
const rootDir = path.resolve(__dirname, '..');
const outDir = path.resolve(rootDir, 'docs/screenshots');

const pages = [
  {
    name: 'landing_page.png',
    url: 'http://localhost:3006',
    width: 1280,
    height: 900,
    waitMs: 1500,
  },
  {
    name: 'dashboard_applications.png',
    url: 'http://localhost:3006/app/applications',
    width: 1280,
    height: 1050,
    waitMs: 2500,
  },
  {
    name: 'review_draft_panel.png',
    url: 'http://localhost:3006/app/applications/22222222-2222-4222-8222-222222222222',
    width: 1280,
    height: 1250,
    waitMs: 3000,
  },
  {
    name: 'sentinel_telemetry_orbit.png',
    url: 'http://localhost:3006/app/applications/11111111-1111-4111-8111-111111111111',
    width: 1280,
    height: 1250,
    waitMs: 3000,
  },
  {
    name: 'notifications_feed.png',
    url: 'http://localhost:3006/app/notifications',
    width: 1280,
    height: 900,
    waitMs: 2500,
  },
];

async function capture() {
  console.log('Launching Chrome from /usr/bin/google-chrome...');
  const browser = await puppeteer.launch({
    executablePath: '/usr/bin/google-chrome',
    headless: true,
    args: ['--no-sandbox', '--disable-setuid-sandbox', '--disable-gpu'],
  });

  const page = await browser.newPage();

  for (const item of pages) {
    const dest = path.resolve(outDir, item.name);
    console.log(`Navigating to ${item.url}...`);
    await page.setViewport({ width: item.width, height: item.height });
    await page.goto(item.url, { waitUntil: 'networkidle0', timeout: 15000 }).catch(() => {});
    await new Promise((resolve) => setTimeout(resolve, item.waitMs));

    await page.screenshot({ path: dest });
    console.log(`✔ Captured ${item.name}`);
  }

  await browser.close();
  console.log('All real screenshots captured successfully!');
}

capture().catch((err) => {
  console.error('Screenshot capture failed:', err);
  process.exit(1);
});
