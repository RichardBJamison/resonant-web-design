import puppeteer from 'puppeteer';

const URL = process.env.HERO_URL || 'http://127.0.0.1:8765/services/system-integrations/';
const HOLD_MS = 3000;

function sleep(ms) {
  return new Promise((resolve) => setTimeout(resolve, ms));
}

function assert(condition, message) {
  if (!condition) {
    throw new Error(message);
  }
}

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
  }, { timeout: 30000 });

  await page.waitForFunction(() => {
    const video = document.getElementById('integrations-hero-video');
    return video.paused && video.currentTime < 0.05;
  }, { timeout: 5000 });

  const meta = await page.evaluate(() => {
    const video = document.getElementById('integrations-hero-video');
    return {
      duration: video.duration,
      loop: video.loop,
      autoplay: video.autoplay,
    };
  });

  console.log('Video meta:', meta);
  assert(meta.loop === false, 'loop must be disabled for manual looping');
  assert(meta.autoplay === false, 'autoplay must be disabled so controller owns playback');

  const openingHold = await page.evaluate(() => {
    const video = document.getElementById('integrations-hero-video');
    return { paused: video.paused, currentTime: video.currentTime };
  });

  console.log('Opening hold:', openingHold);
  assert(openingHold.paused === true, 'video should pause for opening hold');

  await sleep(HOLD_MS + 600);
  await page.click('body');

  const afterOpeningHold = await page.evaluate(() => {
    const video = document.getElementById('integrations-hero-video');
    return { paused: video.paused, currentTime: video.currentTime, rate: video.playbackRate };
  });

  console.log('After opening hold:', afterOpeningHold);
  assert(afterOpeningHold.paused === false, 'video should resume after opening hold');
  assert(afterOpeningHold.rate >= 0.0625 && afterOpeningHold.rate <= 0.08, 'playback rate should stay in supported slow range');

  await page.evaluate(async () => {
    const video = document.getElementById('integrations-hero-video');
    video.dataset.forceFast = '1';
    video.playbackRate = 16;
    await video.play();
  });

  await page.waitForFunction(() => {
    const video = document.getElementById('integrations-hero-video');
    return video.paused && video.currentTime < 0.2;
  }, { timeout: 20000 });

  const endHold = await page.evaluate(() => {
    const video = document.getElementById('integrations-hero-video');
    return { paused: video.paused, currentTime: video.currentTime };
  });

  console.log('End hold after natural playback:', endHold);
  assert(endHold.paused === true, 'video should pause for end hold after completing a cycle');
  assert(endHold.currentTime < 0.2, 'end hold should reset to opening frame');

  await sleep(HOLD_MS + 600);
  await page.click('body');

  const afterEndHold = await page.evaluate(() => {
    const video = document.getElementById('integrations-hero-video');
    return { paused: video.paused, currentTime: video.currentTime, ended: video.ended, rate: video.playbackRate };
  });

  console.log('After end hold (loop restart):', afterEndHold);
  assert(afterEndHold.paused === false, 'video must resume after end hold (loop restart)');
  assert(afterEndHold.ended === false, 'video must not remain ended after loop restart');

  await sleep(1500);
  await page.click('body');

  const stillPlaying = await page.evaluate(() => {
    const video = document.getElementById('integrations-hero-video');
    return { paused: video.paused, currentTime: video.currentTime };
  });

  console.log('Still playing after loop restart:', stillPlaying);
  assert(stillPlaying.paused === false, 'video must keep playing after loop restart');
  assert(stillPlaying.currentTime > afterEndHold.currentTime, 'video time should advance after loop restart');

  console.log('PASS: opening hold, natural end hold, and loop restart verified in browser');
} finally {
  await browser.close();
}