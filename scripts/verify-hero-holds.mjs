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

function hasIhsRateCore(source) {
  return (
    source.includes('var CRUISE = 0.65, EASE = 4, MINRATE = 0.04') &&
    source.includes('smoothstep(d / EASE)') &&
    source.includes('Math.min(t, Math.abs(t - D), BOOM - t)')
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
assert(hasIhsRateCore(source), 'IHS smoothstep rate core must remain intact');
assert(source.includes('HOLD_MS = 3000'), '3 second holds must be configured');
console.log('PASS: IHS rate core preserved with hold layer');
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
  assert(opening.loop === false, 'loop must be manual so end holds can run');

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
  assert(moving.length >= 3, 'video should keep moving with IHS easing between holds');
  console.log('PASS: motion continues between holds');

  const meta = await page.evaluate(() => {
    const video = document.getElementById('integrations-hero-video');
    return { duration: video.duration };
  });

  await page.evaluate((duration) => {
    const video = document.getElementById('integrations-hero-video');
    video.pause();
    video.currentTime = duration - 0.02;
    video.dispatchEvent(new Event('ended'));
  }, meta.duration);

  await sleep(200);

  const endHold = await page.evaluate(() => {
    const video = document.getElementById('integrations-hero-video');
    return { paused: video.paused, currentTime: video.currentTime };
  });
  console.log('End hold:', endHold);
  assert(endHold.paused === true, 'loop end should pause');
  assert(endHold.currentTime < 0.2, 'loop end should reset to opening frame');

  await sleep(HOLD_MS + 500);
  await page.click('body');

  const afterEnd = await page.evaluate(() => {
    const video = document.getElementById('integrations-hero-video');
    return { paused: video.paused, currentTime: video.currentTime, ended: video.ended };
  });
  console.log('After end hold:', afterEnd);
  assert(afterEnd.paused === false, 'video must restart after loop-end hold');
  assert(afterEnd.ended === false, 'video must not remain ended');

  await sleep(1200);
  const stillPlaying = await page.evaluate(() => {
    const video = document.getElementById('integrations-hero-video');
    return { paused: video.paused, currentTime: video.currentTime };
  });
  console.log('Still playing:', stillPlaying);
  assert(stillPlaying.paused === false, 'video should keep playing after loop restart');
  assert(stillPlaying.currentTime > afterEnd.currentTime, 'playback should advance after loop restart');

  console.log('PASS: browser verified opening hold, motion between holds, end hold, and loop restart');
} finally {
  await browser.close();
}