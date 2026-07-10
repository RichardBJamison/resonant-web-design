import puppeteer from 'puppeteer';
import { readFileSync } from 'fs';
import { spawnSync } from 'child_process';

const URL = process.env.RESONANT_URL || 'http://127.0.0.1:8765/services/system-integrations/';
const HOLD_MS = 1000;
const TOLERANCE = 400;

function sleep(ms) {
  return new Promise((resolve) => setTimeout(resolve, ms));
}

function assert(condition, message) {
  if (!condition) throw new Error(message);
}

function hasHoldThenCruiseCore(source) {
  return (
    source.includes('var CRUISE = 0.65') &&
    source.includes('HOLD_MS = 1000') &&
    source.includes('lastT < D && t >= D') &&
    source.includes('beginHold(startReverseLeg)')
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

  await page.goto(URL, { waitUntil: 'load', timeout: 60000 });
  await page.click('body');

  await page.waitForFunction(() => {
    const video = document.getElementById('integrations-hero-video');
    return video && video.readyState >= 1 && Number.isFinite(video.duration) && video.duration > 0;
  }, { timeout: 60000 });

  const openingSamples = [];
  const openingStart = Date.now();
  let last = openingStart;
  while (Date.now() - openingStart < 1800) {
    await sleep(50);
    const now = Date.now();
    const sample = await page.evaluate(() => {
      const video = document.getElementById('integrations-hero-video');
      return { paused: video.paused, currentTime: video.currentTime, loop: video.loop };
    });
    openingSamples.push({ ...sample, delta: now - last });
    last = now;
  }

  const opening = openingSamples.find((s) => s.paused && s.currentTime < 0.05) || openingSamples[0];
  console.log('Opening hold:', opening);
  assert(opening.paused === true, 'opening turnaround should be paused');
  assert(opening.loop === false, 'loop must be manual for precise turnaround holds');

  const openingHoldMs = openingSamples.reduce((ms, sample) => {
    if (!sample.paused || sample.currentTime > 0.05) return ms;
    return ms + sample.delta;
  }, 0);
  console.log('Opening hold duration(ms):', openingHoldMs);
  assert(
    openingHoldMs >= 300,
    'opening hold should pause at start (full timing checked in verify-hero-cycle.mjs)'
  );

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

  const attrs = await page.evaluate(() => {
    const video = document.getElementById('integrations-hero-video');
    return { autoplay: video.autoplay, loop: video.loop, muted: video.muted };
  });
  assert(attrs.autoplay === false, 'script must own playback start to avoid racing native loop');
  assert(attrs.loop === false, 'loop must stay manual');
  assert(attrs.muted === true, 'video must stay muted');
  console.log('PASS: script-controlled playback attrs');

  console.log('PASS: browser verified opening hold and motion between holds');
} finally {
  await browser.close();
}