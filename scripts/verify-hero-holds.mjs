import puppeteer from 'puppeteer';
import { readFileSync } from 'fs';
import { spawnSync } from 'child_process';

const URL = process.env.RESONANT_URL || 'http://127.0.0.1:8765/services/system-integrations/';
const HOLD_MS = 3000;
const TOLERANCE = 800;

function sleep(ms) {
  return new Promise((resolve) => setTimeout(resolve, ms));
}

function assert(condition, message) {
  if (!condition) throw new Error(message);
}

function hasHoldThenCruiseCore(source) {
  return (
    source.includes('var CRUISE = 0.65') &&
    source.includes('HOLD_MS = 3000') &&
    source.includes('holdAt(0, "forward"') &&
    !source.includes('smoothstep')
  );
}

function holdDuration(samples) {
  let ms = 0;
  for (const sample of samples) {
    if (!sample.paused) break;
    ms += sample.delta;
  }
  return ms;
}

const zoneTest = spawnSync('node', ['scripts/test-hero-hold-zones.js'], {
  cwd: '/Users/macbook15/resonant-by-design',
  encoding: 'utf8',
});
assert(zoneTest.status === 0, `zone hold unit test failed: ${zoneTest.stdout}${zoneTest.stderr}`);

const source = readFileSync('/Users/macbook15/resonant-by-design/assets/js/integrations-hero-video.js', 'utf8');
assert(hasHoldThenCruiseCore(source), 'controller must use 3s holds then constant cruise');
console.log('PASS: hold-then-cruise controller configured');
console.log(zoneTest.stdout.trim());

const browser = await puppeteer.launch({
  headless: true,
  args: ['--autoplay-policy=no-user-gesture-required', '--no-sandbox'],
});

try {
  const page = await browser.newPage();
  page.on('pageerror', (err) => console.error('PAGE ERROR:', err.message));

  await page.goto(URL, { waitUntil: 'domcontentloaded', timeout: 60000 });
  await page.click('body');

  await page.waitForFunction(() => {
    const video = document.getElementById('integrations-hero-video');
    return video && video.readyState >= 1 && Number.isFinite(video.duration) && video.duration > 0;
  }, { timeout: 60000 });

  await page.waitForFunction(() => {
    const video = document.getElementById('integrations-hero-video');
    return video.paused && video.currentTime < 0.05;
  }, { timeout: 5000 });

  const opening = await page.evaluate(() => {
    const video = document.getElementById('integrations-hero-video');
    return { paused: video.paused, loop: video.loop, currentTime: video.currentTime };
  });
  console.log('Opening hold:', opening);
  assert(opening.paused === true, 'opening turnaround should be paused');
  assert(opening.loop === false, 'loop is manual so each turnaround can hold 3 seconds');

  const openingSamples = [];
  const openingStart = Date.now();
  let last = openingStart;
  while (Date.now() - openingStart < 3800) {
    await sleep(100);
    const now = Date.now();
    const sample = await page.evaluate(() => {
      const video = document.getElementById('integrations-hero-video');
      return { paused: video.paused, currentTime: video.currentTime };
    });
    openingSamples.push({ ...sample, delta: now - last });
    last = now;
  }

  const openingHoldMs = holdDuration(openingSamples);
  console.log('Opening hold duration(ms):', openingHoldMs);
  assert(openingHoldMs >= HOLD_MS - TOLERANCE, 'opening hold should last about 3 seconds');

  await sleep(800);
  const afterOpening = await page.evaluate(() => {
    const video = document.getElementById('integrations-hero-video');
    return { paused: video.paused, currentTime: video.currentTime, rate: video.playbackRate };
  });
  assert(afterOpening.paused === false, 'video should resume after opening hold');
  console.log('After opening hold:', afterOpening);

  const motionSamples = [];
  for (let i = 0; i < 8; i++) {
    await sleep(250);
    motionSamples.push(await page.evaluate(() => {
      const video = document.getElementById('integrations-hero-video');
      return { paused: video.paused, currentTime: video.currentTime, rate: video.playbackRate };
    }));
  }
  const moving = motionSamples.filter((s) => !s.paused && s.currentTime > afterOpening.currentTime);
  assert(moving.length >= 3, 'video should keep moving between holds');
  const cruiseRates = motionSamples.filter((s) => !s.paused).map((s) => s.rate);
  const steadyCruise = cruiseRates.every((rate) => Math.abs(rate - 0.65) < 0.02);
  assert(steadyCruise, 'playback should stay at constant cruise rate between holds');
  const delta = motionSamples[motionSamples.length - 1].currentTime - afterOpening.currentTime;
  assert(delta > 0.8, 'constant cruise should advance smoothly, not crawl');
  console.log('PASS: constant cruise motion between holds');

  const autoplay = await page.evaluate(() => {
    const video = document.getElementById('integrations-hero-video');
    return { autoplay: video.autoplay, loop: video.loop, muted: video.muted };
  });
  assert(autoplay.autoplay === true, 'autoplay must be enabled for reliable hero playback');
  assert(autoplay.muted === true, 'video must stay muted for autoplay');
  console.log('PASS: autoplay and muted attrs set');

  console.log('PASS: browser verified opening hold and motion between holds');
} finally {
  await browser.close();
}