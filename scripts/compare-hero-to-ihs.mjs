import puppeteer from 'puppeteer';
import { readFileSync } from 'fs';

const IHS_URL = process.env.IHS_URL || 'http://127.0.0.1:8766/';
const RESONANT_URL = process.env.RESONANT_URL || 'http://127.0.0.1:8765/services/system-integrations/';
const SAMPLE_MS = 200;
const DURATION_MS = 12000;

function sleep(ms) {
  return new Promise((resolve) => setTimeout(resolve, ms));
}

function assert(condition, message) {
  if (!condition) throw new Error(message);
}

function extractIhsController(source) {
  const blocks = [...source.matchAll(/\(function \(\) \{[\s\S]*?\}\)\(\);/g)].map((m) => m[0]);
  const match = blocks.find((block) => block.includes('var CRUISE = 0.65'));
  assert(match, 'IHS video controller block not found');
  return match;
}

function extractResonantController() {
  const body = readFileSync('/Users/macbook15/resonant-by-design/assets/js/integrations-hero-video.js', 'utf8');
  const match = body.match(/\(function \(\) \{[\s\S]*?\}\)\(\);/);
  assert(match, 'Resonant controller block not found');
  return match[0];
}

function normalizeController(code) {
  return code
    .replace(/getElementById\(["'][^"']+["']\)/g, 'getElementById("VIDEO")')
    .replace(/\s+/g, ' ')
    .trim();
}

async function samplePage(page, videoId) {
  await page.waitForFunction((id) => {
    const video = document.getElementById(id);
    return video && video.readyState >= 1 && Number.isFinite(video.duration) && video.duration > 0;
  }, { timeout: 60000 }, videoId);

  await page.click('body');
  await sleep(1000);

  const samples = [];
  const start = Date.now();
  while (Date.now() - start < DURATION_MS) {
    const sample = await page.evaluate((id) => {
      const video = document.getElementById(id);
      return {
        t: video.currentTime,
        rate: video.playbackRate,
        paused: video.paused,
        loop: video.loop,
        autoplay: video.autoplay,
      };
    }, videoId);
    samples.push(sample);
    await sleep(SAMPLE_MS);
  }
  return samples;
}

function summarize(label, samples) {
  const rates = samples.map((s) => s.rate);
  const pausedCount = samples.filter((s) => s.paused).length;
  const loopWraps = samples.filter((s, i) => i > 0 && s.t + 1 < samples[i - 1].t).length;
  console.log(`${label}: samples=${samples.length} paused=${pausedCount} loop-wraps=${loopWraps} rate[min=${Math.min(...rates).toFixed(3)} max=${Math.max(...rates).toFixed(3)}] loop=${samples[0].loop} autoplay=${samples[0].autoplay}`);
  return { pausedCount, loopWraps, minRate: Math.min(...rates), maxRate: Math.max(...rates), loop: samples[0].loop, autoplay: samples[0].autoplay };
}

const ihsHtml = readFileSync('/Users/macbook15/Desktop/Intelligent Hospitality systems/index.html', 'utf8');
const ihsController = extractIhsController(ihsHtml);
const resonantController = extractResonantController();
assert(
  normalizeController(ihsController) === normalizeController(resonantController),
  'Controller logic must match IHS aside from element id'
);
console.log('PASS: controller source matches IHS underconstruction page');

const browser = await puppeteer.launch({
  headless: true,
  args: ['--autoplay-policy=no-user-gesture-required', '--no-sandbox'],
});

try {
  const ihsPage = await browser.newPage();
  await ihsPage.goto(IHS_URL, { waitUntil: 'domcontentloaded', timeout: 60000 });
  const ihsSamples = await samplePage(ihsPage, 'bgvideo');
  const ihs = summarize('IHS', ihsSamples);

  const resonantPage = await browser.newPage();
  await resonantPage.goto(RESONANT_URL, { waitUntil: 'domcontentloaded', timeout: 60000 });
  const resonantSamples = await samplePage(resonantPage, 'integrations-hero-video');
  const resonant = summarize('Resonant', resonantSamples);

  assert(ihs.pausedCount < 4, 'IHS video should stay playing');
  assert(resonant.pausedCount < 4, 'Resonant video should stay playing');
  assert(ihs.loopWraps >= 0, 'IHS should keep moving');
  assert(resonant.loopWraps >= 0, 'Resonant should keep moving');
  assert(resonant.loop === true, 'Resonant must use native loop like IHS');
  assert(resonant.autoplay === true, 'Resonant must autoplay like IHS');
  assert(Math.abs(ihs.minRate - resonant.minRate) < 0.2, `Min rates should match (ihs=${ihs.minRate}, resonant=${resonant.minRate})`);
  assert(Math.abs(ihs.maxRate - resonant.maxRate) < 0.2, `Max rates should match (ihs=${ihs.maxRate}, resonant=${resonant.maxRate})`);

  console.log('PASS: Resonant hero matches IHS underconstruction movement model');
} finally {
  await browser.close();
}