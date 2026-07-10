import puppeteer from 'puppeteer';

const URL = process.env.URL || 'https://resonantwebdesign.com/services/system-integrations/';

function sleep(ms) {
  return new Promise((r) => setTimeout(r, ms));
}

const browser = await puppeteer.launch({
  headless: true,
  args: ['--autoplay-policy=no-user-gesture-required', '--no-sandbox'],
});

const page = await browser.newPage();
await page.goto(URL, { waitUntil: 'domcontentloaded', timeout: 60000 });
await page.click('body');
await page.waitForFunction(() => {
  const v = document.getElementById('integrations-hero-video');
  return v && v.duration > 0;
}, { timeout: 60000 });

const samples = [];
for (let i = 0; i < 80; i++) {
  await sleep(500);
  samples.push(await page.evaluate(() => {
    const v = document.getElementById('integrations-hero-video');
    return {
      t: Number(v.currentTime.toFixed(3)),
      paused: v.paused,
      loop: v.loop,
    };
  }));
}

const D = 10.04;
let firstMidPause = -1;
let firstEndPause = -1;
let firstCycleReachedMidWhilePlaying = false;
let sawForwardPastMid = false;

for (let i = 0; i < samples.length; i++) {
  const s = samples[i];
  if (!s.paused && s.t >= D - 0.2 && s.t <= D + 0.5) sawForwardPastMid = true;
  if (firstMidPause < 0 && s.paused && s.t >= D - 0.25 && s.t <= D + 0.35) firstMidPause = i;
  if (firstEndPause < 0 && s.paused && s.t > 19.8) firstEndPause = i;
}

for (let i = 1; i < samples.length; i++) {
  const a = samples[i - 1];
  const b = samples[i];
  if (a.t < 8 && b.t > 12 && !b.paused) {
    firstCycleReachedMidWhilePlaying = true;
  }
}

console.log('firstMidPauseIndex', firstMidPause, 'firstEndPauseIndex', firstEndPause);
console.log('skippedMidJump', firstCycleReachedMidWhilePlaying);
console.log('timeline', samples.map((s) => (s.paused ? 'P' + s.t : s.t)).join(' '));

const errors = [];
if (firstMidPause < 0) errors.push('never paused at midpoint');
if (firstEndPause < 0) errors.push('never paused at end');
if (firstCycleReachedMidWhilePlaying) errors.push('first cycle jumped past midpoint without hold');
if (firstMidPause >= 0 && firstEndPause >= 0 && firstMidPause > firstEndPause) {
  errors.push('mid pause happened after end pause on first cycle');
}

if (errors.length) {
  console.error('FAIL:', errors.join('; '));
  await browser.close();
  process.exit(1);
}

console.log('PASS: first cycle holds at mid then end');
await browser.close();